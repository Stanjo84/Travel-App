var Place= require("../models/place");
var Comment = require("../models/comment");
var User = require("../models/user");


// ALL MIDDLEWARE

var middlewareObj = {};
    
    
middlewareObj.checkPlaceOwnership = function(req, res, next) {
        if(req.isAuthenticated()){
            Place.findById(req.params.id, function (err, foundPlace){
                if(err || !foundPlace){
                    req.flash("error", "Place not found!");
                    res.redirect("back");
                 } else {
                    // does user own the place?
                    if(foundPlace.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                    } else {
                        req.flash("error", "You can't do that!");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to log in first!");
            res.redirect("back");
        }
    }


middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function (err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
             } else {
                // does user own the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
                } else {
                req.flash("error", "You can't do that!");
                res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkUserOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        User.findById(req.params.id, function (err, foundUser){
            if(err || !foundUser){
                req.flash("error", "Comment not found");
                res.redirect("back");
             } else {
                // does user own the comment?
                if(foundUser._id.equals(req.user.id) || req.user.isAdmin){
                next();
                } else {
                req.flash("error", "You can't do that!");
                res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to log in first!");
    res.redirect("/login");
}

module.exports = middlewareObj;