(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }
 if(typeof module === 'object' && module && module.exports) {
  module.exports = data;
 }})("map_4",
{ "compressionlevel":-1,
 "height":10,
 "infinite":false,
 "layers":[
        {
         "data":[150, 39, 40, 0, 0, 0, 0, 120, 121, 42, 194, 195, 149, 163, 164,
            150, 55, 56, 0, 0, 0, 0, 0, 0, 120, 121, 38, 193, 196, 149,
            198, 71, 72, 0, 0, 0, 0, 0, 0, 0, 0, 120, 121, 38, 193,
            122, 123, 0, 0, 0, 0, 4, 5, 6, 0, 0, 0, 0, 120, 121,
            0, 0, 0, 0, 0, 10, 20, 21, 106, 107, 0, 0, 0, 0, 0,
            0, 0, 0, 4, 25, 26, 135, 133, 152, 27, 28, 0, 0, 0, 0,
            0, 0, 10, 20, 26, 129, 181, 147, 178, 134, 27, 22, 11, 0, 0,
            3, 25, 26, 135, 131, 181, 163, 163, 164, 178, 130, 134, 27, 28, 3,
            19, 26, 129, 181, 164, 147, 164, 179, 180, 164, 163, 178, 134, 27, 19,
            133, 132, 181, 164, 147, 179, 163, 164, 179, 180, 179, 164, 178, 131, 132],
         "height":10,
         "id":1,
         "name":"Livello tile 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":15,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 73, 74, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 89, 90, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 73, 74, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 89, 90, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":10,
         "id":2,
         "name":"Livello tile 2",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":15,
         "x":0,
         "y":0
        }],
 "nextlayerid":3,
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"right-down",
 "tiledversion":"1.10.2",
 "tileheight":16,
 "tilesets":[
        {
         "firstgid":1,
         "source":"fg_tileset.tsx"
        }],
 "tilewidth":16,
 "type":"map",
 "version":"1.10",
 "width":15
});