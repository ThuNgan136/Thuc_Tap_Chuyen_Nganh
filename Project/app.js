var createError = require('http-errors');
var express = require('express');
const {engine}= require('express-handlebars');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
app.engine(
    'hbs',
    engine( {
    extname: '.hbs',
    defaultLayout: 'home',
    partialsDir: path.join(__dirname, 'views','partials'),
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
})
);
const session = require('express-session');

app.use(session({
    secret: 'mysecretkey',      // chuỗi bí mật để mã hóa session
    resave: false,               // không lưu session nếu không thay đổi
    saveUninitialized: false,    // không tạo session nếu chưa có dữ liệu
    cookie: { maxAge: 1000*60*60 } // thời gian sống cookie (1 giờ)
}));


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var shopRouter = require('./routes/shop');
var usersRouter = require('./routes/users');
const {Router} = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://127.0.0.1/node')
    .then(()=>{
        console.log('MongoDB Connected Successfully!!!!');
    })
    .catch((err)=>{
        console.log('MongoDB Connected Error:', err);
    });
app.post('/signup', async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // kiểm tra user đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();

        // trả về thông tin user (không trả password)
        const userData = {
            email: newUser.email,
            phone: newUser.phone
        };

        res.status(201).json({ message: "User registered", user: userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const match = await bcryptjs.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Wrong password" });

        req.session.user = { email: user.email, phone: user.phone };
        res.json({ user: req.session.user, redirect: "/home/index" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logged out" });
    });
});
app.get('/home/index', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('home/index', { user: req.session.user });
});
app.post('/register',  (req,res) => {
        console.log(req.body);
        const newUser = new User();
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        bcryptjs.genSalt(10, function (err, salt) {
            bcryptjs.hash(newUser.password, salt, function (err, hash) {
                if (err) {return  err}
                newUser.password = hash;

                newUser.save().then(userSave=>
                {
                    res.send('USER SAVED');
                }).catch(err => {
                    res.send('USER ERROR'+err);
                });
            });
        });
    }
);





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
app.use('/', indexRouter);
app.use('/shop',shopRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req,
                 res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
