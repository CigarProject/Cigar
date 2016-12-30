(function(wHandle, wjQuery) {
    var CONNECT_TO,
        SKIN_URL = "./skins/",
        USE_HTTPS = "https:" == wHandle.location.protocol,
        BORDER_DEFAULT = {
            top: -2E3,
            left: -2E3,
            right: 2E3,
            bottom: 2E3
        },
        SEND_254 = new Uint8Array([254, 6, 0, 0, 0]),
        SEND_255 = new Uint8Array([255, 1, 0, 0, 0]),
        ws,
        disconnectDelay = 1;

    function Disconnect() {
        if (!ws) return;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        try {
            ws.close();
        } catch (e) { info.warn("Error on disconnect", e)}
        ws = null;
        resetGameVariables();
    }

    function resetGameVariables() {
        nodesID = { };
        nodes = [];
        myNodes = [];
        leaderboard = [];
        leaderboardType = "none";
        centerX = 0;
        centerY = 0;
        border = BORDER_DEFAULT;
        knownSkins = [];
        loadedSkins = [];
        viewZoom = 1;
        userName = "";
        teamColors = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
        chatText = "";
        _sizeChange = false;
    }

    function Connect(to) {
        if (ws) Disconnect();
        wjQuery("#connecting").show();
        ws = new WebSocket((USE_HTTPS ? "uws://" : "ws://") + to);
        ws.binaryType = "arraybuffer";
        ws.onopen = WsOpen;
        ws.onmessage = WsMessage;
        ws.onclose = WsClose;
        log.debug("Connecting to " + wsUrl);
    }

    function WsOpen() {
        disconnectDelay = 1;
        wjQuery("#connecting").hide();
        WsSend(SEND_254);
        WsSend(SEND_255);
        log.debug("Connected to " + CONNECT_TO);
        log.debug("HTTPS: " + USE_HTTPS);
    }

    function WsMessage(data) {

    }

    function WsClose() {
        log.info("Disconnected");
    }

    function WsSend(data) {
        if (ws) {
            ws.send(data);
        }
    }

    function Play() {

    }

    // Game variables
    var nodesID = { },
        nodes = [],
        myNodes = [],
        leaderboard = [],
        leaderboardType = -1, // 0 - FFA list, 1 - Pie chart, 2 - Text list
        centerX = 0,
        centerY = 0,
        mouseX = 0,
        mouseY = 0,
        border = BORDER_DEFAULT,
        knownSkins = [],
        loadedSkins = [],
        drawZoom = 1,
        mouseZoom = 1,
        userName = "",
        teamColors = ["#333333", "#FF3333", "#33FF33", "#3333FF"],
        chatText = "",
        _sizeChange = false,
        isTyping = false,
        mainCanvas = document.getElementById('canvas'),
        mainCtx = mainCanvas.getContext('2d'),
        lastDrawTime: +new Date,
        escOverlay = true,
        pressed = {
            space: false,
            w: false,
            e: false,
            r: false,
            t: false,
            q: false,
            esc: false
        };

    // Client variables
    var settings = {
        touchable: 'createTouch' in document,
        showMass: false,
        showNames: true,
        showLeaderboard: true,
        showChat: true,
        showGrid: true,
        showColor: true,
        showSkins: true,
        darkTheme: false,
        fastRenderMax: 0.4,
        maxScore: 0
    };

    // Load local storage
    if (null != wHandle.localStorage) {
        wjQuery(window).load(function() {
            wjQuery(".save").each(function() {
                var id = $(this).data("box-id");
                var value = wHandle.localStorage.getItem("checkbox-" + id);
                if (value && value == "true" && 0 != id) {
                    $(this).prop("checked", "true");
                    $(this).trigger("change");
                } else if (id == 0 && value != null) {
                    $(this).val(value);
                }
            });
            wjQuery(".save").change(function() {
                var id = $(this).data('box-id');
                var value = (id == 0) ? $(this).val() : $(this).prop('checked');
                wHandle.localStorage.setItem("checkbox-" + id, value);
            });
        });
        if (null == wHandle.localStorage.AB8) {
            wHandle.localStorage.AB8 = ~~(100 * Math.random());
        }
    }

    // Load known skin list
    wjQuery.ajax({
        type: "POST",
        dataType: "json",
        url: "checkdir.php",
        data: {
            "action": "getSkins"
        },
        success: function(data) {
            response = JSON.parse(data["names"]);
            for (var i = 0; i < response.length; i++) {
                if (-1 == knownSkins.indexOf(response[i])) {
                    knownSkins.push(response[i]);
                }
            }
        }
    });

    function hideESCOverlay() {
        escOverlay = false;
        wjQuery("#overlays").hide();
    }

    function showESCOverlay(arg) {
        escOverlay = true;
        userNickName = null;
        wjQuery("#overlays").fadeIn(arg ? 200 : 3E3);
    }

    function loadInit() {
        log.info("Loaded");
    }

    function draw() {
        // Zoom update
        for (var newdrawZoom = 0, i = 0, l = myCells.length; i < l; i++) drawZoom += myCells[i].size;
        newdrawZoom = Math.pow(Math.min(64 / newdrawZoom, 1), .4) * viewMultiplier();
        drawZoom = (9 * drawZoom + newdrawZoom) / 10;
    }

    function viewMultiplier() {
        var ratio;
        ratio = Math.max(canvasHeight / 1080, canvasWidth / 1920);
        return ratio * mouseZoom;
    }

    function drawGrid() {
        if (!settings.drawGrid) return;
        mainCtx.fillStyle = showDarkTheme ? "#111111" : "#F2FBFF";
        mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        mainCtx.save();
        mainCtx.strokeStyle = showDarkTheme ? "#AAAAAA" : "#000000";
        mainCtx.globalAlpha = .2;
        mainCtx.scale(viewZoom, viewZoom);
        var a = canvas.width / viewZoom,
            b = canvas.height / viewZoom;
        for (var c = 0; c < a; c += 50) {
            mainCtx.moveTo(c, 0);
            mainCtx.lineTo(c, b);
        }
        for (c = -.5 + (-nodeY + b / 2) % 50; c < b; c += 50) {
            mainCtx.moveTo(0, c);
            mainCtx.lineTo(a, c);
        }
        mainCtx.stroke();
        mainCtx.restore();
    }

    function Cell(id, x, y, size, name, color, skin, tick, flags) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.name = name;
        this.color = color;
        this.skin = skin;
        this.timeStamp = tick;
        this.nUpd = 0;
        if (flags) {
            this.isEjected = flags & 0x20;
            this.isVirus = flags & 0x01;
            this.isAgitated = flags & 0x10;
        }
    }

    Cell.prototype = {
        id: 0,
        x: 0,
        y: 0,
        size: 0,
        name: 0,
        color: "#FFFFFF",
        skin: "",
        timeStamp: -1,
        nx: 0,
        ny: 0,
        nsize: 0,
        isEjected: false,
        isPellet: false,
        isVirus: false,
        isAgitated: false,
        strokeColor: "#AAAAAA",
        _nameChanged: false,
        _nameTxt: null,
        _massTxt: null,
        setPos: function(x, y, dt) {
            // dt = (tick - this.timeStamp) / 120;
            this.x += (x - this.x) * dt;
            this.y += (y - this.y) * dt;
            this.nx = x;
            this.ny = y;
        },
        setSize: function(size, dt) {
            // dt = (tick - this.timeStamp) / 120;
            this.size += (size - this.size) * dt;
            this.nsize = size;
        },
        setName: function(name) {
            this._nameChanged = true;
            this.name = name;
        }
    };

    // wHandle functions
    function handleWheel(event) {
        zoom *= Math.pow(.9, event.wheelDelta / -120 || event.detail || 0);
        1 > zoom && (zoom = 1);
        zoom > 4 / viewZoom && (zoom = 4 / viewZoom)
    }
    wHandle.setserver = function(arg) {
        if (CONNECT_TO != arg) {
            Disconnect();
            Connect(CONNECT_TO = arg);
        }
    };
    wHandle.setDarkTheme = function(a) {
        settings.darkTheme = a;
    };
    // Mouse wheel
    if (/firefox/i.test(navigator.userAgent)) {
        document.addEventListener("DOMMouseScroll", handleWheel, false);
    } else {
        document.body.onmousewheel = handleWheel;
    }
    wHandle.onkeydown = function(event) {
        switch (event.keyCode) {
            case 13: // enter
                if (isTyping && settings.showChat) {
                    isTyping = false;
                    var chat = document.getElementById("chat_textbox");
                    chat.blur();
                    var chattxt = chat.value;
                    if (chattxt.length > 0) sendChat(chattxt);
                    chat.value = "";
                } else {
                    if (!escOverlay) {
                        document.getElementById("chat_textbox").focus();
                        isTyping = true;
                    }
                }
                break;
            case 32: // space

                break;
            case 87: // W

                break;
            case 81: // Q

                break;
            case 69: // E

                break;
            case 82: // R

                break;
            case 84: // T

                break;
            case 80: // P

                break;
            case 27: // esc
                showESCOverlay(true);
                break;
        }
    };
    wHandle.onload = loadInit;
})(window, window.jQuery);
