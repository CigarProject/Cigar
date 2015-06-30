var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('game', {title: 'Ogar', game: true});
});

router.get('/gallery', function (req, res, next) {
    res.render('gallery', {title: 'Ogar skins', gallery: true});
});

module.exports = router;
