var mongoose = require('mongoose');


var weaponSchema = mongoose.Schema({

  name: String,
  targetCoordinates: [Number, Number],
  maxRange: Number,
  hitRadius: Number,
  timer: {type:Number, default:30},
  deployed: {type:Boolean, default:false},
  tokens: {type:Number, default:500},
  imageUrl: String

});




var Weapon = mongoose.model('weapon', weaponSchema);

module.exports = Weapon;