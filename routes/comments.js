var express = require("express");
var router = express.Router({mergeParams: true});
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");


// Comments New Route
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find place by id
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {place: place});
        }
    });
});


// Comments Create Route
router.post("/", middleware.isLoggedIn, function(req, res){
    // lookup place using ID
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
            res.redirect("/places");
        } else {
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "Something went wrong!");
                   console.log(err);
               } else {
                   // add username and id to comments
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   // save comment
                   comment.save();
                   place.comments.push(comment);
                   place.save();
                   req.flash("success", "Successfully added comment");
                   res.redirect('/places/' + place._id);
               }
           });
        }
    });
});

// Comments Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Place.findById(req.params.id, function(err, foundPlace) {
       if(err || !foundPlace){
           req.flash("error", "No such place found");
           return res.redirect("back");
       } 
       Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {place_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// Comments Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComments){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/places/" + req.params.id);
        }
    });
});

// Comments Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //findByIdAndRemove 
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
            res.redirect("back");
       } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/places/" + req.params.id);  
       }
   });
});

module.exports = router;