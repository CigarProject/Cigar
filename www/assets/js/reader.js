function Reader(view, offset, littleEndian) {
    this.view = view;
    this._e = littleEndian;
    this._o = 0;
}
Reader.prototype = {
    reader: true,
    getUint8: function() {
        return this.view.getUint8(this._o++, this._e);
    },
    getInt8: function() {
        return this.view.getInt8(this._o++, this._e);
    },
    getUint16: function() {
        return this.view.getUint16((this._o += 2) - 2, this._e);
    },
    getInt16: function() {
        return this.view.getInt16((this._o += 2) - 2, this._e);
    },
    getUint32: function() {
        return this.view.getUint32((this._o += 4) - 4, this._e);
    },
    getInt32: function() {
        return this.view.getInt32((this._o += 4) - 4, this._e);
    },
    getFloat32: function() {
        return this.view.getFloat32((this._o += 4) - 4, this._e);
    },
    getFloat64: function() {
        return this.view.getFloat64((this._o += 8) - 8, this._e);
    },
    getStringUTF8: function() {
        var s = "", b;
        while ((b = this.view.getUint8(this._o++)) !== 0) s += String.fromCharCode(b);

        return decodeURIComponent(escape(s));
    }
};
