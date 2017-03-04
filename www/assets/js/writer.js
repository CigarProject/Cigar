var __buf = new DataView(new ArrayBuffer(8));

function Writer(littleEndian) {
    this._b = [];
    this._e = littleEndian;
    this._o = 0;
}
Writer.prototype = {
    writer: true,
    setUint8: function(a) {
        if (a >= 0 && a < 256) this._b.push(a);
    },
    setInt8: function(a) {
        if (a >= -128 && a < 128) this._b.push(a);
    },
    setUint16: function(a) {
        __buf.setUint16(0, a, this._e);
        this._move(2);
    },
    setInt16: function(a) {
        __buf.setInt16(0, a, this._e);
        this._move(2);
    },
    setUint32: function(a) {
        __buf.setUint32(0, a, this._e);
        this._move(4);
    },
    setInt32: function(a) {
        __buf.setInt32(0, a, this._e);
        this._move(4);
    },
    setFloat32: function(a) {
        __buf.setFloat32(0, a, this._e);
        this._move(4);
    },
    setFloat64: function(a) {
        __buf.setFloat64(0, a, this._e);
        this._move(8);
    },
    _move: function(b) {
        for (var i = 0; i < b; i++) this._b.push(__buf.getUint8(i));
    },
    setStringUTF8: function(s) {
        var bytesStr = unescape(encodeURIComponent(s));
        for (var i = 0, l = bytesStr.length; i < l; i++) this._b.push(bytesStr.charCodeAt(i));
        this._b.push(0);
    },
    build: function() {
        return new Uint8Array(this._b);
    }
};
