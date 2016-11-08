"use strict";

// Tilemap engine defined using the Module pattern
module.exports = exports = Tilemap;

function Tilemap(mapData, options){
  this.tiles = [],
        this.tilesets = [],
        this.layers = [],
        this.tileWidth = mapData.tilewidth,
        this.tileHeight = mapData.tileheight,
        this.mapWidth = mapData.width,
        this.mapHeight = mapData.height;

      this.loading = 0;

      var self = this;

    // Load the tileset(s)
    mapData.tilesets.forEach( function(tilesetmapData, index) {
      // Load the tileset image
      var tileset = new Image();
      self.loading++;
      tileset.onload = function() {
        self.loading--;
        if(self.loading == 0 && options.onload) options.onload();
      }
      tileset.src = tilesetmapData.image;
      self.tilesets.push(tileset);

      // Create the tileset's tiles
      var colCount = Math.floor(tilesetmapData.imagewidth / self.tileWidth),
          rowCount = Math.floor(tilesetmapData.imageheight / self.tileHeight),
          tileCount = colCount * rowCount;

      for(var i = 0; i < tileCount; i++) {
        var tile = {
          // Reference to the image, shared amongst all tiles in the tileset
          image: tileset,
          // Source x position.  i % colCount == col number (as we remove full rows)
          sx: (i % colCount) * self.tileWidth,
          // Source y position. i / colWidth (integer division) == row number
          sy: Math.floor(i / rowCount) * self.tileHeight,
        }
        self.tiles.push(tile);
      }
    });

    // Parse the layers in the map
    mapData.layers.forEach( function(layerData) {

      // Tile layers need to be stored in the engine for later
      // rendering
      if(layerData.type == "tilelayer") {
        // Create a layer object to represent this tile layer
        var layer = {
          name: layerData.name,
          width: layerData.width,
          height: layerData.height,
          visible: layerData.visible
        }

        // Set up the layer's data array.  We'll try to optimize
        // by keeping the index data type as small as possible
        if(self.tiles.length < Math.pow(2,8))
          layer.data = new Uint8Array(layerData.data);
        else if (self.tiles.length < Math.Pow(2, 16))
          layer.data = new Uint16Array(layerData.data);
        else
          layer.data = new Uint32Array(layerData.data);

        // save the tile layer
        self.layers.push(layer);
      }
    });
  }

Tilemap.prototype.render = function(screenCtx) {
    // Render tilemap layers - note this assumes
    // layers are sorted back-to-front so foreground
    // layers obscure background ones.
    // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
    var self = this;
    this.layers.forEach(function(layer){

      // Only draw layers that are currently visible
      if(layer.visible) {
        for(var y = 0; y < layer.height; y++) {
          for(var x = 0; x < layer.width; x++) {
            var tileId = layer.data[x + layer.width * y];

            // tiles with an id of 0 don't exist
            if(tileId != 0) {
              var tile = self.tiles[tileId - 1];
              if(tile.image) { // Make sure the image has loaded
                screenCtx.drawImage(
                  tile.image,     // The image to draw
                  tile.sx, tile.sy, self.tileWidth, self.tileHeight, // The portion of image to draw
                  x*self.tileWidth, y*self.tileHeight, self.tileWidth, self.tileHeight // Where to draw the image on-screen
                );
              }
            }

          }
        }
      }

    });
  }

Tilemap.prototype.tileAt = function(x, y, layer) {
    // sanity check
    if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight)
      return undefined;
    return tiles[layers[layer].data[x + y*mapWidth] - 1];
  }
