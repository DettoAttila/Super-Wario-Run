import { camera_speed, camera_x, canvas, tile_size } from "../main.js";
import * as audio from "./audio.js";
import { creaParticelle } from "./draw.js";
import { buffer_sezioni, col_offset_global, collision_data } from "./map.js";
import { player } from "./player.js";


export function creaCollisioni(){
    let tile_collisions = [];

    const HFLIP_FLAG = 0x80000000;
    const VFLIP_FLAG = 0x40000000;

    const inizio_col_visibile = Math.floor(camera_x / tile_size);
    const fine_col_visibile = inizio_col_visibile + Math.ceil(canvas.width / tile_size) + 1;

    const inizio_row_visibile = 0;
    const fine_row_visibile = Math.ceil(canvas.height / tile_size);

    let col_offset = col_offset_global;

    for (const sezione of buffer_sezioni){
        const { fg_tilemap, map_col, map_row } = sezione;

        for (let livello of sezione.fg_tilemap){

            for (let i = inizio_row_visibile; i < fine_row_visibile; i++) {
                if(i >= map_row) continue;

                for (let j = inizio_col_visibile; j < fine_col_visibile; j++) {
                    if(j - col_offset < 0 || j - col_offset >= map_col) continue;

                    const index = i * map_col + (j - col_offset);
                    const tile = livello[index];
                    const tile_id = (tile & ~(HFLIP_FLAG | VFLIP_FLAG)) - 1;

                    const hflip = tile & HFLIP_FLAG;
                    const vflip = tile & VFLIP_FLAG;

                    if(tile == 0) continue;

                    const tile_x = Math.floor(j * tile_size - camera_x);
                    const tile_y = i * tile_size;

                    if(collision_data[tile_id]) {
                        const collisionInfo = collision_data[tile_id][0];

                        let tilebox;

                        if(collisionInfo.type != "poly" && collisionInfo.type != "slope") {
                            tilebox = new SAT.Box(
                                new SAT.Vector(tile_x + collisionInfo.x, tile_y + collisionInfo.y),
                                collisionInfo.width,
                                collisionInfo.height
                            );
                        } else {
                            const points = collisionInfo.points.map(point => {
                                let px = point[0];
                                let py = point[1];

                                if(hflip) px = tile_size - px;
                                if(vflip) py = tile_size - py;

                                return new SAT.Vector(px, py);
                            });

                            tilebox = new SAT.Polygon(
                                new SAT.Vector(tile_x + collisionInfo.x, tile_y + collisionInfo.y),
                                points
                            );
                        }

                        tile_collisions.push({
                            box: tilebox,
                            type: collisionInfo.type,
                            tile: tile,
                            index: index,
                            sezione: sezione,
                            livello: sezione.fg_tilemap.indexOf(livello),
                            x: tile_x,
                            y: tile_y
                        });
                    }
                }
            }
        }

        col_offset += map_col;
    }

    return tile_collisions;
}

export function checkOnGround(tile_collisions){
    let response = new SAT.Response();

    for(let tile of tile_collisions){
        response.clear();

        if(SAT.testPolygonPolygon(player.collision_box.toPolygon(), tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response)) {
            if(response.overlapV.y > 0 /*|| response.overlapV.x < camera_speed*/) { //player in piedi sul tile
                return true;
            }
        }
    }
    //se non trova collisione per alcun tile
    return false;
}

export function checkOnSlope(tile_collisions){
    let response = new SAT.Response();

    const p = new SAT.Vector(player.collision_box.pos.x - 2, player.collision_box.pos.y + player.height - 1); //+1 +1

    for(let tile of tile_collisions){
        response.clear();

        if(SAT.pointInPolygon(p, tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response))
            return true;
    }

    //se non trova collisione per alcun tile
    return false;
}

export let in_lava = false;

