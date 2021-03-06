var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Place = require("../models/place");
var Comment = require("../models/comment");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");



// Root route
router.get("/", function(req, res){
   res.render("landing");
});

// ===========
// AUTH ROUTES
// ===========

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// Handle register logic
router.post("/register", function(req, res) {
    var newUser = new User({
            username: req.body.username, 
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    
    if(req.body.adminCode === "Drone456") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Swiss Travels " + user.username);
            res.redirect("/places"); 
        });
    });
});

// Show login form
router.get("/login", function(req, res) {
   res.render("login", {page: 'login'}); 
});

// handling login logic + success login message
router.post("/login", function (req, res, next) {
  passport.authenticate("local",
    {
      successRedirect: "/places",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome back, " + req.body.username + "!"
    })(req, res);
});


// logout logic route
router.get("/logout", function(req, res) {
    req.logout();
     // flash for displaying a logout pop-up message
    req.flash("success", "You have logged out!");
    res.redirect("/places");
});

// forgot password
router.get("/forgot", function(req, res) {
  res.render("forgot");
});

router.post("/forgot", function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
},
       function(token, user, done){
           var smtpTransport = nodemailer.createTransport({
               service: "Gmail",
               auth: {
                   user: "infosstrawa@gmail.com", // set email
                   pass: process.env.GMAILPW
               }
           });
           var mailOptions ={
               to: user.email,
               from: "infosstrawa@gmail.com",
               subject: "Password Reset Request",
               text: "You have clicked password reset. This link is only valid for 1 hour. \n\n" +
                    "Please click on the following link:\n\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, you can ignore this email.\n"
           };
        smtpTransport.sendMail(mailOptions, function(err) {
            console.log("mail sent");
            req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
            done(err, "done");
        });
       }
       ], 
       function(err) {
        if (err) return next(err);
        res.redirect("/forgot");
       }); 
});

router.get("/reset/:token", function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    res.render("reset", {token: req.params.token});
  });
});

router.post("/reset/:token", function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("back");
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect("back");
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail", 
        auth: {
          user: "infosstrawa@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: "infosstrawa@gmail.com",
        subject: "Your password has been changed",
        text: "Hello,\n\n" +
          "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash("success", "Success! Your password has been changed.");
        done(err);
      });
    }
  ], function(err) {
    res.redirect("/places");
  });
});

module.exports = router;