var mongoose = require("mongoose");

// Schema setup
var placeSchema = new mongoose.Schema({
    name: String,
    canton: String,
    price: String,
    image: String,
    imageId: String,
    description: String,
    location: String,
    lat: String,
    lng: String,
    createdAt: { type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

var Place = mongoose.model("Place", placeSchema);
module.exports = Place;