var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var hbs = require('hbs');

var routes = require('./routes/index');

var masterServer = null;

var app = express();

app.setMaster = function (server) {
    masterServer = server;
    this.updateRegions();
};

app.updateRegions = function () {
    app.locals.regions = [];
    for (var key in masterServer.REGIONS) {
        switch (key) {
            case 'US-Fremont':
                app.locals.regions.push({val: key, name: 'US West'});
                break;
            case 'US-Atlanta':
                app.locals.regions.push({val: key, name: 'US East'});
                break;
            case 'BR-Brazil':
                app.locals.regions.push({val: key, name: 'South America'});
                break;
            case 'EU-London':
                app.locals.regions.push({val: key, name: 'Europe'});
                break;
            case 'RU-Russia':
                app.locals.regions.push({val: key, name: 'Russia'});
                break;
            case 'TK-Turkey':
                app.locals.regions.push({val: key, name: 'Turkey'});
                break;
            case 'JP-Tokyo':
                app.locals.regions.push({val: key, name: 'East Asia'});
                break;
            case 'CN-China':
                app.locals.regions.push({val: key, name: 'China'});
                break;
            case 'SG-Singapore':
                app.locals.regions.push({val: key, name: 'Oceania'});
                break;
            default:
                app.locals.regions.push({val: key, name: key.split('-').join(' ')});
        }
    }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* variables */
app.locals.regions = [];
app.locals.modes = [{val: '', name: 'FFA'},
    {val: ':teams', name: 'Teams'},
    {val: ':experimental', name: 'Experimental'}];

// uncomment to display links at the bottom of the login page
//app.locals.links = [{val: 'tos.html', name: 'Terms of Service'}, {val: '#', name: 'Another link...'}];

// uncomment to use a banner
//app.locals.banner = '/img/banner.png';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(busboy({limits: {fileSize: 512 * 1024}}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/', routes);

app.post('/', function (req, res, next) {
    var post = req.body;
    // Data
    var key = Object.keys(post)[0];

    if (key in masterServer.REGIONS) {
        // Send if region exists
        post = masterServer.getServer(key);
    } else {
        // Region does not exist!
        post = "0.0.0.0";
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(post);
});

app.get('/info', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify(masterServer.info));
});

app.locals.skins = [];

app.locals.checkdir = function (maxage, suffix) {
    var cache = null,
        timestamp = Date.now() - maxage - 1;

    return function (cb) {
        if (cache == null || (Date.now() - timestamp) > maxage) {
            fs.readdir(path.join(__dirname, '..', '..', 'client', 'skins'), function (err, files) {
                timestamp = Date.now();
                if (err) {
                    cache = {action: 'test', err: true};
                    cb(cache);
                }
                var tmp = {action: 'test', names: []};
                for (var i = 0; i < files.length; i++) {
                    if (files[i].length > suffix.length && files[i].slice(-suffix.length) === suffix) {
                        tmp.names.push(files[i].slice(0, -suffix.length));
                    }
                }
                cache = tmp;
                app.locals.skins = tmp.names;
                cb(cache);
            });
        } else {
            cb(cache);
        }
    }
}(500, '.png');
app.locals.checkdir(function(){});

hbs.registerHelper('eachSkin', function (options) {
    var ret = "";

    if (app.locals.skins != null) {
        for (var i = 0, j = app.locals.skins.length; i < j; i++) {
            ret = ret + options.fn({name: app.locals.skins[i]});
        }
    }

    return ret;
});

app.post('/checkdir', function (req, res, next) {
    if (req.body.hasOwnProperty('action') && req.body.action == 'test') {
        app.locals.checkdir(function (ret) {
            if (ret.hasOwnProperty('err')) {
                res.writeHead(500);
                res.end(JSON.stringify(ret));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(ret));
            }
        });
    }
});

app.use(express.static(path.join(__dirname, '..', '..', 'client')));

app.get('/upload', function (req, res, next) {
    res.redirect('/');
});

app.post('/upload', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        if (fieldname == 'avatar' && filename.lastIndexOf('.png') == filename.length - 4) {
            var outfile = path.join(__dirname, '..', '..', 'client', 'skins', filename);
            fs.stat(outfile, function (err, stats) {
                if (err && err.code == 'ENOENT') {
                    fstream = fs.createWriteStream(outfile);
                    file.pipe(fstream);
                    fstream.on('close', function () {
                        if (file.truncated) {
                            fs.unlink(outfile, function (err) {
                                if (err) throw err;
                                res.redirect('/?uploaderr=toobig');
                            });
                        } else {
                            res.redirect('/?nick=' + filename.substr(0, filename.length - 4));
                        }
                    });
                } else {
                    res.redirect('/?uploaderr=exists');
                }
            });
        } else {
            res.redirect('/?uploaderr=unknown');
        }
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
