(function(window, $) {
  function Init() {
    g_drawLines = true;
    PlayerStats();
    setInterval(PlayerStats, 180000);
    g_canvas = g_canvas_ = document.getElementById('canvas');
    g_context = g_canvas.getContext('2d');
    g_canvas.onmousedown = function(event) {
      if (g_touchCapable) {
        var deltaX = event.clientX - (5 + text / 5 / 2);
        var deltaY = event.clientY - (5 + text / 5 / 2);
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= text / 5 / 2) {
          SendPos();
          SendCmd(17);
          return;
        }
      }
      g_mouseX = 1 * event.clientX;
      g_mouseY = 1 * event.clientY;
      UpdatePos();
      SendPos();
    };
    g_canvas.onmousemove = function(event) {
      g_mouseX = 1 * event.clientX;
      g_mouseY = 1 * event.clientY;
      UpdatePos();
    };
    g_canvas.onmouseup = function() {};
    if (/firefox/i.test(navigator.userAgent)) {
      document.addEventListener('DOMMouseScroll', WheelHandler, false);
    } else {
      document.body.onmousewheel = WheelHandler;
    }
    var spaceDown = false;
    var cachedSkin = false;
    var wkeyDown = false;
    window.onkeydown = function(event) {
      if (!(32 != event.keyCode || spaceDown)) {
        SendPos();
        SendCmd(17);
        spaceDown = true;
      }
      if (!(81 != event.keyCode || cachedSkin)) {
        SendCmd(18);
        cachedSkin = true;
      }
      if (!(87 != event.keyCode || wkeyDown)) {
        SendPos();
        SendCmd(21);
        wkeyDown = true;
      }
      if (27 == event.keyCode) {
        __unmatched_10(300);
      }
    };
    window.onkeyup = function(event) {
      if (32 == event.keyCode) {
        spaceDown = false;
      }
      if (87 == event.keyCode) {
        wkeyDown = false;
      }
      if (81 == event.keyCode && cachedSkin) {
        SendCmd(19);
        cachedSkin = false;
      }
    };
    window.onblur = function() {
      SendCmd(19);
      wkeyDown = cachedSkin = spaceDown = false;
    };
    window.onresize = ResizeHandler;
    window.requestAnimationFrame(__unmatched_138);
    setInterval(SendPos, 40);
    if (g_region) {
      $('#region').val(g_region);
    }
    SyncRegion();
    SetRegion($('#region').val());
    if (0 == __unmatched_116 && g_region) {
      Start();
    }
    __unmatched_10(0);
    ResizeHandler();
    if (window.location.hash && 6 <= window.location.hash.length) {
      RenderLoop(window.location.hash);
    }
  }
  function WheelHandler(event) {
    g_zoom *= Math.pow(0.9, event.wheelDelta / -120 || event.detail || 0);
    if (1 > g_zoom) {
      g_zoom = 1;
    }
    if (g_zoom > 4 / g_scale) {
      g_zoom = 4 / g_scale;
    }
  }
  function UpdateTree() {
    if (0.4 > g_scale) {
      g_pointTree = null;
    } else {
      for (var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, i = 0; i < g_cells.length; i++) {
        var cell = g_cells[i];
        if (!(!cell.H() || cell.M || 20 >= cell.size * g_scale)) {
          minX = Math.min(cell.x - cell.size, minX);
          minY = Math.min(cell.y - cell.size, minY);
          maxY = Math.max(cell.x + cell.size, maxY);
          maxX = Math.max(cell.y + cell.size, maxX);
        }
      }
      g_pointTree = QTreeFactory.X({
        ba: minX - 10,
        ca: minY - 10,
        Z: maxY + 10,
        $: maxX + 10,
        fa: 2,
        ha: 4
      });
      for (i = 0; i < g_cells.length; i++) {
        if (cell = g_cells[i], cell.H() && !(20 >= cell.size * g_scale)) {
          for (minX = 0; minX < cell.a.length; ++minX) {
            minY = cell.a[minX].x;
            maxY = cell.a[minX].y;
            if (!(minY < g_viewX - text / 2 / g_scale || maxY < g_viewY - noClip / 2 / g_scale || minY > g_viewX + text / 2 / g_scale || maxY > g_viewY + noClip / 2 / g_scale)) {
              g_pointTree.Y(cell.a[minX]);
            }
          }
        }
      }
    }
  }
  function UpdatePos() {
    g_moveX = (g_mouseX - text / 2) / g_scale + g_viewX;
    g_moveY = (g_mouseY - noClip / 2) / g_scale + g_viewY;
  }
  function PlayerStats() {
    if (null == g_regionLabels) {
      g_regionLabels = {};
      $('#region').children().each(function() {
        var $this = $(this);
        var val = $this.val();
        if (val) {
          g_regionLabels[val] = $this.text();
        }
      });
    }
    $.get(g_protocol + 'info', function(data) {
      var regionNumPlayers = {};
      var region;
      for (region in data.regions) {
        var region_ = region.split(':')[0];
        regionNumPlayers[region_] = regionNumPlayers[region_] || 0;
        regionNumPlayers[region_] += data.regions[region].numPlayers;
      }
      for (region in regionNumPlayers) {
        $('#region option[value="' + region + '"]').text(g_regionLabels[region] + ' (' + regionNumPlayers[region] + ' players)');
      }
    }, 'json');
  }
  function HideOverlay() {
    $('#adsBottom').hide();
    $('#overlays').hide();
    $('#stats').hide();
    $('#mainPanel').hide();
    __unmatched_150 = g_playerCellDestroyed = false;
    SyncRegion();
    __unmatched_14(window.aa.concat(window.ac));
  }
  function SetRegion(val) {
    if (val && val != g_region) {
      if ($('#region').val() != val) {
        $('#region').val(val);
      }
      g_region = window.localStorage.location = val;
      $('.region-message').hide();
      $('.region-message.' + val).show();
      $('.btn-needs-server').prop('disabled', false);
      if (g_drawLines) {
        Start();
      }
    }
  }
  function __unmatched_10(char) {
    if (!(g_playerCellDestroyed || __unmatched_150)) {
      g_nick = null;
      if (!__unmatched_125) {
        $('#adsBottom').show();
        $('#g300x250').hide();
        $('#a300x250').show();
      }
      __unmatched_13(__unmatched_125 ? window.ac : window.aa);
      __unmatched_125 = false;
      if (1000 > char) {
        qkeyDown = 1;
      }
      g_playerCellDestroyed = true;
      $('#mainPanel').show();
      if (0 < char) {
        $('#overlays').fadeIn(char);
      } else {
        $('#overlays').show();
      }
    }
  }
  function n(rect) {
    $('#helloContainer').attr('data-gamemode', rect);
    __unmatched_99 = rect;
    $('#gamemode').val(rect);
  }
  function SyncRegion() {
    if ($('#region').val()) {
      window.localStorage.location = $('#region').val();
    } else if (window.localStorage.location) {
      $('#region').val(window.localStorage.location);
    }
    if ($('#region').val()) {
      $('#locationKnown').append($('#region'));
    } else {
      $('#locationUnknown').append($('#region'));
    }
  }
  function __unmatched_13(__unmatched_183) {
    if (window.googletag) {
      window.googletag.cmd.push(function() {
        if (g_canRefreshAds) {
          g_canRefreshAds = false;
          setTimeout(function() {
            g_canRefreshAds = true;
          }, 60000 * g_refreshAdsCooldown);
          if (window.googletag && window.googletag.pubads && window.googletag.pubads().refresh) {
            window.googletag.pubads().refresh(__unmatched_183);
          }
        }
      });
    }
  }
  function __unmatched_14(__unmatched_184) {
    if (window.googletag && window.googletag.pubads && window.googletag.pubads().clear) {
      window.googletag.pubads().clear(__unmatched_184);
    }
  }
  function Render(__unmatched_185) {
    return window.i18n[__unmatched_185] || window.i18n_dict.en[__unmatched_185] || __unmatched_185;
  }
  function FindGame() {
    var __unmatched_186 = ++__unmatched_116;
    console.log('Find ' + g_region + __unmatched_99);
    $.ajax(g_protocol + 'findServer', {
      error: function() {
        setTimeout(FindGame, 1000);
      },
      success: function(point) {
        if (__unmatched_186 == __unmatched_116) {
          if (point.alert) {
            alert(point.alert);
          }
          Connect('ws://' + point.ip, point.token);
        }
      },
      dataType: 'json',
      method: 'POST',
      cache: false,
      crossDomain: true,
      data: (g_region + __unmatched_99 || '?') + '\n2200049715'
    });
  }
  function Start() {
    if (g_drawLines && g_region) {
      $('#connecting').show();
      FindGame();
    }
  }
  function Connect(address, ticket) {
    if (g_socket) {
      g_socket.onopen = null;
      g_socket.onmessage = null;
      g_socket.onclose = null;
      try {
        g_socket.close();
      } catch (exception) {}
      g_socket = null;
    }
    if (__unmatched_118.ip) {
      address = 'ws://' + __unmatched_118.ip;
    }
    if (null != __unmatched_129) {
      var __unmatched_190 = __unmatched_129;
      __unmatched_129 = function() {
        __unmatched_190(ticket);
      };
    }
    if (g_secure) {
      var parts = address.split(':');
      address = parts[0] + 's://ip-' + parts[1].replace(/\./g, '-').replace(/\//g, '') + '.tech.agar.io:' + +parts[2];
    }
    g_playerCellIds = [];
    g_playerCells = [];
    g_cellsById = {};
    g_cells = [];
    g_destroyedCells = [];
    g_scoreEntries = [];
    __unmatched_135 = g_scorePartitions = null;
    g_maxScore = 0;
    g_connectSuccessful = false;
    console.log('Connecting to ' + address);
    g_socket = new WebSocket(address);
    g_socket.binaryType = 'arraybuffer';
    g_socket.onopen = function() {
      var data;
      console.log('socket open');
      data = GetBuffer(5);
      data.setUint8(0, 254);
      data.setUint32(1, 5, true);
      SendBuffer(data);
      data = GetBuffer(5);
      data.setUint8(0, 255);
      data.setUint32(1, 2200049715, true);
      SendBuffer(data);
      data = GetBuffer(1 + ticket.length);
      data.setUint8(0, 80);
      for (var i = 0; i < ticket.length; ++i) {
        data.setUint8(i + 1, ticket.charCodeAt(i));
      }
      SendBuffer(data);
      RefreshAds();
    };
    g_socket.onmessage = MessageHandler;
    g_socket.onclose = CloseHandler;
    g_socket.onerror = function() {
      console.log('socket error');
    };
  }
  function GetBuffer(size) {
    return new DataView(new ArrayBuffer(size));
  }
  function SendBuffer(data) {
    g_socket.send(data.buffer);
  }
  function CloseHandler() {
    if (g_connectSuccessful) {
      g_retryTimeout = 500;
    }
    console.log('socket close');
    setTimeout(Start, g_retryTimeout);
    g_retryTimeout *= 2;
  }
  function MessageHandler(data) {
    Receive(new DataView(data.data));
  }
  function Receive(data) {
    function __unmatched_199() {
      for (var string = '';;) {
        var char = data.getUint16(pos, true);
        pos += 2;
        if (0 == char) {
          break;
        }
        string += String.fromCharCode(char);
      }
      return string;
    }
    var pos = 0;
    if (240 == data.getUint8(pos)) {
      pos += 5;
    }
    switch (data.getUint8(pos++)) {
      case 16:
        ParseCellUpdates(data, pos);
        break;
      case 17:
        g_viewX_ = data.getFloat32(pos, true);
        pos += 4;
        g_viewY_ = data.getFloat32(pos, true);
        pos += 4;
        g_scale_ = data.getFloat32(pos, true);
        pos += 4;
        break;
      case 20:
        g_playerCells = [];
        g_playerCellIds = [];
        break;
      case 21:
        g_linesY_ = data.getInt16(pos, true);
        pos += 2;
        g_linesX_ = data.getInt16(pos, true);
        pos += 2;
        if (!g_ready) {
          g_ready = true;
          g_linesX = g_linesY_;
          g_linesY = g_linesX_;
        }
        break;
      case 32:
        g_playerCellIds.push(data.getUint32(pos, true));
        pos += 4;
        break;
      case 49:
        if (null != g_scorePartitions) {
          break;
        }
        var num = data.getUint32(pos, true);
        var pos = pos + 4;
        g_scoreEntries = [];
        for (var i = 0; i < num; ++i) {
          var id = data.getUint32(pos, true);
          var pos = pos + 4;
          g_scoreEntries.push({
            id: id,
            name: __unmatched_199()
          });
        }
        UpdateLeaderboard();
        break;
      case 50:
        g_scorePartitions = [];
        num = data.getUint32(pos, true);
        pos += 4;
        for (i = 0; i < num; ++i) {
          g_scorePartitions.push(data.getFloat32(pos, true));
          pos += 4;
        }
        UpdateLeaderboard();
        break;
      case 64:
        g_minX = data.getFloat64(pos, true);
        pos += 8;
        g_minY = data.getFloat64(pos, true);
        pos += 8;
        g_maxX = data.getFloat64(pos, true);
        pos += 8;
        g_maxY = data.getFloat64(pos, true);
        pos += 8;
        g_viewX_ = (g_maxX + g_minX) / 2;
        g_viewY_ = (g_maxY + g_minY) / 2;
        g_scale_ = 1;
        if (0 == g_playerCells.length) {
          g_viewX = g_viewX_;
          g_viewY = g_viewY_;
          g_scale = g_scale_;
        }
        if (data.byteLength > pos) {
          data.getUint32(pos, true);
          pos += 4;
          __unmatched_119 = __unmatched_199();
          console.log('Server version ' + __unmatched_119);
        }
        break;
      case 81:
        var x = data.getUint32(pos, true);
        var pos = pos + 4;
        var __unmatched_205 = data.getUint32(pos, true);
        var pos = pos + 4;
        var __unmatched_206 = data.getUint32(pos, true);
        var pos = pos + 4;
        setTimeout(function() {
          __unmatched_46({
            d: x,
            e: __unmatched_205,
            c: __unmatched_206
          });
        }, 1200);
    }
  }
  function ParseCellUpdates(data, pos) {
    function __unmatched_211() {
      for (var string = '';;) {
        var id = data.getUint16(pos, true);
        pos += 2;
        if (0 == id) {
          break;
        }
        string += String.fromCharCode(id);
      }
      return string;
    }
    function __unmatched_212() {
      for (var __unmatched_227 = '';;) {
        var r = data.getUint8(pos++);
        if (0 == r) {
          break;
        }
        __unmatched_227 += String.fromCharCode(r);
      }
      return __unmatched_227;
    }
    __unmatched_111 = g_time = Date.now();
    if (!g_connectSuccessful) {
      g_connectSuccessful = true;
      __unmatched_25();
    }
    __unmatched_92 = false;
    var num = data.getUint16(pos, true);
    pos += 2;
    for (var i = 0; i < num; ++i) {
      var cellA = g_cellsById[data.getUint32(pos, true)];
      var cellB = g_cellsById[data.getUint32(pos + 4, true)];
      pos += 8;
      if (cellA && cellB) {
        cellB.S();
        cellB.o = cellB.x;
        cellB.p = cellB.y;
        cellB.n = cellB.size;
        cellB.C = cellA.x;
        cellB.D = cellA.y;
        cellB.m = cellB.size;
        cellB.L = g_time;
        __unmatched_52(cellA, cellB);
      }
    }
    for (i = 0;;) {
      num = data.getUint32(pos, true);
      pos += 4;
      if (0 == num) {
        break;
      }
      ++i;
      var size;
      var cellA = data.getInt32(pos, true);
      pos += 4;
      cellB = data.getInt32(pos, true);
      pos += 4;
      size = data.getInt16(pos, true);
      pos += 2;
      var flags = data.getUint8(pos++);
      var y = data.getUint8(pos++);
      var b = data.getUint8(pos++);
      var y = __unmatched_43(flags << 16 | y << 8 | b);
      var b = data.getUint8(pos++);
      var isVirus = !!(b & 1);
      var isAgitated = !!(b & 16);
      var __unmatched_223 = null;
      if (b & 2) {
        pos += 4 + data.getUint32(pos, true);
      }
      if (b & 4) {
        __unmatched_223 = __unmatched_212();
      }
      var name = __unmatched_211();
      var flags = null;
      if (g_cellsById.hasOwnProperty(num)) {
        flags = g_cellsById[num];
        flags.K();
        flags.o = flags.x;
        flags.p = flags.y;
        flags.n = flags.size;
        flags.color = y;
      } else {
        flags = new Cell(num, cellA, cellB, size, y, name);
        g_cells.push(flags);
        g_cellsById[num] = flags;
        flags.ia = cellA;
        flags.ja = cellB;
      }
      flags.f = isVirus;
      flags.j = isAgitated;
      flags.C = cellA;
      flags.D = cellB;
      flags.m = size;
      flags.L = g_time;
      flags.U = b;
      if (__unmatched_223) {
        flags.J = __unmatched_223;
      }
      if (name) {
        flags.t(name);
      }
      if (-1 != g_playerCellIds.indexOf(num) && -1 == g_playerCells.indexOf(flags)) {
        g_playerCells.push(flags);
        if (1 == g_playerCells.length) {
          g_viewX = flags.x;
          g_viewY = flags.y;
          __unmatched_144();
          document.getElementById('overlays').style.display = 'none';
          points = [];
          __unmatched_148 = 0;
          __unmatched_149 = g_playerCells[0].color;
          __unmatched_151 = true;
          __unmatched_152 = Date.now();
          g_mode = __unmatched_155 = __unmatched_154 = 0;
        }
      }
    }
    cellA = data.getUint32(pos, true);
    pos += 4;
    for (i = 0; i < cellA; i++) {
      num = data.getUint32(pos, true);
      pos += 4;
      flags = g_cellsById[num];
      if (null != flags) {
        flags.S();
      }
    }
    if (__unmatched_92 && 0 == g_playerCells.length) {
      __unmatched_153 = Date.now();
      __unmatched_151 = false;
      if (!(g_playerCellDestroyed || __unmatched_150)) {
        if (__unmatched_157) {
          __unmatched_13(window.ab);
          ShowOverlay();
          __unmatched_150 = true;
          $('#overlays').fadeIn(3000);
          $('#stats').show();
        } else {
          __unmatched_10(3000);
        }
      }
    }
  }
  function __unmatched_25() {
    $('#connecting').hide();
    SendNick();
    if (__unmatched_129) {
      __unmatched_129();
      __unmatched_129 = null;
    }
    if (null != __unmatched_131) {
      clearTimeout(__unmatched_131);
    }
    __unmatched_131 = setTimeout(function() {
      if (window.ga) {
        ++__unmatched_132;
        window.ga('set', 'dimension2', __unmatched_132);
      }
    }, 10000);
  }
  function SendPos() {
    if (IsConnected()) {
      var deltaY = g_mouseX - text / 2;
      var delta = g_mouseY - noClip / 2;
      if (!(64 > deltaY * deltaY + delta * delta || 0.01 > Math.abs(g_lastMoveY - g_moveX) && 0.01 > Math.abs(g_lastMoveX - g_moveY))) {
        g_lastMoveY = g_moveX;
        g_lastMoveX = g_moveY;
        deltaY = GetBuffer(13);
        deltaY.setUint8(0, 16);
        deltaY.setInt32(1, g_moveX, true);
        deltaY.setInt32(5, g_moveY, true);
        deltaY.setUint32(9, 0, true);
        SendBuffer(deltaY);
      }
    }
  }
  function SendNick() {
    if (IsConnected() && g_connectSuccessful && null != g_nick) {
      var data = GetBuffer(1 + 2 * g_nick.length);
      data.setUint8(0, 0);
      for (var i = 0; i < g_nick.length; ++i) {
        data.setUint16(1 + 2 * i, g_nick.charCodeAt(i), true);
      }
      SendBuffer(data);
      g_nick = null;
    }
  }
  function IsConnected() {
    return null != g_socket && g_socket.readyState == g_socket.OPEN;
  }
  function SendCmd(cmd) {
    if (IsConnected()) {
      var data = GetBuffer(1);
      data.setUint8(0, cmd);
      SendBuffer(data);
    }
  }
  function RefreshAds() {
    if (IsConnected() && null != __unmatched_112) {
      var __unmatched_235 = GetBuffer(1 + __unmatched_112.length);
      __unmatched_235.setUint8(0, 81);
      for (var y = 0; y < __unmatched_112.length; ++y) {
        __unmatched_235.setUint8(y + 1, __unmatched_112.charCodeAt(y));
      }
      SendBuffer(__unmatched_235);
    }
  }
  function ResizeHandler() {
    text = 1 * window.innerWidth;
    noClip = 1 * window.innerHeight;
    g_canvas_.width = g_canvas.width = text;
    g_canvas_.height = g_canvas.height = noClip;
    var $dialog = $('#helloContainer');
    $dialog.css('transform', 'none');
    var dialogHeight = $dialog.height();
    var height = window.innerHeight;
    if (dialogHeight > height / 1.1) {
      $dialog.css('transform', 'translate(-50%, -50%) scale(' + height / dialogHeight / 1.1 + ')');
    } else {
      $dialog.css('transform', 'translate(-50%, -50%)');
    }
    GetScore();
  }
  function ScaleModifier() {
    var scale;
    scale = 1 * Math.max(noClip / 1080, text / 1920);
    return scale *= g_zoom;
  }
  function __unmatched_33() {
    if (0 != g_playerCells.length) {
      for (var scale = 0, i = 0; i < g_playerCells.length; i++) {
        scale += g_playerCells[i].size;
      }
      scale = Math.pow(Math.min(64 / scale, 1), 0.4) * ScaleModifier();
      g_scale = (9 * g_scale + scale) / 10;
    }
  }
  function GetScore() {
    var x;
    var time = Date.now();
    ++__unmatched_79;
    g_time = time;
    if (0 < g_playerCells.length) {
      __unmatched_33();
      for (var y = x = 0, i = 0; i < g_playerCells.length; i++) {
        g_playerCells[i].K();
        x += g_playerCells[i].x / g_playerCells.length;
        y += g_playerCells[i].y / g_playerCells.length;
      }
      g_viewX_ = x;
      g_viewY_ = y;
      g_scale_ = g_scale;
      g_viewX = (g_viewX + x) / 2;
      g_viewY = (g_viewY + y) / 2;
    } else {
      g_viewX = (29 * g_viewX + g_viewX_) / 30;
      g_viewY = (29 * g_viewY + g_viewY_) / 30;
      g_scale = (9 * g_scale + g_scale_ * ScaleModifier()) / 10;
    }
    UpdateTree();
    UpdatePos();
    if (!g_showTrails) {
      g_context.clearRect(0, 0, text, noClip);
    }
    if (g_showTrails) {
      g_context.fillStyle = g_showMass ? '#111111' : '#F2FBFF';
      g_context.globalAlpha = 0.05;
      g_context.fillRect(0, 0, text, noClip);
      g_context.globalAlpha = 1;
    } else {
      DrawGrid();
    }
    g_cells.sort(function(A, B) {
      return A.size == B.size ? A.id - B.id : A.size - B.size;
    });
    g_context.save();
    g_context.translate(text / 2, noClip / 2);
    g_context.scale(g_scale, g_scale);
    g_context.translate(-g_viewX, -g_viewY);
    for (i = 0; i < g_destroyedCells.length; i++) {
      g_destroyedCells[i].s(g_context);
    }
    for (i = 0; i < g_cells.length; i++) {
      g_cells[i].s(g_context);
    }
    if (g_ready) {
      g_linesX = (3 * g_linesX + g_linesY_) / 4;
      g_linesY = (3 * g_linesY + g_linesX_) / 4;
      g_context.save();
      g_context.strokeStyle = '#FFAAAA';
      g_context.lineWidth = 10;
      g_context.lineCap = 'round';
      g_context.lineJoin = 'round';
      g_context.globalAlpha = 0.5;
      g_context.beginPath();
      for (i = 0; i < g_playerCells.length; i++) {
        g_context.moveTo(g_playerCells[i].x, g_playerCells[i].y);
        g_context.lineTo(g_linesX, g_linesY);
      }
      g_context.stroke();
      g_context.restore();
    }
    g_context.restore();
    if (__unmatched_135 && __unmatched_135.width) {
      g_context.drawImage(__unmatched_135, text - __unmatched_135.width - 10, 10);
    }
    g_maxScore = Math.max(g_maxScore, __unmatched_37());
    if (0 != g_maxScore) {
      if (null == g_cachedScore) {
        g_cachedScore = new CachedCanvas(24, '#FFFFFF');
      }
      g_cachedScore.u(Render('score') + ': ' + ~~(g_maxScore / 100));
      y = g_cachedScore.F();
      x = y.width;
      g_context.globalAlpha = 0.2;
      g_context.fillStyle = '#000000';
      g_context.fillRect(10, noClip - 10 - 24 - 10, x + 10, 34);
      g_context.globalAlpha = 1;
      g_context.drawImage(y, 15, noClip - 10 - 24 - 5);
    }
    DrawSplitImage();
    time = Date.now() - time;
    if (time > 1000 / 60) {
      g_pointNumScale -= 0.01;
    } else if (time < 1000 / 65) {
      g_pointNumScale += 0.01;
    }
    if (0.4 > g_pointNumScale) {
      g_pointNumScale = 0.4;
    }
    if (1 < g_pointNumScale) {
      g_pointNumScale = 1;
    }
    time = g_time - __unmatched_81;
    if (!IsConnected() || g_playerCellDestroyed || __unmatched_150) {
      qkeyDown += time / 2000;
      if (1 < qkeyDown) {
        qkeyDown = 1;
      }
    } else {
      qkeyDown -= time / 300;
      if (0 > qkeyDown) {
        qkeyDown = 0;
      }
    }
    if (0 < qkeyDown) {
      g_context.fillStyle = '#000000';
      if (__unmatched_117) {
        g_context.globalAlpha = qkeyDown;
        g_context.fillRect(0, 0, text, noClip);
        if (canvas.complete && canvas.width) {
          if (canvas.width / canvas.height < text / noClip) {
            time = text;
            x = canvas.height * text / canvas.width;
          } else {
            time = canvas.width * noClip / canvas.height;
            x = noClip;
          }
          g_context.drawImage(canvas, (text - time) / 2, (noClip - x) / 2, time, x);
          g_context.globalAlpha = 0.5 * qkeyDown;
          g_context.fillRect(0, 0, text, noClip);
        }
      } else {
        g_context.globalAlpha = 0.5 * qkeyDown;
        g_context.fillRect(0, 0, text, noClip);
      }
      g_context.globalAlpha = 1;
    } else {
      __unmatched_117 = false;
    }
    __unmatched_81 = g_time;
  }
  function DrawGrid() {
    g_context.fillStyle = g_showMass ? '#111111' : '#F2FBFF';
    g_context.fillRect(0, 0, text, noClip);
    g_context.save();
    g_context.strokeStyle = g_showMass ? '#AAAAAA' : '#000000';
    g_context.globalAlpha = 0.2 * g_scale;
    for (var width = text / g_scale, height = noClip / g_scale, g_width = (-g_viewX + width / 2) % 50; g_width < width; g_width += 50) {
      g_context.beginPath();
      g_context.moveTo(g_width * g_scale - 0.5, 0);
      g_context.lineTo(g_width * g_scale - 0.5, height * g_scale);
      g_context.stroke();
    }
    for (g_width = (-g_viewY + height / 2) % 50; g_width < height; g_width += 50) {
      g_context.beginPath();
      g_context.moveTo(0, g_width * g_scale - 0.5);
      g_context.lineTo(width * g_scale, g_width * g_scale - 0.5);
      g_context.stroke();
    }
    g_context.restore();
  }
  function DrawSplitImage() {
    if (g_touchCapable && g_splitImage.width) {
      var size = text / 5;
      g_context.drawImage(g_splitImage, 5, 5, size, size);
    }
  }
  function __unmatched_37() {
    for (var score = 0, i = 0; i < g_playerCells.length; i++) {
      score += g_playerCells[i].m * g_playerCells[i].m;
    }
    return score;
  }
  function UpdateLeaderboard() {
    __unmatched_135 = null;
    if (null != g_scorePartitions || 0 != g_scoreEntries.length) {
      if (null != g_scorePartitions || g_showNames) {
        __unmatched_135 = document.createElement('canvas');
        var context = __unmatched_135.getContext('2d');
        var height = 60;
        var height = null == g_scorePartitions ? height + 24 * g_scoreEntries.length : height + 180;
        var scale = Math.min(200, 0.3 * text) / 200;
        __unmatched_135.width = 200 * scale;
        __unmatched_135.height = height * scale;
        context.scale(scale, scale);
        context.globalAlpha = 0.4;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 200, height);
        context.globalAlpha = 1;
        context.fillStyle = '#FFFFFF';
        scale = null;
        scale = Render('leaderboard');
        context.font = '30px Ubuntu';
        context.fillText(scale, 100 - context.measureText(scale).width / 2, 40);
        if (null == g_scorePartitions) {
          for (context.font = '20px Ubuntu', height = 0; height < g_scoreEntries.length; ++height) {
            scale = g_scoreEntries[height].name || Render('unnamed_cell');
            if (!g_showNames) {
              scale = Render('unnamed_cell');
            }
            if (-1 != g_playerCellIds.indexOf(g_scoreEntries[height].id)) {
              if (g_playerCells[0].name) {
                scale = g_playerCells[0].name;
              }
              context.fillStyle = '#FFAAAA';
            } else {
              context.fillStyle = '#FFFFFF';
            }
            scale = height + 1 + '. ' + scale;
            context.fillText(scale, 100 - context.measureText(scale).width / 2, 70 + 24 * height);
          }
        } else {
          for (height = scale = 0; height < g_scorePartitions.length; ++height) {
            var end = scale + g_scorePartitions[height] * Math.PI * 2;
            context.fillStyle = g_teamColors[height + 1];
            context.beginPath();
            context.moveTo(100, 140);
            context.arc(100, 140, 80, scale, end, false);
            context.fill();
            scale = end;
          }
        }
      }
    }
  }
  function __unmatched_39(__unmatched_259) {
    if (null == __unmatched_259 || 0 == __unmatched_259.length) {
      return null;
    }
    if ('%' == __unmatched_259[0]) {
      if (!window.MC || !window.MC.getSkinInfo) {
        return null;
      }
      __unmatched_259 = window.MC.getSkinInfo('skin_' + __unmatched_259.slice(1));
      if (null == __unmatched_259) {
        return null;
      }
      for (__unmatched_259 = (+__unmatched_259.color).toString(16); 6 > __unmatched_259.length;) {
        __unmatched_259 = '0' + __unmatched_259;
      }
      return '#' + __unmatched_259;
    }
    return null;
  }
  function __unmatched_40(g_leaderboardCanvas) {
    if (null == g_leaderboardCanvas || 0 == g_leaderboardCanvas.length) {
      return null;
    }
    if (!__unmatched_142.hasOwnProperty(g_leaderboardCanvas)) {
      var __unmatched_261 = new Image();
      if (':' == g_leaderboardCanvas[0]) {
        __unmatched_261.src = g_leaderboardCanvas.slice(1);
      } else if ('%' == g_leaderboardCanvas[0]) {
        if (!window.MC || !window.MC.getSkinInfo) {
          return null;
        }
        var sizeRatio = window.MC.getSkinInfo('skin_' + g_leaderboardCanvas.slice(1));
        if (null == sizeRatio) {
          return null;
        }
        __unmatched_261.src = 'skins/premium/' + sizeRatio.url;
      }
      __unmatched_142[g_leaderboardCanvas] = __unmatched_261;
    }
    return 0 != __unmatched_142[g_leaderboardCanvas].width && __unmatched_142[g_leaderboardCanvas].complete ? __unmatched_142[g_leaderboardCanvas] : null;
  }
  function Node(left, top, width, height, depth) {
    this.Q = left;
    this.x = top;
    this.y = width;
    this.g = height;
    this.b = depth;
  }
  function Cell(id, x, y, size, color, name) {
    this.id = id;
    this.o = this.x = x;
    this.p = this.y = y;
    this.n = this.size = size;
    this.color = color;
    this.a = [];
    this.R();
    this.t(name);
  }
  function __unmatched_43(__unmatched_274) {
    for (__unmatched_274 = __unmatched_274.toString(16); 6 > __unmatched_274.length;) {
      __unmatched_274 = '0' + __unmatched_274;
    }
    return '#' + __unmatched_274;
  }
  function CachedCanvas(size, color, stroke, strokeColor) {
    if (size) {
      this.q = size;
    }
    if (color) {
      this.N = color;
    }
    this.P = !!stroke;
    if (strokeColor) {
      this.r = strokeColor;
    }
  }
  function __unmatched_45(params) {
    for (var size_ = params.length, __unmatched_281, __unmatched_282; 0 < size_;) {
      __unmatched_282 = Math.floor(Math.random() * size_);
      size_--;
      __unmatched_281 = params[size_];
      params[size_] = params[__unmatched_282];
      params[__unmatched_282] = __unmatched_281;
    }
  }
  function __unmatched_46(rect, callback) {
    var __unmatched_285 = '1' == $('#helloContainer').attr('data-has-account-data');
    $('#helloContainer').attr('data-has-account-data', '1');
    if (null == callback && window.localStorage[i_]) {
      var rand = JSON.parse(window.localStorage[i_]);
      rand.xp = rect.e;
      rand.xpNeeded = rect.c;
      rand.level = rect.d;
      window.localStorage[i_] = JSON.stringify(rand);
    }
    if (__unmatched_285) {
      var width = +$('.agario-exp-bar .progress-bar-text').first().text().split('/')[0];
      var __unmatched_285 = +$('.agario-exp-bar .progress-bar-text').first().text().split('/')[1].split(' ')[0];
      var rand = $('.agario-profile-panel .progress-bar-star').first().text();
      if (rand != rect.d) {
        __unmatched_46({
          e: __unmatched_285,
          c: __unmatched_285,
          d: rand
        }, function() {
          $('.agario-profile-panel .progress-bar-star').text(rect.d);
          $('.agario-exp-bar .progress-bar').css('width', '100%');
          $('.progress-bar-star').addClass('animated tada').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $('.progress-bar-star').removeClass('animated tada');
          });
          setTimeout(function() {
            $('.agario-exp-bar .progress-bar-text').text(rect.c + '/' + rect.c + ' XP');
            __unmatched_46({
              e: 0,
              c: rect.c,
              d: rect.d
            }, function() {
              __unmatched_46(rect, callback);
            });
          }, 1000);
        });
      } else {
        var __unmatched_288 = Date.now();
        var name = function() {
          var deltaX;
          deltaX = (Date.now() - __unmatched_288) / 1000;
          deltaX = 0 > deltaX ? 0 : 1 < deltaX ? 1 : deltaX;
          deltaX = deltaX * deltaX * (3 - 2 * deltaX);
          $('.agario-exp-bar .progress-bar-text').text(~~(width + (rect.e - width) * deltaX) + '/' + rect.c + ' XP');
          $('.agario-exp-bar .progress-bar').css('width', (88 * (width + (rect.e - width) * deltaX) / rect.c).toFixed(2) + '%');
          if (1 > deltaX) {
            window.requestAnimationFrame(name);
          } else if (callback) {
            callback();
          }
        };
        window.requestAnimationFrame(name);
      }
    } else {
      $('.agario-profile-panel .progress-bar-star').text(rect.d);
      $('.agario-exp-bar .progress-bar-text').text(rect.e + '/' + rect.c + ' XP');
      $('.agario-exp-bar .progress-bar').css('width', (88 * rect.e / rect.c).toFixed(2) + '%');
      if (callback) {
        callback();
      }
    }
  }
  function __unmatched_47(__unmatched_291) {
    if ('string' == typeof __unmatched_291) {
      __unmatched_291 = JSON.parse(__unmatched_291);
    }
    if (Date.now() + 1800000 > __unmatched_291.expires) {
      $('#helloContainer').attr('data-logged-in', '0');
    } else {
      window.localStorage[i_] = JSON.stringify(__unmatched_291);
      __unmatched_112 = __unmatched_291.authToken;
      $('.agario-profile-name').text(__unmatched_291.name);
      RefreshAds();
      __unmatched_46({
        e: __unmatched_291.xp,
        c: __unmatched_291.xpNeeded,
        d: __unmatched_291.level
      });
      $('#helloContainer').attr('data-logged-in', '1');
    }
  }
  function __unmatched_48(data) {
    data = data.split('\n');
    __unmatched_47({
      name: data[0],
      fbid: data[1],
      authToken: data[2],
      expires: 1000 * +data[3],
      level: +data[4],
      xp: +data[5],
      xpNeeded: +data[6]
    });
  }
  function UpdateScale(__unmatched_293) {
    if ('connected' == __unmatched_293.status) {
      var x = __unmatched_293.authResponse.accessToken;
      console.log(x);
      window.FB.api('/me/picture?width=180&height=180', function(__unmatched_295) {
        window.localStorage.fbPictureCache = __unmatched_295.data.url;
        $('.agario-profile-picture').attr('src', __unmatched_295.data.url);
      });
      $('#helloContainer').attr('data-logged-in', '1');
      if (null != __unmatched_112) {
        $.ajax(g_protocol + 'checkToken', {
          error: function() {
            __unmatched_112 = null;
            UpdateScale(__unmatched_293);
          },
          success: function(__unmatched_296) {
            __unmatched_296 = __unmatched_296.split('\n');
            __unmatched_46({
              d: +__unmatched_296[0],
              e: +__unmatched_296[1],
              c: +__unmatched_296[2]
            });
          },
          dataType: 'text',
          method: 'POST',
          cache: false,
          crossDomain: true,
          data: __unmatched_112
        });
      } else {
        $.ajax(g_protocol + 'facebookLogin', {
          error: function() {
            __unmatched_112 = null;
            $('#helloContainer').attr('data-logged-in', '0');
          },
          success: __unmatched_48,
          dataType: 'text',
          method: 'POST',
          cache: false,
          crossDomain: true,
          data: x
        });
      }
    }
  }
  function RenderLoop(x) {
    n(':party');
    $('#helloContainer').attr('data-party-state', '4');
    x = decodeURIComponent(x).replace(/.*#/gim, '');
    __unmatched_51('#' + window.encodeURIComponent(x));
    $.ajax(g_protocol + 'getToken', {
      error: function() {
        $('#helloContainer').attr('data-party-state', '6');
      },
      success: function(quick) {
        quick = quick.split('\n');
        $('.partyToken').val('agar.io/#' + window.encodeURIComponent(x));
        $('#helloContainer').attr('data-party-state', '5');
        n(':party');
        Connect('ws://' + quick[0], x);
      },
      dataType: 'text',
      method: 'POST',
      cache: false,
      crossDomain: true,
      data: x
    });
  }
  function __unmatched_51(item) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, window.document.title, item);
    }
  }
  function __unmatched_52(__unmatched_300, __unmatched_301) {
    var playerOwned = -1 != g_playerCellIds.indexOf(__unmatched_300.id);
    var __unmatched_303 = -1 != g_playerCellIds.indexOf(__unmatched_301.id);
    var __unmatched_304 = 30 > __unmatched_301.size;
    if (playerOwned && __unmatched_304) {
      ++__unmatched_148;
    }
    if (!(__unmatched_304 || !playerOwned || __unmatched_303)) {
      ++__unmatched_155;
    }
  }
  function __unmatched_53(__unmatched_305) {
    __unmatched_305 = ~~__unmatched_305;
    var color = (__unmatched_305 % 60).toString();
    __unmatched_305 = (~~(__unmatched_305 / 60)).toString();
    if (2 > color.length) {
      color = '0' + color;
    }
    return __unmatched_305 + ':' + color;
  }
  function __unmatched_54() {
    if (null == g_scoreEntries) {
      return 0;
    }
    for (var i = 0; i < g_scoreEntries.length; ++i) {
      if (-1 != g_playerCellIds.indexOf(g_scoreEntries[i].id)) {
        return i + 1;
      }
    }
    return 0;
  }
  function ShowOverlay() {
    $('.stats-food-eaten').text(__unmatched_148);
    $('.stats-time-alive').text(__unmatched_53((__unmatched_153 - __unmatched_152) / 1000));
    $('.stats-leaderboard-time').text(__unmatched_53(__unmatched_154));
    $('.stats-highest-mass').text(~~(g_maxScore / 100));
    $('.stats-cells-eaten').text(__unmatched_155);
    $('.stats-top-position').text(0 == g_mode ? ':(' : g_mode);
    var g_height = document.getElementById('statsGraph');
    if (g_height) {
      var pointsAcc = g_height.getContext('2d');
      var scale = g_height.width;
      var g_height = g_height.height;
      pointsAcc.clearRect(0, 0, scale, g_height);
      if (2 < points.length) {
        for (var maxSize = 200, i = 0; i < points.length; i++) {
          maxSize = Math.max(points[i], maxSize);
        }
        pointsAcc.lineWidth = 3;
        pointsAcc.lineCap = 'round';
        pointsAcc.lineJoin = 'round';
        pointsAcc.strokeStyle = __unmatched_149;
        pointsAcc.fillStyle = __unmatched_149;
        pointsAcc.beginPath();
        pointsAcc.moveTo(0, g_height - points[0] / maxSize * (g_height - 10) + 10);
        for (i = 1; i < points.length; i += Math.max(~~(points.length / scale), 1)) {
          for (var __unmatched_313 = i / (points.length - 1) * scale, thisNode = [], __unmatched_315 = -20; 20 >= __unmatched_315; ++__unmatched_315) {
            if (!(0 > i + __unmatched_315 || i + __unmatched_315 >= points.length)) {
              thisNode.push(points[i + __unmatched_315]);
            }
          }
          thisNode = thisNode.reduce(function(__unmatched_316, __unmatched_317) {
              return __unmatched_316 + __unmatched_317;
            }) / thisNode.length / maxSize;
          pointsAcc.lineTo(__unmatched_313, g_height - thisNode * (g_height - 10) + 10);
        }
        pointsAcc.stroke();
        pointsAcc.globalAlpha = 0.5;
        pointsAcc.lineTo(scale, g_height);
        pointsAcc.lineTo(0, g_height);
        pointsAcc.fill();
        pointsAcc.globalAlpha = 1;
      }
    }
  }
  if (!window.agarioNoInit) {
    var __unmatched_56 = window.location.protocol;
    var g_secure = 'https:' == __unmatched_56;
    var g_protocol = __unmatched_56 + '//m.agar.io/';
    var node = window.navigator.userAgent;
    if (-1 != node.indexOf('Android')) {
      if (window.ga) {
        window.ga('send', 'event', 'MobileRedirect', 'PlayStore');
      }
      setTimeout(function() {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.miniclip.agar.io';
      }, 1000);
    } else if (-1 != node.indexOf('iPhone') || -1 != node.indexOf('iPad') || -1 != node.indexOf('iPod')) {
      if (window.ga) {
        window.ga('send', 'event', 'MobileRedirect', 'AppStore');
      }
      setTimeout(function() {
        window.location.href = 'https://itunes.apple.com/app/agar.io/id995999703?mt=8&at=1l3vajp';
      }, 1000);
    } else {
      var g_canvas_;
      var g_context;
      var g_canvas;
      var text;
      var noClip;
      var g_pointTree = null;
      var g_socket = null;
      var g_viewX = 0;
      var g_viewY = 0;
      var g_playerCellIds = [];
      var g_playerCells = [];
      var g_cellsById = {};
      var g_cells = [];
      var g_destroyedCells = [];
      var g_scoreEntries = [];
      var g_mouseX = 0;
      var g_mouseY = 0;
      var g_moveX = -1;
      var g_moveY = -1;
      var __unmatched_79 = 0;
      var g_time = 0;
      var __unmatched_81 = 0;
      var g_nick = null;
      var g_minX = 0;
      var g_minY = 0;
      var g_maxX = 10000;
      var g_maxY = 10000;
      var g_scale = 1;
      var g_region = null;
      var g_showSkins = true;
      var g_showNames = true;
      var g_noColors = false;
      var __unmatched_92 = false;
      var g_maxScore = 0;
      var g_showMass = false;
      var g_darkTheme = false;
      var g_viewX_ = g_viewX = ~~((g_minX + g_maxX) / 2);
      var g_viewY_ = g_viewY = ~~((g_minY + g_maxY) / 2);
      var g_scale_ = 1;
      var __unmatched_99 = '';
      var g_scorePartitions = null;
      var g_drawLines = false;
      var g_ready = false;
      var g_linesY_ = 0;
      var g_linesX_ = 0;
      var g_linesX = 0;
      var g_linesY = 0;
      var g_ABGroup = 0;
      var g_teamColors = [
        '#333333',
        '#FF3333',
        '#33FF33',
        '#3333FF'
      ];
      var g_showTrails = false;
      var g_connectSuccessful = false;
      var __unmatched_111 = 0;
      var __unmatched_112 = null;
      var g_zoom = 1;
      var qkeyDown = 1;
      var g_playerCellDestroyed = false;
      var __unmatched_116 = 0;
      var __unmatched_117 = true;
      var __unmatched_118 = {};
      var __unmatched_119 = null;
      (function() {
        var cached = window.location.search;
        if ('?' == cached.charAt(0)) {
          cached = cached.slice(1);
        }
        for (var cached = cached.split('&'), i = 0; i < cached.length; i++) {
          var parts = cached[i].split('=');
          __unmatched_118[parts[0]] = parts[1];
        }
      }());
      var canvas = new Image();
      canvas.src = 'img/background.png';
      var g_touchCapable = 'ontouchstart' in window && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
      var g_splitImage = new Image();
      g_splitImage.src = 'img/split.png';
      var canvasTest = document.createElement('canvas');
      if ('undefined' == typeof console || 'undefined' == typeof DataView || 'undefined' == typeof WebSocket || null == canvasTest || null == canvasTest.getContext || null == window.localStorage) {
        alert('You browser does not support this game, we recommend you to use Firefox to play this');
      } else {
        var g_regionLabels = null;
        window.setNick = function(__unmatched_321) {
          if (window.ga) {
            window.ga('send', 'event', 'Nick', __unmatched_321.toLowerCase());
          }
          HideOverlay();
          g_nick = __unmatched_321;
          SendNick();
          g_maxScore = 0;
        };
        window.setRegion = SetRegion;
        var __unmatched_125 = true;
        window.setSkins = function(val) {
          g_showSkins = val;
        };
        window.setNames = function(val) {
          g_showNames = val;
        };
        window.setDarkTheme = function(val) {
          g_showMass = val;
        };
        window.setColors = function(val) {
          g_noColors = val;
        };
        window.setShowMass = function(val) {
          g_darkTheme = val;
        };
        window.spectate = function() {
          g_nick = null;
          SendCmd(1);
          HideOverlay();
        };
        window.setGameMode = function(__unmatched_327) {
          if (__unmatched_327 != __unmatched_99) {
            if (':party' == __unmatched_99) {
              $('#helloContainer').attr('data-party-state', '0');
            }
            n(__unmatched_327);
            if (':party' != __unmatched_327) {
              Start();
            }
          }
        };
        window.setAcid = function(val) {
          g_showTrails = val;
        };
        if (null != window.localStorage) {
          if (null == window.localStorage.AB9) {
            window.localStorage.AB9 = 0 + ~~(100 * Math.random());
          }
          g_ABGroup = +window.localStorage.AB9;
          window.ABGroup = g_ABGroup;
        }
        $.get(__unmatched_56 + '//gc.agar.io', function(code) {
          var __unmatched_330 = code.split(' ');
          code = __unmatched_330[0];
          __unmatched_330 = __unmatched_330[1] || '';
          if (-1 == ['UA'].indexOf(code)) {
            g_skinNamesA.push('ussr');
          }
          if (g_regionsByCC.hasOwnProperty(code)) {
            if ('string' == typeof g_regionsByCC[code]) {
              if (!g_region) {
                SetRegion(g_regionsByCC[code]);
              } else if (g_regionsByCC[code].hasOwnProperty(__unmatched_330)) {
                if (!g_region) {
                  SetRegion(g_regionsByCC[code][__unmatched_330]);
                }
              }
            }
          }
        }, 'text');
        var g_canRefreshAds = true;
        var g_refreshAdsCooldown = 0;
        var g_regionsByCC = {
          AF: 'JP-Tokyo',
          AX: 'EU-London',
          AL: 'EU-London',
          DZ: 'EU-London',
          AS: 'SG-Singapore',
          AD: 'EU-London',
          AO: 'EU-London',
          AI: 'US-Atlanta',
          AG: 'US-Atlanta',
          AR: 'BR-Brazil',
          AM: 'JP-Tokyo',
          AW: 'US-Atlanta',
          AU: 'SG-Singapore',
          AT: 'EU-London',
          AZ: 'JP-Tokyo',
          BS: 'US-Atlanta',
          BH: 'JP-Tokyo',
          BD: 'JP-Tokyo',
          BB: 'US-Atlanta',
          BY: 'EU-London',
          BE: 'EU-London',
          BZ: 'US-Atlanta',
          BJ: 'EU-London',
          BM: 'US-Atlanta',
          BT: 'JP-Tokyo',
          BO: 'BR-Brazil',
          BQ: 'US-Atlanta',
          BA: 'EU-London',
          BW: 'EU-London',
          BR: 'BR-Brazil',
          IO: 'JP-Tokyo',
          VG: 'US-Atlanta',
          BN: 'JP-Tokyo',
          BG: 'EU-London',
          BF: 'EU-London',
          BI: 'EU-London',
          KH: 'JP-Tokyo',
          CM: 'EU-London',
          CA: 'US-Atlanta',
          CV: 'EU-London',
          KY: 'US-Atlanta',
          CF: 'EU-London',
          TD: 'EU-London',
          CL: 'BR-Brazil',
          CN: 'CN-China',
          CX: 'JP-Tokyo',
          CC: 'JP-Tokyo',
          CO: 'BR-Brazil',
          KM: 'EU-London',
          CD: 'EU-London',
          CG: 'EU-London',
          CK: 'SG-Singapore',
          CR: 'US-Atlanta',
          CI: 'EU-London',
          HR: 'EU-London',
          CU: 'US-Atlanta',
          CW: 'US-Atlanta',
          CY: 'JP-Tokyo',
          CZ: 'EU-London',
          DK: 'EU-London',
          DJ: 'EU-London',
          DM: 'US-Atlanta',
          DO: 'US-Atlanta',
          EC: 'BR-Brazil',
          EG: 'EU-London',
          SV: 'US-Atlanta',
          GQ: 'EU-London',
          ER: 'EU-London',
          EE: 'EU-London',
          ET: 'EU-London',
          FO: 'EU-London',
          FK: 'BR-Brazil',
          FJ: 'SG-Singapore',
          FI: 'EU-London',
          FR: 'EU-London',
          GF: 'BR-Brazil',
          PF: 'SG-Singapore',
          GA: 'EU-London',
          GM: 'EU-London',
          GE: 'JP-Tokyo',
          DE: 'EU-London',
          GH: 'EU-London',
          GI: 'EU-London',
          GR: 'EU-London',
          GL: 'US-Atlanta',
          GD: 'US-Atlanta',
          GP: 'US-Atlanta',
          GU: 'SG-Singapore',
          GT: 'US-Atlanta',
          GG: 'EU-London',
          GN: 'EU-London',
          GW: 'EU-London',
          GY: 'BR-Brazil',
          HT: 'US-Atlanta',
          VA: 'EU-London',
          HN: 'US-Atlanta',
          HK: 'JP-Tokyo',
          HU: 'EU-London',
          IS: 'EU-London',
          IN: 'JP-Tokyo',
          ID: 'JP-Tokyo',
          IR: 'JP-Tokyo',
          IQ: 'JP-Tokyo',
          IE: 'EU-London',
          IM: 'EU-London',
          IL: 'JP-Tokyo',
          IT: 'EU-London',
          JM: 'US-Atlanta',
          JP: 'JP-Tokyo',
          JE: 'EU-London',
          JO: 'JP-Tokyo',
          KZ: 'JP-Tokyo',
          KE: 'EU-London',
          KI: 'SG-Singapore',
          KP: 'JP-Tokyo',
          KR: 'JP-Tokyo',
          KW: 'JP-Tokyo',
          KG: 'JP-Tokyo',
          LA: 'JP-Tokyo',
          LV: 'EU-London',
          LB: 'JP-Tokyo',
          LS: 'EU-London',
          LR: 'EU-London',
          LY: 'EU-London',
          LI: 'EU-London',
          LT: 'EU-London',
          LU: 'EU-London',
          MO: 'JP-Tokyo',
          MK: 'EU-London',
          MG: 'EU-London',
          MW: 'EU-London',
          MY: 'JP-Tokyo',
          MV: 'JP-Tokyo',
          ML: 'EU-London',
          MT: 'EU-London',
          MH: 'SG-Singapore',
          MQ: 'US-Atlanta',
          MR: 'EU-London',
          MU: 'EU-London',
          YT: 'EU-London',
          MX: 'US-Atlanta',
          FM: 'SG-Singapore',
          MD: 'EU-London',
          MC: 'EU-London',
          MN: 'JP-Tokyo',
          ME: 'EU-London',
          MS: 'US-Atlanta',
          MA: 'EU-London',
          MZ: 'EU-London',
          MM: 'JP-Tokyo',
          NA: 'EU-London',
          NR: 'SG-Singapore',
          NP: 'JP-Tokyo',
          NL: 'EU-London',
          NC: 'SG-Singapore',
          NZ: 'SG-Singapore',
          NI: 'US-Atlanta',
          NE: 'EU-London',
          NG: 'EU-London',
          NU: 'SG-Singapore',
          NF: 'SG-Singapore',
          MP: 'SG-Singapore',
          NO: 'EU-London',
          OM: 'JP-Tokyo',
          PK: 'JP-Tokyo',
          PW: 'SG-Singapore',
          PS: 'JP-Tokyo',
          PA: 'US-Atlanta',
          PG: 'SG-Singapore',
          PY: 'BR-Brazil',
          PE: 'BR-Brazil',
          PH: 'JP-Tokyo',
          PN: 'SG-Singapore',
          PL: 'EU-London',
          PT: 'EU-London',
          PR: 'US-Atlanta',
          QA: 'JP-Tokyo',
          RE: 'EU-London',
          RO: 'EU-London',
          RU: 'RU-Russia',
          RW: 'EU-London',
          BL: 'US-Atlanta',
          SH: 'EU-London',
          KN: 'US-Atlanta',
          LC: 'US-Atlanta',
          MF: 'US-Atlanta',
          PM: 'US-Atlanta',
          VC: 'US-Atlanta',
          WS: 'SG-Singapore',
          SM: 'EU-London',
          ST: 'EU-London',
          SA: 'EU-London',
          SN: 'EU-London',
          RS: 'EU-London',
          SC: 'EU-London',
          SL: 'EU-London',
          SG: 'JP-Tokyo',
          SX: 'US-Atlanta',
          SK: 'EU-London',
          SI: 'EU-London',
          SB: 'SG-Singapore',
          SO: 'EU-London',
          ZA: 'EU-London',
          SS: 'EU-London',
          ES: 'EU-London',
          LK: 'JP-Tokyo',
          SD: 'EU-London',
          SR: 'BR-Brazil',
          SJ: 'EU-London',
          SZ: 'EU-London',
          SE: 'EU-London',
          CH: 'EU-London',
          SY: 'EU-London',
          TW: 'JP-Tokyo',
          TJ: 'JP-Tokyo',
          TZ: 'EU-London',
          TH: 'JP-Tokyo',
          TL: 'JP-Tokyo',
          TG: 'EU-London',
          TK: 'SG-Singapore',
          TO: 'SG-Singapore',
          TT: 'US-Atlanta',
          TN: 'EU-London',
          TR: 'TK-Turkey',
          TM: 'JP-Tokyo',
          TC: 'US-Atlanta',
          TV: 'SG-Singapore',
          UG: 'EU-London',
          UA: 'EU-London',
          AE: 'EU-London',
          GB: 'EU-London',
          US: 'US-Atlanta',
          UM: 'SG-Singapore',
          VI: 'US-Atlanta',
          UY: 'BR-Brazil',
          UZ: 'JP-Tokyo',
          VU: 'SG-Singapore',
          VE: 'BR-Brazil',
          VN: 'JP-Tokyo',
          WF: 'SG-Singapore',
          EH: 'EU-London',
          YE: 'JP-Tokyo',
          ZM: 'EU-London',
          ZW: 'EU-London'
        };
        var __unmatched_129 = null;
        window.connect = Connect;
        var g_retryTimeout = 500;
        var __unmatched_131 = null;
        var __unmatched_132 = 0;
        var g_lastMoveY = -1;
        var g_lastMoveX = -1;
        window.refreshPlayerInfo = function() {
          SendCmd(253);
        };
        var __unmatched_135 = null;
        var g_pointNumScale = 1;
        var g_cachedScore = null;
        var __unmatched_138 = function() {
          var y = Date.now();
          var maxItems = 1000 / 60;
          return function() {
            window.requestAnimationFrame(__unmatched_138);
            var __unmatched_333 = Date.now();
            var step = __unmatched_333 - y;
            if (step > maxItems) {
              y = __unmatched_333 - step % maxItems;
              if (!IsConnected() || 240 > Date.now() - __unmatched_111) {
                GetScore();
              } else {
                console.warn('Skipping draw');
              }
              __unmatched_146();
            }
          };
        }();
        var g_skinCache = {};
        var g_skinNamesA = 'poland;usa;china;russia;canada;australia;spain;brazil;germany;ukraine;france;sweden;chaplin;north korea;south korea;japan;united kingdom;earth;greece;latvia;lithuania;estonia;finland;norway;cia;maldivas;austria;nigeria;reddit;yaranaika;confederate;9gag;indiana;4chan;italy;bulgaria;tumblr;2ch.hk;hong kong;portugal;jamaica;german empire;mexico;sanik;switzerland;croatia;chile;indonesia;bangladesh;thailand;iran;iraq;peru;moon;botswana;bosnia;netherlands;european union;taiwan;pakistan;hungary;satanist;qing dynasty;matriarchy;patriarchy;feminism;ireland;texas;facepunch;prodota;cambodia;steam;piccolo;ea;india;kc;denmark;quebec;ayy lmao;sealand;bait;tsarist russia;origin;vinesauce;stalin;belgium;luxembourg;stussy;prussia;8ch;argentina;scotland;sir;romania;belarus;wojak;doge;nasa;byzantium;imperial japan;french kingdom;somalia;turkey;mars;pokerface;8;irs;receita federal;facebook;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;venezuela;blatter;chavez;cuba;fidel;merkel;palin;queen;boris;bush;trump'.split(';');
        var __unmatched_141 = '8;nasa;putin;merkel;tsipras;obama;kim jong-un;dilma;hollande;berlusconi;cameron;clinton;hillary;blatter;chavez;fidel;merkel;palin;queen;boris;bush;trump'.split(';');
        var __unmatched_142 = {};
        Node.prototype = {
          Q: null,
          x: 0,
          y: 0,
          g: 0,
          b: 0
        };
        Cell.prototype = {
          id: 0,
          a: null,
          name: null,
          k: null,
          I: null,
          x: 0,
          y: 0,
          size: 0,
          o: 0,
          p: 0,
          n: 0,
          C: 0,
          D: 0,
          m: 0,
          U: 0,
          L: 0,
          W: 0,
          A: false,
          f: false,
          j: false,
          M: true,
          T: 0,
          J: null,
          S: function() {
            var i;
            for (i = 0; i < g_cells.length; i++) {
              if (g_cells[i] == this) {
                g_cells.splice(i, 1);
                break;
              }
            }
            delete g_cellsById[this.id];
            i = g_playerCells.indexOf(this);
            if (-1 != i) {
              __unmatched_92 = true;
              g_playerCells.splice(i, 1);
            }
            i = g_playerCellIds.indexOf(this.id);
            if (-1 != i) {
              g_playerCellIds.splice(i, 1);
            }
            this.A = true;
            if (0 < this.T) {
              g_destroyedCells.push(this);
            }
          },
          i: function() {
            return Math.max(~~(0.3 * this.size), 24);
          },
          t: function(val) {
            if (this.name = val) {
              if (null == this.k) {
                this.k = new CachedCanvas(this.i(), '#FFFFFF', true, '#000000');
              } else {
                this.k.G(this.i());
              }
              this.k.u(this.name);
            }
          },
          R: function() {
            for (var num = this.B(); this.a.length > num;) {
              var i = ~~(Math.random() * this.a.length);
              this.a.splice(i, 1);
            }
            for (0 == this.a.length && 0 < num && this.a.push(new Node(this, this.x, this.y, this.size, Math.random() - 0.5)); this.a.length < num;) {
              i = ~~(Math.random() * this.a.length);
              i = this.a[i];
              this.a.push(new Node(this, i.x, i.y, i.g, i.b));
            }
          },
          B: function() {
            var num = 10;
            if (20 > this.size) {
              num = 0;
            }
            if (this.f) {
              num = 30;
            }
            var size = this.size;
            if (!this.f) {
              size *= g_scale;
            }
            size *= g_pointNumScale;
            if (this.U & 32) {
              size *= 0.25;
            }
            return ~~Math.max(size, num);
          },
          da: function() {
            this.R();
            for (var cell = this.a, num = cell.length, i = 0; i < num; ++i) {
              var prevAcc = cell[(i - 1 + num) % num].b;
              var nextAcc = cell[(i + 1) % num].b;
              cell[i].b += (Math.random() - 0.5) * (this.j ? 3 : 1);
              cell[i].b *= 0.7;
              if (10 < cell[i].b) {
                cell[i].b = 10;
              }
              if (-10 > cell[i].b) {
                cell[i].b = -10;
              }
              cell[i].b = (prevAcc + nextAcc + 8 * cell[i].b) / 10;
            }
            for (var thisCell = this, roll = this.f ? 0 : (this.id / 1000 + g_time / 10000) % (2 * Math.PI), i = 0; i < num; ++i) {
              var size = cell[i].g;
              var prevAcc = cell[(i - 1 + num) % num].g;
              var nextAcc = cell[(i + 1) % num].g;
              if (15 < this.size && null != g_pointTree && 20 < this.size * g_scale && 0 < this.id) {
                var reduce = false;
                var x = cell[i].x;
                var y = cell[i].y;
                g_pointTree.ea(x - 5, y - 5, 10, 10, function(rect) {
                  if (rect.Q != thisCell && 25 > (x - rect.x) * (x - rect.x) + (y - rect.y) * (y - rect.y)) {
                    reduce = true;
                  }
                });
                if (!reduce && (cell[i].x < g_minX || cell[i].y < g_minY || cell[i].x > g_maxX || cell[i].y > g_maxY)) {
                  reduce = true;
                }
                if (reduce) {
                  if (0 < cell[i].b) {
                    cell[i].b = 0;
                  }
                  cell[i].b -= 1;
                }
              }
              size += cell[i].b;
              if (0 > size) {
                size = 0;
              }
              size = this.j ? (19 * size + this.size) / 20 : (12 * size + this.size) / 13;
              cell[i].g = (prevAcc + nextAcc + 8 * size) / 10;
              prevAcc = 2 * Math.PI / num;
              nextAcc = this.a[i].g;
              if (this.f && 0 == i % 2) {
                nextAcc += 5;
              }
              cell[i].x = this.x + Math.cos(prevAcc * i + roll) * nextAcc;
              cell[i].y = this.y + Math.sin(prevAcc * i + roll) * nextAcc;
            }
          },
          K: function() {
            if (0 >= this.id) {
              return 1;
            }
            var posRatio;
            posRatio = (g_time - this.L) / 120;
            posRatio = 0 > posRatio ? 0 : 1 < posRatio ? 1 : posRatio;
            var sizeRatio = 0 > posRatio ? 0 : 1 < posRatio ? 1 : posRatio;
            this.i();
            if (this.A && 1 <= sizeRatio) {
              var i = g_destroyedCells.indexOf(this);
              if (-1 != i) {
                g_destroyedCells.splice(i, 1);
              }
            }
            this.x = posRatio * (this.C - this.o) + this.o;
            this.y = posRatio * (this.D - this.p) + this.p;
            this.size = sizeRatio * (this.m - this.n) + this.n;
            return sizeRatio;
          },
          H: function() {
            return 0 >= this.id ? true : this.x + this.size + 40 < g_viewX - text / 2 / g_scale || this.y + this.size + 40 < g_viewY - noClip / 2 / g_scale || this.x - this.size - 40 > g_viewX + text / 2 / g_scale || this.y - this.size - 40 > g_viewY + noClip / 2 / g_scale ? false : true;
          },
          s: function(context) {
            if (this.H()) {
              ++this.T;
              var isSimpleDrawing = 0 < this.id && !this.f && !this.j && 0.4 > g_scale;
              if (5 > this.B() && 0 < this.id) {
                isSimpleDrawing = true;
              }
              if (this.M && !isSimpleDrawing) {
                for (var i = 0; i < this.a.length; i++) {
                  this.a[i].g = this.size;
                }
              }
              this.M = isSimpleDrawing;
              context.save();
              this.W = g_time;
              i = this.K();
              if (this.A) {
                context.globalAlpha *= 1 - i;
              }
              context.lineWidth = 10;
              context.lineCap = 'round';
              context.lineJoin = this.f ? 'miter' : 'round';
              if (g_noColors) {
                context.fillStyle = '#FFFFFF';
                context.strokeStyle = '#AAAAAA';
              } else {
                i = __unmatched_39(this.J) || this.color;
                context.fillStyle = i;
                context.strokeStyle = i;
              }
              if (isSimpleDrawing) {
                context.beginPath();
                context.arc(this.x, this.y, this.size + 5, 0, 2 * Math.PI, false);
              } else {
                this.da();
                context.beginPath();
                var num = this.B();
                context.moveTo(this.a[0].x, this.a[0].y);
                for (i = 1; i <= num; ++i) {
                  var skin = i % num;
                  context.lineTo(this.a[skin].x, this.a[skin].y);
                }
              }
              context.closePath();
              num = this.name.toLowerCase();
              if (!this.j && g_showSkins && ':teams' != __unmatched_99) {
                if (!(i = __unmatched_40(this.J))) {
                  if (-1 != g_skinNamesA.indexOf(num)) {
                    if (!g_skinCache.hasOwnProperty(num)) {
                      g_skinCache[num] = new Image();
                      g_skinCache[num].src = 'skins/' + num + '.png';
                    }
                    i = 0 != g_skinCache[num].width && g_skinCache[num].complete ? g_skinCache[num] : null;
                  } else {
                    i = null;
                  }
                } else {
                  i = null;
                }
              }
              skin = i;
              if (!isSimpleDrawing) {
                context.stroke();
              }
              context.fill();
              if (null != skin) {
                context.save();
                context.clip();
                context.drawImage(skin, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);
                context.restore();
              }
              if ((g_noColors || 15 < this.size) && !isSimpleDrawing) {
                context.strokeStyle = '#000000';
                context.globalAlpha *= 0.1;
                context.stroke();
              }
              context.globalAlpha = 1;
              i = -1 != g_playerCells.indexOf(this);
              isSimpleDrawing = ~~this.y;
              if (0 != this.id && (g_showNames || i) && this.name && this.k && (null == skin || -1 == __unmatched_141.indexOf(num))) {
                skin = this.k;
                skin.u(this.name);
                skin.G(this.i());
                num = 0 >= this.id ? 1 : Math.ceil(10 * g_scale) / 10;
                skin.V(num);
                var skin = skin.F();
                var g_width = ~~(skin.width / num);
                var g_height = ~~(skin.height / num);
                context.drawImage(skin, ~~this.x - ~~(g_width / 2), isSimpleDrawing - ~~(g_height / 2), g_width, g_height);
                isSimpleDrawing += skin.height / 2 / num + 4;
              }
              if (0 < this.id && g_darkTheme && (i || 0 == g_playerCells.length && (!this.f || this.j) && 20 < this.size)) {
                if (null == this.I) {
                  this.I = new CachedCanvas(this.i() / 2, '#FFFFFF', true, '#000000');
                }
                i = this.I;
                i.G(this.i() / 2);
                i.u(~~(this.size * this.size / 100));
                num = Math.ceil(10 * g_scale) / 10;
                i.V(num);
                skin = i.F();
                g_width = ~~(skin.width / num);
                g_height = ~~(skin.height / num);
                context.drawImage(skin, ~~this.x - ~~(g_width / 2), isSimpleDrawing - ~~(g_height / 2), g_width, g_height);
              }
              context.restore();
            }
          }
        };
        CachedCanvas.prototype = {
          w: '',
          N: '#000000',
          P: false,
          r: '#000000',
          q: 16,
          l: null,
          O: null,
          h: false,
          v: 1,
          G: function(val) {
            if (this.q != val) {
              this.q = val;
              this.h = true;
            }
          },
          V: function(val) {
            if (this.v != val) {
              this.v = val;
              this.h = true;
            }
          },
          setStrokeColor: function(val) {
            if (this.r != val) {
              this.r = val;
              this.h = true;
            }
          },
          u: function(val) {
            if (val != this.w) {
              this.w = val;
              this.h = true;
            }
          },
          F: function() {
            if (null == this.l) {
              this.l = document.createElement('canvas');
              this.O = this.l.getContext('2d');
            }
            if (this.h) {
              this.h = false;
              var items = this.l;
              var context = this.O;
              var value = this.w;
              var scale = this.v;
              var size = this.q;
              var font = size + 'px Ubuntu';
              context.font = font;
              var extra = ~~(0.2 * size);
              items.width = (context.measureText(value).width + 6) * scale;
              items.height = (size + extra) * scale;
              context.font = font;
              context.scale(scale, scale);
              context.globalAlpha = 1;
              context.lineWidth = 3;
              context.strokeStyle = this.r;
              context.fillStyle = this.N;
              if (this.P) {
                context.strokeText(value, 3, size - extra / 2);
              }
              context.fillText(value, 3, size - extra / 2);
            }
            return this.l;
          }
        };
        if (!Date.now) {
          Date.now = function() {
            return new Date().getTime();
          };
        }
        (function() {
          for (var g_skinNamesB = [
                'ms',
                'moz',
                'webkit',
                'o'
              ], i = 0; i < g_skinNamesB.length && !window.requestAnimationFrame; ++i) {
            window.requestAnimationFrame = window[g_skinNamesB[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[g_skinNamesB[i] + 'CancelAnimationFrame'] || window[g_skinNamesB[i] + 'CancelRequestAnimationFrame'];
          }
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(rect) {
              return setTimeout(rect, 1000 / 60);
            };
            window.cancelAnimationFrame = function(item) {
              clearTimeout(item);
            };
          }
        }());
        var QTreeFactory = {
          X: function(item) {
            function __unmatched_379(val) {
              if (val < __unmatched_381) {
                val = __unmatched_381;
              }
              if (val > __unmatched_383) {
                val = __unmatched_383;
              }
              return ~~((val - __unmatched_381) / 32);
            }
            function __unmatched_380(__unmatched_389) {
              if (__unmatched_389 < __unmatched_382) {
                __unmatched_389 = __unmatched_382;
              }
              if (__unmatched_389 > __unmatched_384) {
                __unmatched_389 = __unmatched_384;
              }
              return ~~((__unmatched_389 - __unmatched_382) / 32);
            }
            var __unmatched_381 = item.ba;
            var __unmatched_382 = item.ca;
            var __unmatched_383 = item.Z;
            var __unmatched_384 = item.$;
            var depth = ~~((__unmatched_383 - __unmatched_381) / 32) + 1;
            var maxDepth = ~~((__unmatched_384 - __unmatched_382) / 32) + 1;
            var point = Array(depth * maxDepth);
            return {
              Y: function(__unmatched_390) {
                var __unmatched_391 = __unmatched_379(__unmatched_390.x) + __unmatched_380(__unmatched_390.y) * depth;
                if (null == point[__unmatched_391]) {
                  point[__unmatched_391] = __unmatched_390;
                } else if (Array.isArray(point[__unmatched_391])) {
                  point[__unmatched_391].push(__unmatched_390);
                } else {
                  point[__unmatched_391] = [
                    point[__unmatched_391],
                    __unmatched_390
                  ];
                }
              },
              ea: function(__unmatched_392, __unmatched_393, val, __unmatched_395, callback) {
                var __unmatched_397 = __unmatched_379(__unmatched_392);
                var __unmatched_398 = __unmatched_380(__unmatched_393);
                __unmatched_392 = __unmatched_379(__unmatched_392 + val);
                __unmatched_393 = __unmatched_380(__unmatched_393 + __unmatched_395);
                if (0 > __unmatched_397 || __unmatched_397 >= depth || 0 > __unmatched_398 || __unmatched_398 >= maxDepth) {
                  debugger;
                }
                for (; __unmatched_398 <= __unmatched_393; ++__unmatched_398) {
                  for (__unmatched_395 = __unmatched_397; __unmatched_395 <= __unmatched_392; ++__unmatched_395) {
                    if (val = point[__unmatched_395 + __unmatched_398 * depth], null != val) {
                      if (Array.isArray(val)) {
                        for (var i = 0; i < val.length; i++) {
                          callback(val[i]);
                        }
                      } else {
                        callback(val);
                      }
                    }
                  }
                }
              }
            };
          }
        };
        var __unmatched_144 = function() {
          var __unmatched_400 = new Cell(0, 0, 0, 32, '#ED1C24', '');
          var __unmatched_401 = document.createElement('canvas');
          __unmatched_401.width = 32;
          __unmatched_401.height = 32;
          var rect = __unmatched_401.getContext('2d');
          return function() {
            if (0 < g_playerCells.length) {
              __unmatched_400.color = g_playerCells[0].color;
              __unmatched_400.t(g_playerCells[0].name);
            }
            rect.clearRect(0, 0, 32, 32);
            rect.save();
            rect.translate(16, 16);
            rect.scale(0.4, 0.4);
            __unmatched_400.s(rect);
            rect.restore();
            var __unmatched_403 = document.getElementById('favicon');
            var __unmatched_404 = __unmatched_403.cloneNode(true);
            __unmatched_404.setAttribute('href', __unmatched_401.toDataURL('image/png'));
            __unmatched_403.parentNode.replaceChild(__unmatched_404, __unmatched_403);
          };
        }();
        $(function() {
          __unmatched_144();
        });
        var i_ = 'loginCache3';
        $(function() {
          if (+window.localStorage.wannaLogin) {
            if (window.localStorage[i_]) {
              __unmatched_47(window.localStorage[i_]);
            }
            if (window.localStorage.fbPictureCache) {
              $('.agario-profile-picture').attr('src', window.localStorage.fbPictureCache);
            }
          }
        });
        window.facebookLogin = function() {
          window.localStorage.wannaLogin = 1;
        };
        window.fbAsyncInit = function() {
          function __unmatched_405() {
            window.localStorage.wannaLogin = 1;
            if (null == window.FB) {
              alert('You seem to have something blocking Facebook on your browser, please check for any extensions');
            } else {
              window.FB.login(function(callback) {
                UpdateScale(callback);
              }, {
                scope: 'public_profile, email'
              });
            }
          }
          window.FB.init({
            appId: '677505792353827',
            cookie: true,
            xfbml: true,
            status: true,
            version: 'v2.2'
          });
          window.FB.Event.subscribe('auth.statusChange', function(__unmatched_407) {
            if (+window.localStorage.wannaLogin) {
              if ('connected' == __unmatched_407.status) {
                UpdateScale(__unmatched_407);
              } else {
                __unmatched_405();
              }
            }
          });
          window.facebookLogin = __unmatched_405;
        };
        window.logout = function() {
          __unmatched_112 = null;
          $('#helloContainer').attr('data-logged-in', '0');
          $('#helloContainer').attr('data-has-account-data', '0');
          delete window.localStorage.wannaLogin;
          delete window.localStorage[i_];
          delete window.localStorage.fbPictureCache;
          Start();
        };
        var __unmatched_146 = function() {
          function ParseString(width, top, callback, height, left) {
            var __unmatched_422 = top.getContext('2d');
            var __unmatched_423 = top.width;
            top = top.height;
            width.color = left;
            width.t(callback);
            width.size = height;
            __unmatched_422.save();
            __unmatched_422.translate(__unmatched_423 / 2, top / 2);
            width.s(__unmatched_422);
            __unmatched_422.restore();
          }
          for (var __unmatched_409 = new Cell(-1, 0, 0, 32, '#5bc0de', ''), __unmatched_410 = new Cell(-1, 0, 0, 32, '#5bc0de', ''), __unmatched_411 = '#0791ff #5a07ff #ff07fe #ffa507 #ff0774 #077fff #3aff07 #ff07ed #07a8ff #ff076e #3fff07 #ff0734 #07ff20 #ff07a2 #ff8207 #07ff0e'.split(' '), g_skinNamesC = [], j = 0; j < __unmatched_411.length; ++j) {
            var sub = j / __unmatched_411.length * 12;
            var __unmatched_415 = 30 * Math.sqrt(j / __unmatched_411.length);
            g_skinNamesC.push(new Cell(-1, Math.cos(sub) * __unmatched_415, Math.sin(sub) * __unmatched_415, 10, __unmatched_411[j], ''));
          }
          __unmatched_45(g_skinNamesC);
          var data = document.createElement('canvas');
          data.getContext('2d');
          data.width = data.height = 70;
          ParseString(__unmatched_410, data, '', 26, '#ebc0de');
          return function() {
            $('.cell-spinner').filter(':visible').each(function() {
              var __unmatched_424 = $(this);
              var g = Date.now();
              var width = this.width;
              var __unmatched_427 = this.height;
              var item = this.getContext('2d');
              item.clearRect(0, 0, width, __unmatched_427);
              item.save();
              item.translate(width / 2, __unmatched_427 / 2);
              for (var g_numFrames = 0; 10 > g_numFrames; ++g_numFrames) {
                item.drawImage(data, (0.1 * g + 80 * g_numFrames) % (width + 140) - width / 2 - 70 - 35, __unmatched_427 / 2 * Math.sin((0.001 * g + g_numFrames) % Math.PI * 2) - 35, 70, 70);
              }
              item.restore();
              if (__unmatched_424 = __unmatched_424.attr('data-itr')) {
                __unmatched_424 = Render(__unmatched_424);
              }
              ParseString(__unmatched_409, this, __unmatched_424 || '', +$(this).attr('data-size'), '#5bc0de');
            });
            $('#statsPellets').filter(':visible').each(function() {
              $(this);
              var height = this.width;
              var __unmatched_431 = this.height;
              this.getContext('2d').clearRect(0, 0, height, __unmatched_431);
              for (height = 0; height < g_skinNamesC.length; height++) {
                ParseString(g_skinNamesC[height], this, '', g_skinNamesC[height].size, g_skinNamesC[height].color);
              }
            });
          };
        }();
        window.createParty = function() {
          n(':party');
          __unmatched_129 = function(rect) {
            __unmatched_51('/#' + window.encodeURIComponent(rect));
            $('.partyToken').val('agar.io/#' + window.encodeURIComponent(rect));
            $('#helloContainer').attr('data-party-state', '1');
          };
          Start();
        };
        window.joinParty = RenderLoop;
        window.cancelParty = function() {
          __unmatched_51('/');
          $('#helloContainer').attr('data-party-state', '0');
          n('');
          Start();
        };
        var points = [];
        var __unmatched_148 = 0;
        var __unmatched_149 = '#000000';
        var __unmatched_150 = false;
        var __unmatched_151 = false;
        var __unmatched_152 = 0;
        var __unmatched_153 = 0;
        var __unmatched_154 = 0;
        var __unmatched_155 = 0;
        var g_mode = 0;
        var __unmatched_157 = true;
        setInterval(function() {
          if (__unmatched_151) {
            points.push(__unmatched_37() / 100);
          }
        }, 1000 / 60);
        setInterval(function() {
          var start = __unmatched_54();
          if (0 != start) {
            ++__unmatched_154;
            if (0 == g_mode) {
              g_mode = start;
            }
            g_mode = Math.min(g_mode, start);
          }
        }, 1000);
        window.closeStats = function() {
          __unmatched_150 = false;
          $('#stats').hide();
          __unmatched_14(window.ab);
          __unmatched_10(0);
        };
        window.setSkipStats = function(__unmatched_434) {
          __unmatched_157 = !__unmatched_434;
        };
        $(function() {
          $(Init);
        });
      }
    }
  }
}(window, window.jQuery));