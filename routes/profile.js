var User = require('../models/users.js');
var Weapon = require('../models/weapons.js');

var express = require('express');
var router = express.Router();


router.get('/locationfield', function(req, res, next) {
  res.render('profile', {user: req.user});
});

router.post('/locationfield/locate', function (req, res) {

          var data = req.body;

          var date = new Date();
          var username = req.user.username;


          User.findOne({username:username}, function(err, user) {
            if (err) return handleErr(err);

            // coordinates: [data.longitude, data.latitude]
            find = {
              coordinates: [ parseFloat(data.latitude), parseFloat(data.longitude) ],
              datetime: date
            };

            user.location = find;
            user.save();

          });

  });

router.get('/locationfield/scan', function (req, res) {

    var date = new Date();
    var minusmin = date.setMinutes(date.getMinutes() - 60);

    var geoJSONpoint = {
      type: "Point",
      coordinates: [
           parseFloat(req.user.location.coordinates[0]),
           parseFloat(req.user.location.coordinates[1])
       ]
    }


    User.find({ "location.datetime": {"$gte": minusmin}}, function (err, users) {

      if (err) return handleErr(err);


      var otherUsers = users.map(function(u) { return u.username}).filter(function(u) { return u != req.user.username });


      if ( otherUsers.length > 0 ) {



          
          // User.find({ username: user[i].username, $nearSphere: { $geometry: { type: "Point", coordinates: [ req.user.location.coordinates[0], req.user.location.coordinates[1] ]}, "$maxDistance": 300} }, function(err, data) {
          User.find({ "username": { "$in": otherUsers }, "location.coordinates": {"$nearSphere": { "$geometry": geoJSONpoint, "$maxDistance": 4000 } }} , function(err, data){
              if (err) return handleErr(err);
              
              res.send(data)

          });


        }

          
      });      

  });

router.get('/locationfield/weapon', function(req, res, next) {
  Weapon.findOne({"name": req.query.weapon}, function(err, data){
    res.send(data);
  });
});

module.exports = router;