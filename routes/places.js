var express = require("express");
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware/index.js");
var NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Wrong format only these are allowed: jpg, jpeg, png, gif"), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: "st4n5tr4w4", 
  api_key: "931879446334892", 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX Route - show all places
router.get("/", function(req, res){
    var noMatch = null;
    req.user
    if(req.query.search){
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Place.find({name: regex}, function(err, allPlaces){
       if(err){
           console.log(err);
       } else {
           if(allPlaces.length < 1){
               noMatch = "No matching places found.";
           }
           res.render("places/index", {places:allPlaces, page: 'places', noMatch: noMatch});
       }
    });
    } else {
            // get all places from DB
    Place.find({}, function(err, allPlaces){
       if(err){
           console.log(err);
       } else {
           res.render("places/index", {places:allPlaces, page: 'places', noMatch: noMatch});
       }
    });
    }
});


//CREATE - add new place to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
      // get data from form and add to places array
      var name = req.body.place.name;
      var canton = req.body.place.canton;
      var price = req.body.place.price;
      var image = req.body.place.image;
      var imageId = req.body.place.imageId;
      var desc = req.body.place.description;
      var author = {
        id: req.user._id,
        username: req.user.username
      };
      
      geocoder.geocode(req.body.place.location, function (err, data) {
        cloudinary.uploader.upload(req.file.path, function(result) {
          // add cloudinary url for the image to the place object under image property
          image = result.secure_url;
          imageId = result.public_id;
          moderation: "webpurify";
     
          if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
          }
          
          var lat = data[0].latitude;
          var lng = data[0].longitude;
          var location = data[0].formattedAddress;
          var newPlace = {name: name, canton: canton, price: price, image: image, imageId: imageId, description: desc, author:author, location: location, lat: lat, lng: lng};
          
          // Create a new place and save to DB
          Place.create(newPlace, function(err, newlyCreated){
            if(err){
              console.log(err);
            } else {
              //redirect back to place page
              console.log(newlyCreated);
              res.redirect("/places");
            }
          });
        });
      });
    });

// NEW - Display Form to add new place
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("places/new");
});

// SHOW - shows more info about one place
router.get("/:id", function(req, res){
    // find the place with provided ID
    Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace){
        if(err || !foundPlace){
            req.flash("error", "Place not found!");
            res.redirect("back");
        } else {
            console.log(foundPlace);
             // render show template with that place
            res.render("places/show", {place: foundPlace});
        }
    });
});

// Edit Place Route
router.get("/:id/edit", middleware.checkPlaceOwnership, function(req, res) {
    Place.findById(req.params.id, function (err, foundPlace){
        res.render("places/edit", {place: foundPlace});
    });
});

// UPDATE Place Route
router.put("/:id", middleware.checkPlaceOwnership, upload.single("image"), function(req, res){
  geocoder.geocode(req.body.place.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
       

    Place.findById(req.params.id, async function(err, place){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(place.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  place.imageId = result.public_id;
                  place.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            place.name = req.body.place.name;
            place.canton = req.body.place.canton
            place.description = req.body.place.description;
            place.location = location;
            place.lat = data[0].latitude;
            place.lng =data[0].longitude;
            place.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/places/" + place._id);
        }
    });
});
});



// Destroy Place Route
router.delete('/:id', function(req, res) {
  Place.findById(req.params.id, async function(err, place) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(place.imageId);
        place.remove();
        req.flash('success', 'Place deleted successfully!');
        res.redirect('/places');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;