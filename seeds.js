var mongoose = require("mongoose");
var Place = require("./models/place");
var Comment = require("./models/comment");

var data = [
    {
       name: "Forest Resort",
       image: "https://res.cloudinary.com/twenty20/private_images/t_watermark-criss-cross-10/v1443562284000/photosp/ceb1fcac-e6a6-4e1e-81c0-0cff47ca0967/stock-photo-outdoors-food-camping-drink-morning-breakfast-coffee-campfire-stove-ceb1fcac-e6a6-4e1e-81c0-0cff47ca0967.jpg",
       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
       name: "By the Water",
       image: "https://res.cloudinary.com/twenty20/private_images/t_watermark-criss-cross-10/v1444279119000/photosp/6c7e9471-1bc3-40b1-80a0-8b9ac1ed889c/stock-photo-outdoors-park-travel-camping-tent-adventure-mountain-hiking-valley-6c7e9471-1bc3-40b1-80a0-8b9ac1ed889c.jpg",
       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
       name: "Night Lake",
       image: "https://res.cloudinary.com/twenty20/private_images/t_watermark-criss-cross-10/v1440831998000/photosp/da4a9cd4-5956-4594-87b7-1c0867250fa4/stock-photo-travel-camping-adventure-joshua-tree-rocks-stars-camp-astrophotography-camper-da4a9cd4-5956-4594-87b7-1c0867250fa4.jpg",
       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
];


function seedDB(){
    // Remove all places
    Place.remove({}, function(err){
        if(err){
            console.log(err);
        } 
        console.log("removed places");
         // add a few places
        data.forEach(function(seed){
            Place.create(seed, function(err, place){
            if(err){
                console.log(err);
            } else {
                console.log("added a new place");
                // create a comment
                Comment.create(
                    {
                        text: "This place is great but I wish there were no mosquitos",
                        author: "Plato"
                    }, function(err, comment){
                        if(err){
                            console.log(err);
                        } else {
                            place.comments.push(comment);
                            place.save();
                            console.log("new comment created");
                        }
                        
                    });
            }
        });
        });
    });
   
    
    // add a few comments
}
module.exports = seedDB;