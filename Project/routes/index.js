var express = require('express');
var router = express.Router();

/* GET admin page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Express' });
});

router.get('/pages', function(req, res, next) {
    res.render('home/pages',{ title: 'pages' });
});

router.get('/shop', function(req, res, next) {
    res.render('home/shop',{ title: 'shop' });
});

router.get('/contact', function(req, res, next) {
    res.render('home/contact', { title: 'contact' });
});
router.get('/admin', function(req, res, next) {
    res.render('admin/admin', { title: 'admin' });
});



module.exports = router;
