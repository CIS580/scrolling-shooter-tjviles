"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');
const Weapons = require('./weapons');
const Camera = require('./camera');
const EntityManager = require('./entity-manager.js');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles, weapons) {
  this.missiles = missiles;
  this.weapons = weapons;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 200, y: 16500};
  this.velocity = {x: 0, y: 0};
  this.img = new Image()
  this.img.src = 'assets/tyrian.shp.007D3C.png';
  this.health = 100;
  this.width = 23;
  this.height = 27;
  this.type = "player";
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input, camera) {

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = -2;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 320) this.position.x = 320;
  if(this.position.y < camera.y) this.position.y = camera.y;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  var offset = this.angle * 23;
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 23, 27);
  ctx.strokeStyle = this.color;
  ctx.strokeRect(this.x, this.y, this.width, this.height);
  ctx.restore();
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:30, y:30});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireWeapons = function(entities) {
    var position = Vector.add(this.position, {x:-3, y:-20})
    var weapons = new Weapons(position);
    this.weapons.push(weapons);
    entities.addEntity(weapons);
}

Player.prototype.explode = function() {

}
