import { camera_x, canvas, ctx, tile_col, tile_size } from '../main.js';
import { creaCollisioni } from './collision.js';
import { buffer_sezioni, col_offset_global } from './map.js';
import { player } from './player.js';

//Personaggio
export const player_img = new Image();
player_img.src = "assets/img/wario_idle.png";

//Foreground
export const fg_img = new Image();
fg_img.src = "assets/img/fg.png";

//Background
export const bg_img = new Image();
bg_img.src = "assets/img/bg.png";

//GUI
export const num_img = new Image();
num_img.src = "assets/img/num.png";

const counter_icon = new Image();
counter_icon.src = "assets/img/counter_icon.png";

//Schermate
export const title_img = new Image();
title_img.src = "assets/img/title.png";

export const gameover_img = new Image();
gameover_img.src = "assets/img/gameover.png";

//Particelle
export const rocks_img = new Image();
rocks_img.src = "assets/img/rocks.png";

//Frame per animazioni
let frame_counter = 0;

let frame_gem = 0;
let frame_lava = 0;
let frame_diamond = 0;

///////////////////////////////////////////////////////////////////////////////////////

//FUNZIONI
export function drawPlayer(){
    ctx.save();
    //disegna il player
    if(player.stato == "run" || player.stato == "idle"){
        ctx.drawImage(
            player_img,
            player.width * player.frame_x,
            player.height * player.frame_y,
            player.width,
            player.height,
            Math.round(player.x),
            Math.round(player.y + 1),
            player.width,
            player.height 
        );
    } else if(player.stato == "dash" || player.stato == "dash_end"){
        ctx.drawImage(
            player_img,
            39 * player.frame_x,
            0,
            39,
            45,
            Math.round(player.x),
            Math.round(player.y + 1),
            39,
            45 
        );
    }
    
    ctx.restore();
}

