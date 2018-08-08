var express = require("express");
var User = require("../models/user");
var router = express.Router();
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");



// User Profile
router.get("/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/");
        } 
        Place.find().where("author.id").equals(foundUser._id).exec(function(err, places){
            if(err) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/");
        }
            res.render("users/show", {user: foundUser, places: places});
        });
    });
});


router.get("/:id/edit", middleware.checkUserOwnership, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err || !foundUser) {
            req.flash("error", "user not found!");
            res.redirect("back");
        }
        else {
            res.render("users/edit", { user: foundUser });
        }
    });
});

module.exports = router;