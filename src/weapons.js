"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const SmokeParticles = require('./smoke_particles');


/**
 * @module Weapons
 * A class representing a player's Weapons
 */
module.exports = exports = Weapons;

/**
 * @constructor Missile
 * Creates a missile
 * @param {Vector} position the position of the Weapons
 * @param {Object} target the target of the Weapons
 */
function Weapons(position, type) {
  this.position = {x: position.x, y:position.y}
  this.weaponSpeed = 8;
  this.angle = 0;
  this.img = new Image()
  this.img.src = 'assets/newsh(.shp.000000.png';
  this.smokeParticles = new SmokeParticles(400);
  this.type = 1;
  this.width = 20;
  this.height = 20;
  this.type = "weapon";
}

/**
 * @function update
 * Updates the Weapons, steering it towards a locked
 * target or straight ahead
 * @param {DOMHighResTimeStamp} elapedTime
 */
Weapons.prototype.update = function(elapsedTime) {

  // set the velocity
  var velocity = {x: 0, y: -this.weaponSpeed}
  if(this.target) {
    var direction = Vector.subtract(this.position, this.target);
    velocity = Vector.scale(Vector.normalize(direction), this.weaponSpeed);
  }

  // determine missile angle
  this.angle = Math.atan2(velocity.y, velocity.x);
  // move the missile
  this.position.x += velocity.x;
  this.position.y += velocity.y;

  // emit smoke
  this.smokeParticles.emit(this.position);

  // update smoke
  this.smokeParticles.update(elapsedTime);
}

/**
 * @function render
 * Renders the Weapons in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Weapons.prototype.render = function(elapsedTime, ctx) {
  // Draw Missile
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  //ctx.rotate(this.angle);
  if(this.type == 1)ctx.drawImage(this.img, 0, 41, 12, 12, 0, -4, 12, 12);
  if(this.type == 2)ctx.drawImage(this.img, 121, 43, 13, 11, -6, -4, 13, 11);
  ctx.restore();
  // Draw Smoke
  //this.smokeParticles.render(elapsedTime, ctx);
}