export function risolviCollisione(tile_collisions){
    let response = new SAT.Response();

    for(let tile of tile_collisions){
        response.clear();

        // Se c'è intersezione con un tile
        if(SAT.testPolygonPolygon(player.collision_box.toPolygon(), tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response)) {

            if(tile.type == "lava"){
                in_lava = true;
                break;
            }

            if(tile.type == "gem"){
                tile.sezione.fg_tilemap[tile.livello][tile.index] = 0;
                player.gemme += (tile.tile >= 12 && tile.tile <= 15) ? 1 : 2;
                if(tile.tile >= 12 && tile.tile <= 15){
                    audio.playAudio(audio.audio_blue_gem);
                    player.punteggio += 15;
                } else {
                    audio.playAudio(audio.audio_red_gem);
                    player.punteggio += 30;
                }
                if(player.gemme % 100 == 0){
                    audio.playAudio(audio.audio_excellent);
                }
                
                break;
            }

            if(tile.type == "diamond"){
                const row = Math.floor(tile.index / tile.sezione.map_col);
                const col = tile.index % tile.sezione.map_col;

                const diamond = {
                    138: {row_offset: 0, col_offset: 0}, //top-left
                    139: {row_offset: 0, col_offset: -1}, //top-center
                    140: {row_offset: 0, col_offset: -2}, //top-right
                    154: {row_offset: -1, col_offset: 0}, //bottom-left
                    155: {row_offset: -1, col_offset: -1}, //bottom-center
                    156: {row_offset: -1, col_offset: -2} //bottom-right
                };

                const offset = diamond[tile.tile];
                const top_left_row = row + offset.row_offset; //row
                const top_left_col = col + offset.col_offset; //col


                if(top_left_row >= 0 && top_left_row + 1 < tile.sezione.map_row && top_left_col >= 0 && top_left_col + 2 < tile.sezione.map_col) {
                    for(let i = 0; i < 2; i++){
                        for(let j = 0; j < 3; j++){
                            const index = (top_left_row + i) * tile.sezione.map_col + (top_left_col + j);
                            tile.sezione.fg_tilemap[tile.livello][index] = 0;
                        }
                    }

                    player.gemme += 20;
                    audio.playAudio(audio.audio_diamond);
                    player.punteggio += 300;

                    if(player.gemme % 100 == 0)
                        audio.playAudio(audio.audio_excellent);
                }

                break;
            }

            let blocco0 = [73, 89];
            let blocco1 = [75, 91];
            if((blocco0.includes(tile.tile) || blocco1.includes(tile.tile))) {
                if(player.stato == "dash") {
                    tile.sezione.fg_tilemap[tile.livello][tile.index] = 0;
                    tile.sezione.fg_tilemap[tile.livello][tile.index + 1] = 0;
                    const offset_colonne = (tile.tile == 89 || tile.tile == 91) ? -tile.sezione.map_col : tile.sezione.map_col;
                    tile.sezione.fg_tilemap[tile.livello][tile.index + offset_colonne] = 0;
                    tile.sezione.fg_tilemap[tile.livello][tile.index + 1 + offset_colonne] = 0;
                    audio.playAudio(audio.audio_block_destroy);
                    creaParticelle(player.x + player.width + tile_size, player.y + player.height / 2);
                    player.punteggio += 5;
                    continue;
                }
            }

            if(response.overlapV.y > 1 && (player.on_ground || player.on_slope)) { //player in piedi sul tile
                player.y -= response.overlapV.y;
                player.salto = 0;
            }

            const p = new SAT.Vector(Math.floor(player.collision_box.pos.x) - (camera_speed-2) + 1, Math.floor(player.collision_box.pos.y) + player.collision_box.h - 1);

            if(tile.type == "slope" && (player.on_ground)) {
                if(player.salto == 0 && !SAT.pointInPolygon(p, tile.box.toPolygon ? tile.box.toPolygon() : tile.box)) {
                    player.y++;
                    continue;
                }
            }

            if(response.overlapV.y < 0 && tile.type != "platform"){   
                if(response.overlapV.x > 0) //soffitto inclinato
                    player.x -= response.overlapV.x - 2;
                
                player.salto = 2;
                player.y -= response.overlapV.y - 2;
                continue;
            }

            if(response.overlapV.x > 0 && tile.type != "poly" && tile.type != "platform"){ //muro davanti
                if(player.stato == "dash" && player.x < 25)
                    player.stato = "dash_end";

                player.x -= response.overlapV.x;
            }
        }
    }
}

