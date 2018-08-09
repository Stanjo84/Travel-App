require('dotenv').config();

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Place           = require("./models/place"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds")


// requiring routes from separate location    
var commentRoutes       = require("./routes/comments"),
    placeRoutes         = require("./routes/places"),
    userRoutes          = require("./routes/users"),
    indexRoutes         = require("./routes/index");
    
    
console.log(process.env.DATABASEURL);    
    
    
//mongoose.connect("mongodb://localhost/chtravel_v1");
mongoose.connect("mongodb://travel-admin:stans84@ds115442.mlab.com:15442/travel-app");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash()); 
//seedDB(); // seed (empty) the database

app.locals.moment = require("moment");

// PASSPORT Configuration
app.use(require("express-session")({
    secret: "Chubby Dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   // flash for displaying a pop-up message
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/places", placeRoutes);
app.use("/places/:id/comments", commentRoutes);
app.use("/users", userRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("App Has Been Started");
});