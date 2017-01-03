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
        var bytes = [], b;
        while ((b = this.view.getUint8(this._o++)) !== 0) bytes.push(b);

        // Thanks to Albert from StackOverflow
        // (Semi-) Original can be found at http://stackoverflow.com/questions/17191945
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = bytes.length;
        i = 0;
        for ( ; i < len; ) {
            c = bytes[i++];
            switch(c >> 4)
            {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12: case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = bytes[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = bytes[i++];
                    char3 = bytes[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                break;
            }
        }

        return out;
    }
};
