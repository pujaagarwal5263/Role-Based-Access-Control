const router = require("express").Router();
const User = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { ensureLoggedOut, ensureLoggedIn } = require("connect-ensure-login");
const { registerValidator } = require("../utils/validators");

router.get(
  "/login",
  ensureLoggedOut({ redirectTo: '/' }),
  //ensureNOTAuthenticated,
  async (req, res, next) => {
    res.render("login");
  }
);

router.post(
  '/login',
 ensureLoggedOut({ redirectTo: '/' }),
 // ensureNOTAuthenticated,
  passport.authenticate('local', {
    // successRedirect: '/',
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get(
  "/register",
  ensureLoggedOut({ redirectTo: '/' }),
  //ensureNOTAuthenticated,
  async (req, res, next) => {
    // req.flash('info',"this is an error")
    // const messages= req.flash();

    res.render("register");
  }
);

router.post(
  "/register",
  ensureLoggedOut({ redirectTo: '/' }),
  //ensureNOTAuthenticated,
   registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/auth/register');
        return;
      }

      const user = new User(req.body);
      await user.save();
      //res.send(user);
      req.flash(
        'success',
        `${user.email} registered succesfully, you can now login`
      );
      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/logout",
  ensureLoggedIn({ redirectTo: "/" }),
  //ensureAuthenticated,
  async (req, res, next) => {
    req.logout();
    res.redirect("/");
  }
);

module.exports = router;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

function ensureNOTAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('back');
  } else {
    next();
  }
}
