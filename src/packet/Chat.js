function Chat(buf) {
    this.buf = buf;
}

module.exports = Chat;

Chat.prototype.build = function() {
    return this.buf;
};

