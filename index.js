const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
require("./db-connection")
const session = require('express-session');
const connectFlash=require('connect-flash');
const passport=require('passport');
const connectMongo = require("connect-mongo");
const connectEnsureLogin = require("connect-ensure-login");
const { roles } = require('./utils/constants');

const app = express();
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MongoStore= connectMongo(session)
//init session
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    
    cookie: {
        httpOnly: true,
      },
     store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  );

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use("/",require("./routes/index.route"))
app.use("/auth",require("./routes/auth.route"))
app.use("/user",connectEnsureLogin.ensureLoggedIn({redirectTo: '/auth/login'}),require("./routes/user.route"))
app.use("/admin",connectEnsureLogin.ensureLoggedIn({redirectTo: '/auth/login'}),
ensureAdmin,
require("./routes/admin.route"))

app.use((req,res,next)=>{
    next(createHttpError.NotFound());
})

// Error Handler
app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status);
    res.render('error_40x', { error });
});
  
app.listen(3000,()=>{
    console.log("server running at 3000");
})

function ensureAdmin(req, res, next) {
    console.log(roles.admin);
    if (req.user.role === roles.admin) {
      next();
    } else {
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }
  
  function ensureModerator(req, res, next) {
    if (req.user.role === roles.moderator) {
      next();
    } else {
      req.flash('warning', 'you are not Authorized to see this route');
      res.redirect('/');
    }
  }
