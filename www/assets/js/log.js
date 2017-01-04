log = {
    // 0 - Only info
    // 1 - Info & warns
    // 2 - Info, warns & errors
    // 3 - All
    VERBOSITY: 3,

    info: function(str) {
		console.info("[INFO]", str);
	},

	warn: function(str) {
        if (log.VERBOSITY < 1) return;
		console.warn("[WARN]", str);
	},

	err: function(str) {
        if (log.VERBOSITY < 2) return;
		console.error("[ERROR]", str);
	},

	debug: function(str) {
        if (log.VERBOSITY < 3) return;
		console.debug("[DEBUG]", str);
	}
}

var LOAD_START = new Date();
