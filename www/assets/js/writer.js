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
        // Thanks to Damian from StackOverflow
        // Original can be found at http://stackoverflow.com/questions/18729405
        var utf8 = [];
        for (var i = 0, l = s.length; i < l; i++) {
            var ch = s.charCodeAt(i);
            if (ch < 0x80) utf8.push(ch);
            else if (ch < 0x800) {
                utf8.push(0xc0 | (ch >> 6),
                          0x80 | (ch & 0x3f));
            }
            else if (ch < 0xd800 || ch >= 0xe000) {
                utf8.push(0xe0 | (ch >> 12),
                          0x80 | ((ch>>6) & 0x3f),
                          0x80 | (ch & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                ch = 0x10000 + (((ch & 0x3ff) << 10)
                          | (s.charCodeAt(i) & 0x3ff))
                utf8.push(0xf0 | (ch >> 18),
                          0x80 | ((ch >> 12) & 0x3f),
                          0x80 | ((ch >> 6) & 0x3f),
                          0x80 | (ch & 0x3f));
            }
        }
        this._b = this._b.concat(utf8);
    },
    build: function() {
        return new Uint8Array(this._b);
    }
};
