var mongoose = require('mongoose');
var Weapon = require('../weapons.js');

Weapon.find({}, function(err, results){
  if(results.length === 0){

    var emp1 = new Weapon ({
      name:"emp1",
      imageUrl:"/img/emp.png"
    });
    var mine1 = new Weapon ({
      name:"mine1",
      imageUrl:"/img/mine.png"


    });
    var missile1 = new Weapon ({
      name:"missile1",
      imageUrl:""
    });


    emp1.save();
    mine1.save();
    missile1.save();

  }
});


