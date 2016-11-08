"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const Tilemap = require('./tilemap');
const Weapons = require('./weapons');
const Monst1 = require('./monst1');
const EntityManager = require('./entity-manager.js');
const MS_PER_FRAME = 1000/8;

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false
}
var camera = new Camera(canvas);
var entities = new EntityManager(canvas.width, 180000, 32)
var bullets = new BulletPool(10);
var missiles = [];
var weapons = [];
var player = new Player(bullets, missiles, weapons);
var maps = [];
var bgMidTilemapData = require('../assets/background/midground.json');
var bgForeTilemapData = require('../assets/background/foreground.json');
var bgBackTilemapData = require('../assets/background/background.json');

maps[0] = new Tilemap(bgBackTilemapData);
maps[1] = new Tilemap(bgMidTilemapData);
maps[2] = new Tilemap(bgForeTilemapData);

var playerScore;
var playerLives;
var level = 1;

var monst1s = [];
monst1s[0] = new Monst1(150, 15000);
var gameOver = false;
var levelOver = false;
var levelOverTimer = 0;
var gameOverTimer = 0;
var numberOfEntities = 0;
var score = 0;
var innerScoreText = 'Score: ';
var hitTimeout = false;
var hitTimeoutTimer = 0;

entities.addEntity(player);
numberOfEntities++;
entities.addEntity(monst1s[0]);
numberOfEntities++;

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  console.log(event.key);
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
    case " ":
      input.space = true;
      //player.fireBullet({x: this.x, y: this.y});
      player.fireWeapons(entities);
      event.preventDefault();
      break;

  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
    case "SpaceBar":
    case " ":
      input.space = false
      event.preventDefault();
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  checkEndLevel();

  // update the player
  player.update(elapsedTime, input, camera);

  // update the camera
  camera.update(player.position);

  // Update bullets
  bullets.update(elapsedTime, function(bullet){
    if(!camera.onScreen(bullet)) return true;
    return false;
  });

  // // Update missiles
  var markedForRemoval = [];
  weapons.forEach(function(weapon, i){
    weapon.update(elapsedTime);
    if(Math.abs(camera.y - weapon.position.y) > (camera.y - camera.height *2))
      markedForRemoval.unshift(i);
  });
  // Remove missiles that have gone off-screen
  markedForRemoval.forEach(function(index){
    weapons.splice(index, 1);
  });

  monst1s.forEach(function(monst1, i){
    monst1.update(elapsedTime);
  });

  entities.updateEntity(player);
  entities.updateEntity(monst1s[0]);

  entities.collide(function(entity1, entity2) {
    if(entity1.type == "player" && hitTimeout == false){
      entity1.health -= 10;
      hitTimeout = true;
    }
    else if (entity2.type == "player" && hitTimeout == false){
      entity2.health -= 10;
      hitTimeout = true;
    }
    else if (entity1.type == "weapon" && entity2.type == "enemy"){
      entity2.health -= 10;
      score += 100;
    }
  });

  if(hitTimeout){
    hitTimeoutTimer += elapsedTime;
    if(hitTimeoutTimer > MS_PER_FRAME * 3){
      hitTimeout = false;
      hitTimeoutTimer = 0;
    }
  }
  if(levelOver){
    levelOverTimer += elapsedTime;
    if(levelOverTimer > MS_PER_FRAME * 40){
      levelOver = false;
      levelOverTimer = 0;
      level++;
      player.position.x = 200;
      player.position.y = 16500;
      camera.x = 0;
      camera.y = 16000;
    }
  }
  // var markedForRemoval = [];
  // missiles.forEach(function(missile, i){
  //   missile.update(elapsedTime);
  //   if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
  //     markedForRemoval.unshift(i);
  // });
  // // Remove missiles that have gone off-screen
  // markedForRemoval.forEach(function(index){
  //   missiles.splice(index, 1);
  // });
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 320, 786);
  if(!levelOver && !gameOver){
    // TODO: Render background
    renderBackgrounds(elapsedTime, ctx);
    // Transform the coordinate system using
    // the camera position BEFORE rendering
    // objects in the world - that way they
    // can be rendered in WORLD cooridnates
    // but appear in SCREEN coordinates
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    renderWorld(elapsedTime, ctx);
    ctx.restore();

    // Render the GUI without transforming the
    // coordinate system
    renderGUI(elapsedTime, ctx);
  }
  if(levelOver){
    ctx.font = "45px Georgia"
    ctx.fillStyle = "red";
    ctx.fillText(innerScoreText, 15, 384);
    ctx.fillText(score, 150, 384);
    ctx.fillText('Level', 15, 200);
    ctx.fillText(level, 150, 200);
  }
}

function renderBackgrounds(elapsedTime, ctx) {
  ctx.save();

  // The background scrolls at 2% of the foreground speed
  ctx.translate(0, -camera.y);
  maps[0].render(ctx);
  ctx.restore();

  // The midground scrolls at 60% of the foreground speed
  ctx.save();
  ctx.translate(0, -camera.y*.6);
  maps[1].render(ctx);
  ctx.restore();

  // The foreground scrolls in sync with the camera
  ctx.save();
ctx.translate(0, -camera.y*.2);
  maps[2].render(ctx);
  ctx.restore();
}
/**

  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    // Render the bullets
    bullets.render(elapsedTime, ctx);

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });

    weapons.forEach(function(weapon){
      weapon.render(elapsedTime, ctx);
    });
    // Render the player
    player.render(elapsedTime, ctx);

    monst1s.forEach(function(monst1){
      monst1.render(elapsedTime, ctx);
    });

    entities.renderCells(ctx);
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
  ctx.font = "25px Georgia"
  ctx.fillText(innerScoreText, 200, 40);
  ctx.fillText(score, 270, 40);
  ctx.fillStyle = "red";
  ctx.fillRect(10, 10, player.health, 10);
}

function spawnMonsters(){
  monst1s.push(new Monst1(150, 14000));
}

function checkEndLevel(){
  if(player.position.y < 400){
    levelOver = true;

  }
}
