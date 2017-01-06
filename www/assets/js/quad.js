var Quad = {
    init: function(args) {
        function Node(x, y, w, h, depth) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.depth = depth;
            this.items = [];
            this.nodes = [];
        }

        var c = args.maxChildren || 2,
            d = args.maxDepth || 4;
        Node.prototype = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            depth: 0,
            items: null,
            nodes: null,
            exists: function(selector) {
                for (var i = 0; i < this.items.length; ++i) {
                    var item = this.items[i];
                    if (item.x >= selector.x && item.y >= selector.y && item.x < selector.x + selector.w && item.y < selector.y + selector.h) return true
                }
                if (0 != this.nodes.length) {
                    var self = this;
                    return this.findOverlappingNodes(selector, function(dir) {
                        return self.nodes[dir].exists(selector);
                    });
                }
                return false;
            },
            retrieve: function(item, callback) {
                for (var i = 0; i < this.items.length; ++i) callback(this.items[i]);
                if (0 != this.nodes.length) {
                    var self = this;
                    this.findOverlappingNodes(item, function(dir) {
                        self.nodes[dir].retrieve(item, callback);
                    });
                }
            },
            insert: function(a) {
                if (0 != this.nodes.length) {
                    this.nodes[this.findInsertNode(a)].insert(a);
                } else {
                    if (this.items.length >= c && this.depth < d) {
                        this.devide();
                        this.nodes[this.findInsertNode(a)].insert(a);
                    } else {
                        this.items.push(a);
                    }
                }
            },
            getItemCount: function() {
                if (0 != this.nodes.length)
                    return this.nodes[0].getItemCount() + this.nodes[1].getItemCount() + this.nodes[2].getItemCount() + this.nodes[3].getItemCount();

                return this.items.length;
            },
            findInsertNode: function(a) {
                return a.x < this.x + this.w / 2 ? a.y < this.y + this.h / 2 ? 0 : 2 : a.y < this.y + this.h / 2 ? 1 : 3;
            },
            findOverlappingNodes: function(a, b) {
                return a.x < this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(0) || a.y >= this.y + this.h / 2 && b(2)) || a.x >= this.x + this.w / 2 && (a.y < this.y + this.h / 2 && b(1) || a.y >= this.y + this.h / 2 && b(3)) ? true : false;
            },
            devide: function() {
                var a = this.depth + 1,
                    c = this.w / 2,
                    d = this.h / 2;
                this.nodes.push(new Node(this.x, this.y, c, d, a));
                this.nodes.push(new Node(this.x + c, this.y, c, d, a));
                this.nodes.push(new Node(this.x, this.y + d, c, d, a));
                this.nodes.push(new Node(this.x + c, this.y + d, c, d, a));
                a = this.items;
                this.items = [];
                for (c = 0; c < a.length; c++) this.insert(a[c]);
            },
            clear: function() {
                for (var a = 0; a < this.nodes.length; a++) this.nodes[a].clear();
                this.items.length = 0;
                this.nodes.length = 0;
            }
        };
        var internalSelector = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
        return {
            root: new Node(args.minX, args.minY, args.maxX - args.minX, args.maxY - args.minY, 0),
            insert: function(a) {
                this.root.insert(a);
            },
            retrieve: function(a, b) {
                this.root.retrieve(a, b);
            },
            retrieve2: function(a, b, c, d, callback) {
                internalSelector.x = a;
                internalSelector.y = b;
                internalSelector.w = c;
                internalSelector.h = d;
                this.root.retrieve(internalSelector, callback);
            },
            getItemCount: function() {
                return this.root.getItemCount();
            },
            exists: function(a) {
                return this.root.exists(a);
            },
            clear: function() {
                this.root.clear();
            }
        }
    }
};