export function drawTileCollisionDebug(){
    const tileCollisions = creaCollisioni();

    ctx.save();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';

    for(let tile of tileCollisions){
        if(tile.type == "rect" || tile.type == "gem"){
            const x = tile.box.pos.x;
            const y = tile.box.pos.y;
            ctx.strokeRect(x, y, tile.box.w, tile.box.h);
            ctx.fillRect(x, y, tile.box.w, tile.box.h);
        }

        if(tile.type == "poly"){
            const poly = tile.box;
            const points = poly.calcPoints;

            ctx.beginPath();
            ctx.moveTo(poly.pos.x + points[0].x, poly.pos.y + points[0].y);
            for(let i = 1; i < points.length; i++){
                ctx.lineTo(poly.pos.x + points[i].x, poly.pos.y + points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }

    ctx.restore();
}

export function drawGUI(){
    ctx.save();
    
    const str_gemme = player.gemme.toString().padStart(6, '0');

    
    for(let i = 0; i < 6; i++){
        const cifra = parseInt(str_gemme[i]);
        const source_x = 8 * cifra;
        
        ctx.drawImage(
            num_img,
            source_x,
            0,
            8,
            8,
            8*i + 16,
            8,
            8,
            8
        );
    }
    
    ctx.drawImage(
        counter_icon,
        8,
        8
    );

    const str_punteggio = player.punteggio.toString().padStart(6, '0');
    
    for(let i = 0; i < 6; i++){
        const cifra = parseInt(str_punteggio[i]);
        const source_x = 8 * cifra;
        
        ctx.drawImage(
            num_img,
            source_x,
            0,
            8,
            8,
            canvas.width + 8*i - 56,
            8,
            8,
            8
        );
    }
    
    ctx.restore();
}

let particelle_attive = [];

export function creaParticelle(x, y){
    const n = 4 + Math.floor(Math.random() * 4); //tra le 4 e le 8 particelle da disegnare

    for(let i = 0; i < n; i++){
        particelle_attive.push({
            x: x + Math.random() * 16 - 8,
            y: y + Math.random() * 8,
            vel_x: (Math.random() - 0.5) * 4,
            vel_y: -2 - Math.random() * 2,
            g: 0.3,
            tile_index: Math.floor(Math.random() * 4),
            timer: 60 //quanto durano sullo schermo
        });
    }
}

export function drawParticelle(){
    for(let i = particelle_attive.length - 1; i >= 0; i--){
        const p = particelle_attive[i];
        
        // Aggiorna fisica
        p.x += p.vel_x;
        p.y += p.vel_y;

        p.x = Math.round(p.x);
        p.y = Math.round(p.y);

        p.vel_y += p.g;
        
        // Disegna
        ctx.save();
        ctx.translate(p.x + 4, p.y + 4);
        ctx.drawImage(
            rocks_img,
            p.tile_index * 8, 0, 8, 8,
            -4, -4, 8, 8
        );
        ctx.restore();
        
        // Rimuovi se finita la vita
        p.vita--;
        if(p.vita <= 0 || p.y > canvas.height){
            particelle_attive.splice(i, 1);
        }
    }
}

export function drawStage(lvl = 1){
    const HFLIP_FLAG = 0x80000000;
    const VFLIP_FLAG = 0x40000000;

    const inizio_col_visibile = Math.floor(camera_x / tile_size);
    const fine_col_visibile = inizio_col_visibile + Math.ceil(canvas.width / tile_size) + 1;

    const inizio_row_visibile = 0;
    const fine_row_visibile = Math.ceil(canvas.height / tile_size);

    //animazione gemme
    if(lvl != 0){
        frame_counter++;
        if(frame_counter >= 7){ //delay
            frame_counter = 0;
            frame_gem = (frame_gem + 1) % 4; //4 sono i frame totali delle gemme
            frame_lava = (frame_lava + 1) % 6;
            frame_diamond = (frame_diamond + 1) % 16;
        }
    }

    let col_offset = col_offset_global;

    for(let sezione of buffer_sezioni){
        const {fg_tilemap, map_col, map_row} = sezione;
        let index_livello = 0;
        for(let livello of sezione.fg_tilemap){
            if(lvl == 1 && index_livello == 0){
                index_livello++;
                continue;
            }

            for(let i = inizio_row_visibile; i < fine_row_visibile; i++){
                if(i >= map_row) continue;

                for(let j = inizio_col_visibile; j < fine_col_visibile; j++){
                    if(j - col_offset < 0 || j - col_offset >= map_col) continue;

                    const index = i * map_col + (j - col_offset);
                    let tile = livello[index];
                    if(tile == 0) continue;

                    //gemme
                    if(tile == 13){
                        tile = 13 + frame_gem;
                    } else if(tile == 29){
                        tile = 29 + frame_gem;
                    }

                    //lava
                    if(tile == 45)
                        tile = 45 + frame_lava*tile_col;
                    else if(tile == 46)
                        tile = 46 + frame_lava*tile_col;
                    else if(tile == 47)
                        tile = 47 + frame_lava*tile_col;
                    else if(tile == 48)
                        tile = 48 + frame_lava*tile_col;

                    //diamanti
                    if(tile == 138)
                        tile = 138 + frame_diamond*tile_col*2;
                    else if(tile == 139)
                        tile = 139 + frame_diamond*tile_col*2;
                    else if(tile == 140)
                        tile = 140 + frame_diamond*tile_col*2;
                    else if(tile == 154)
                        tile = 154 + frame_diamond*tile_col*2;
                    else if(tile == 155)
                        tile = 155 + frame_diamond*tile_col*2;
                    else if(tile == 156)
                        tile = 156 + frame_diamond*tile_col*2;
                    
                    const draw_x = Math.floor(j * tile_size - camera_x);
                    const draw_y = i * tile_size;

                    const hflip = tile & HFLIP_FLAG;
                    const vflip = tile & VFLIP_FLAG;

                    const tile_id = (tile & ~(HFLIP_FLAG | VFLIP_FLAG)) - 1;

                    const src_x = (tile_id % tile_col) * tile_size;
                    const src_y = Math.floor(tile_id/tile_col) * tile_size;

                    ctx.save();
                    ctx.translate(draw_x + tile_size/2, draw_y + tile_size/2);
                    ctx.scale(hflip ? -1 : 1, vflip ? -1 : 1);
                    ctx.drawImage(
                        fg_img,
                        src_x, src_y,
                        tile_size, tile_size,
                        -tile_size/2, -tile_size/2,
                        tile_size, tile_size
                    );
                    ctx.restore();
                }
            }
            if(lvl == 0) break;

            index_livello++;
        }

        col_offset += map_col;

    }
}

export function drawBG(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pattern = ctx.createPattern(bg_img, "repeat-x");
    
    ctx.save();
    ctx.translate(-camera_x*0.3 % bg_img.width, 0); //*0.3 = velocità del parallax
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width + bg_img.width, canvas.height);
    ctx.restore();
}