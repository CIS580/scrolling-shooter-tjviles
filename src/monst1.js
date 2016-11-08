"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const MS_PER_FRAME = 1000/8;

/**
 * @module Monst1
 * A class representing an enemy
 */
module.exports = exports = Monst1;

/**
 * @constructor Monst1
 * Creates an enemy
 * @param {BulletPool} bullets the bullet pool
 */
function Monst1(startX, startY) {
  this.position = {x: startX, y: startY};
  this.velocity = {x: 0, y: 2};
  this.img = new Image()
  this.img.src = 'assets/ships1.png';
  this.timer1 = 0;
  this.timer2 = 0;
  this.frame = 0;
  this.width = 48;
  this.height = 54;
  this.type = "enemy";
}
Monst1.prototype.update = function(elapsedTime) {
  this.timer1 += elapsedTime;
      if(this.timer1 > MS_PER_FRAME) {
        this.timer1 = 0;
        this.frame += 1;
        if(this.frame > 3){
          this.frame = 0;
          this.timer1 = 0;
        }
}
  // move the enemy
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Monst1.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  if(this.frame == 0)ctx.drawImage(this.img, 0, 0, 48, 54, -12.5, -12, 48, 54);
  if(this.frame == 1)ctx.drawImage(this.img, 48, 0, 48, 54, -12.5, -12, 48, 54);
  if(this.frame == 2)ctx.drawImage(this.img, 96, 0, 48, 54, -12.5, -12, 48, 54);
  if(this.frame == 3)ctx.drawImage(this.img, 144, 0, 48, 54, -12.5, -12, 48, 54);
  ctx.strokeStyle = this.color;
  ctx.strokeRect(this.x, this.y, this.width, this.height);
  ctx.restore();
}
