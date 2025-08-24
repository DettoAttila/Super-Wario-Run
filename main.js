import {player, animazione_idle, animazione_dashing, animazione_run, punch, jump} from './classes/player.js';
import {Sezione, sezioneRandom, caricaSezione, buffer_sezioni, collision_data, rimuoviSezione, col_offset_global} from './classes/map.js';
import * as audio from './classes/audio.js';

//Nel canvas disegniamo la grafica
const canvas = document.getElementById("schermata_gioco");
const ctx = canvas.getContext("2d");

canvas.width = 240;
canvas.height = 160;

//Personaggio
const player_img = new Image();
player_img.src = "assets/wario_idle.png";

//Foreground
const fg_img = new Image();
fg_img.src = "assets/fg.png";
fg_img.onload = drawStage;

//Background
const bg_img = new Image();
bg_img.src = "assets/bg.png";
bg_img.onload = drawBG;

//GUI
const num_img = new Image();
num_img.src = "assets/num.png";
num_img.onload = drawGUI;

const counter_icon = new Image();
counter_icon.src = "assets/counter_icon.png";

//Schermate
const title_img = new Image();
title_img.src = "assets/title.png";

const gameover_img = new Image();
gameover_img.src = "assets/gameover.png";

//Collezionabili
const gems_img = new Image();
gems_img.src = "assets/gems.png";
gems_img.onload = drawBG;

//Particelle
const rocks_img = new Image();
rocks_img.src = "assets/rocks.png";

//Quadro iniziale
let fg_tilemap = [[1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003,
            1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971,
            1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956,
            99, 100, 101, 102, 36, 99, 100, 101, 102, 36, 99, 100, 101, 102, 36,
            115, 116, 117, 118, 0, 115, 116, 117, 118, 0, 115, 116, 117, 118, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5,
            19, 20, 21, 22, 19, 20, 21, 22, 19, 20, 21, 22, 19, 20, 21,
            130, 131, 132, 133, 130, 131, 132, 133, 130, 131, 132, 133, 130, 131, 132],[]];

const tile_size = 16;
const tile_col = 16;

let margine_caricamento = tile_size*20; //grullo

let map_col = 15;
let map_row = 10;

let sezione0 = new Sezione(fg_tilemap, map_col, map_row);

buffer_sezioni.push(sezione0);  //inizializzazione buffer di partenza
buffer_sezioni.push(sezioneRandom());
buffer_sezioni.push(sezioneRandom());

//Camera e movimento
let camera_x = 0;
let camera_speed;
let acc = 0.2;
let timer = 0;  //il tempo passato dall'inizio della partita
let last_frame_timestamp = 0;  //il timestamp dell'ultimo frame

//Stato
let pausa = false;

//Disegna la grafica
function drawPlayer() {
    ctx.save();
    //disegna il giocatore
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
    } else if(player.stato == "dash" || player.stato == "dash_end") {
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

function drawSATBox(ctx, box, color){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.pos.x, box.pos.y, box.w, box.h);
    ctx.restore();
}

function drawTileCollisionDebug() {
    const tileCollisions = collisionFG();

    ctx.save();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';

    for (let tile of tileCollisions) {
        if (tile.type == 'rect' || tile.type == "gem") {
            const x = tile.box.pos.x;
            const y = tile.box.pos.y;
            ctx.strokeRect(x, y, tile.box.w, tile.box.h);
            ctx.fillRect(x, y, tile.box.w, tile.box.h);
        }

        if (tile.type == 'poly'){
            const poly = tile.box;
            const points = poly.calcPoints;

            ctx.beginPath();
            ctx.moveTo(poly.pos.x + points[0].x, poly.pos.y + points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(poly.pos.x + points[i].x, poly.pos.y + points[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawGUI() {
    ctx.save();
    
    const str_gemme = player.gemme.toString().padStart(6, '0');

    
    for (let i = 0; i < 6; i++) {
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
    
    for (let i = 0; i < 6; i++) {
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

function creaParticelle(x, y){
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

function drawParticelle(){
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

let frame_counter = 0;
let frame_gem = 0;
let frame_lava = 0;

function drawStage(){
    const HFLIP_FLAG = 0x80000000;
    const VFLIP_FLAG = 0x40000000;

    const inizio_col_visibile = Math.floor(camera_x / tile_size);
    const fine_col_visibile = inizio_col_visibile + Math.ceil(canvas.width / tile_size) + 1;

    const inizio_row_visibile = 0;
    const fine_row_visibile = Math.ceil(canvas.height / tile_size);

    //animazione gemme
    frame_counter++;
    if(frame_counter >= 10) { //delay
        frame_counter = 0;
        frame_gem = (frame_gem + 1) % 4; //4 sono i frame totali delle gemme
        frame_lava = (frame_lava + 1) % 6;
    }

    let col_offset = col_offset_global;

    for(let sezione of buffer_sezioni){
        const {fg_tilemap, map_col, map_row} = sezione;
        for(let livello of sezione.fg_tilemap){
            for (let i = inizio_row_visibile; i < fine_row_visibile; i++) {
                if (i >= map_row) continue;

                for (let j = inizio_col_visibile; j < fine_col_visibile; j++) {
                    if (j - col_offset < 0 || j - col_offset >= map_col) continue;

                    const index = i * map_col + (j - col_offset);
                    let tile = livello[index];
                    if(tile == 0) continue;

                    if(tile > 12 && tile < 15){
                        tile = 12 + frame_gem + 1;
                    } else if(tile > 28 && tile < 31){
                        tile = 28 + frame_gem + 1;
                    }

                    if(tile == 45)
                        tile = 45 + frame_lava*16;
                    else if(tile == 46)
                        tile = 46 + frame_lava*16

                    const hflip = tile & HFLIP_FLAG;
                    const vflip = tile & VFLIP_FLAG;

                    const tile_id = (tile & ~(HFLIP_FLAG | VFLIP_FLAG)) - 1;

                    const draw_x = Math.floor(j * tile_size - camera_x);
                    const draw_y = i * tile_size;

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
        }
        col_offset += map_col;
    }
}

function drawBG(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pattern = ctx.createPattern(bg_img, "repeat-x");
    
    ctx.save();
    ctx.translate(-camera_x*0.3 % bg_img.width, 0); //*0.3 = velocità del parallax
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width + bg_img.width, canvas.height);
    ctx.restore();
}

function collisionFG(){
    let tileCollisions = [];

    const HFLIP_FLAG = 0x80000000;
    const VFLIP_FLAG = 0x40000000;

    const inizio_col_visibile = Math.floor(camera_x / tile_size);
    const fine_col_visibile = inizio_col_visibile + Math.ceil(canvas.width / tile_size) + 1;

    const inizio_row_visibile = 0;
    const fine_row_visibile = Math.ceil(canvas.height / tile_size);

    let col_offset = col_offset_global;

    for (const sezione of buffer_sezioni) {
        const {fg_tilemap, map_col, map_row} = sezione;

        for(let livello of sezione.fg_tilemap){

            for (let i = inizio_row_visibile; i < fine_row_visibile; i++) {
                if (i >= map_row) continue;

                for (let j = inizio_col_visibile; j < fine_col_visibile; j++) {
                    if (j-col_offset < 0 || j-col_offset >= map_col) continue;

                    const index = i * map_col + (j-col_offset);
                    const tile = livello[index];
                    const tile_id = (tile & ~(HFLIP_FLAG | VFLIP_FLAG))-1;

                    const hflip = tile & HFLIP_FLAG;
                    const vflip = tile & VFLIP_FLAG;

                    if(tile == 0) continue;

                    const tile_x = Math.floor(j * tile_size - camera_x);
                    const tile_y = i * tile_size;

                    if(collision_data[tile_id]){
                        const collisionInfo = collision_data[tile_id][0];

                        let tilebox;

                        if(collisionInfo.type != "poly" && collisionInfo.type != "slope"){
                            tilebox = new SAT.Box(
                                new SAT.Vector(tile_x + collisionInfo.x, tile_y + collisionInfo.y),
                                collisionInfo.width,
                                collisionInfo.height
                            );
                        } else {
                            const points = collisionInfo.points.map(point => {
                                let px = point[0];
                                let py = point[1];

                                if (hflip) px = tile_size - px;
                                if (vflip) py = tile_size - py;

                                return new SAT.Vector(px, py);
                            });

                            tilebox = new SAT.Polygon(
                                new SAT.Vector(tile_x + collisionInfo.x, tile_y + collisionInfo.y),
                                points
                            );
                        }

                        tileCollisions.push({
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

    return tileCollisions;
}

function checkOnGround(tileCollisions){
    let response = new SAT.Response();

    for(let tile of tileCollisions){
        response.clear();
        
        if(SAT.testPolygonPolygon(player.collision_box.toPolygon(), tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response)){
            if(response.overlapV.y > 0 || response.overlapV.x < camera_speed){ //player in piedi sul tile
                return true;
            }
        }
    }
    //se non trova collisione per alcun tile
    return false;
}

function checkOnSlope(tileCollisions){
    let response = new SAT.Response();

    const p = new SAT.Vector(player.collision_box.pos.x + 1, player.collision_box.pos.y + 1);

    for(let tile of tileCollisions){
        response.clear();
        
        if(SAT.pointInPolygon(player.collision_box.toPolygon(), tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response)){
            return true;
        }
    }
    //se non trova collisione per alcun tile
    return false;
}

let in_lava = false;

function drawVector(ctx, v, color = "red") {
    for(let p of v){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function risolviCollisione(tileCollisions) {
    let response = new SAT.Response();
    
    for(let tile of tileCollisions) {
        response.clear();
        
        // Se c'è intersezione con un tile
        if(SAT.testPolygonPolygon(player.collision_box.toPolygon(), tile.box.toPolygon ? tile.box.toPolygon() : tile.box, response)) {
            
            if(tile.type == "gem") {
                tile.sezione.fg_tilemap[tile.livello][tile.index] = 0;
                player.gemme += (tile.tile >= 12 && tile.tile <= 15) ? 1 : 2;
                if(tile.tile >= 12 && tile.tile <= 15) {
                    audio.playAudio(audio.audio_blue_gem);
                    player.punteggio += 15;
                } else {
                    audio.playAudio(audio.audio_red_gem);
                    player.punteggio += 30;
                }
                if(player.gemme % 100 == 0) {
                    audio.playAudio(audio.audio_excellent);
                }
                continue;
            }
            
            if(tile.type == "lava" && response.overlapV.y > 1) {
                in_lava = true;
                continue;
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
                    creaParticelle(player.x + player.width + tile_size, player.y + player.height/2);
                    player.punteggio += 5;
                    continue;
                }
            }
            
            if(response.overlapV.y > 1) { // Player in piedi sul tile
                player.y -= response.overlapV.y;
                player.salto = 0;
            }

            let points = [ 
                new SAT.Vector(Math.floor(player.collision_box.pos.x) - (camera_speed - 2) + 1, Math.floor(player.collision_box.pos.y) + player.collision_box.h - 1),
                //new SAT.Vector(player.collision_box.pos.x + Math.ceil(camera_speed) + 2, player.y + player.collision_box.h + 2),
                //new SAT.Vector(player.collision_box.pos.x + Math.ceil(camera_speed) + 3, player.y + player.collision_box.h + 3),
            ];

            if((tile.type == "slope" || tile.tile == 25 || tile.tile == 26 || tile.tile == 134 || tile.tile == 136) && player.on_ground){
                if(player.salto == 0 && !SAT.pointInPolygon(points[0], tile.box.toPolygon ? tile.box.toPolygon() : tile.box)){
                    console.log(tile.tile);
                    player.y++;
                    continue;
                }
            }
            
            if(response.overlapV.y < 0 && response.overlapV.x > 0){ //soffitto inclinato
                player.y -= response.overlapV.y - 2;
                player.x -= response.overlapV.x - 2;
                player.salto = 2;
            }

            if(response.overlapV.y < 0){ //soffitto piano
                player.y -= response.overlapV.y - 2;
                player.salto = 2;
            }

            if(response.overlapV.x > 0 && tile.type != "poly"){ // Muro davanti
                player.x -= response.overlapV.x;
            }

            if(response.overlapV.x < 0 && tile.type != "poly" && tile.type != "slope"){ // Muro dietro
                player.x -= response.overlapV.x;
            }
        }
    }
}

let fine_sezione = map_col * tile_size;
export let stato_gioco = "menu";

//UPDATE FRAME PER FRAME
function update(time){
    if(stato_gioco == "game over") return;
    if(pausa) return;

    switch(player.stato){
        case "idle":
            player_img.src = "assets/wario_idle.png";
            animazione_idle();
            break;
        case "run":
            player_img.src = "assets/wario_running.png";
            animazione_run();
            break;
        case "dash":
            player_img.src = "assets/wario_dashing.png";
            animazione_dashing();
            break;
        case "dash_end":
            player_img.src = "assets/wario_dashing.png";
            animazione_dashing();
            break;
    }

    drawBG();
    drawPlayer();
    drawStage();
    drawParticelle();

    //console.log("on slope",player.on_slope);
    
    if(stato_gioco == "menu")
        ctx.drawImage(title_img, 0, 0);
    else drawGUI();

    if(stato_gioco == "menu"){
        player.stato = "idle";
        requestAnimationFrame(update);
        return;
    }
    
    if(player.stato == "run")
        audio.audio_walk.play();

    if(player.stato == "dash" && player.x < 50){
        player.x += player.rincorsa;

        if(player.x >= 50){
            player.x = 50;
            player.stato = "dash_end";
        }
    }

    if(player.stato == "dash_end"){
        player.x -= camera_speed;
        player.rincorsa = 0;
    }
    
    if(player.stato == "dash_end" && player.x <= 10){
        player.stato = "run";
        player.x = 10;
    }
    
    const tileCollisions = collisionFG();

    //drawVector(ctx, points);

    console.log("on ground",player.on_ground);
    
    const delta = time - last_frame_timestamp; //tempo trascorso dall'ultimo frame
    last_frame_timestamp = time;
    
    if(!player.on_ground){
        if(player.jump_premuto && (player.jump_premuto_tempo < 500)){
            player.jump_premuto_tempo += delta;
            player.salto += -0.004 * delta;
        }
        
        player.salto += player.g;
        player.y += player.salto;
    }

    player.collision_box.pos.x = player.x + 10; //+5
    player.collision_box.pos.y = player.y + 9;
    
    player.on_ground = checkOnGround(tileCollisions);
    player.on_slope = checkOnSlope(tileCollisions);
    risolviCollisione(tileCollisions);

    timer += delta;

    if(timer >= 30000){
        camera_speed += acc;
        timer = 0;
        audio.playAudio(audio.audio_hurry_up);
    }
    
    camera_x += camera_speed;
    //camera_x = Math.round(camera_x); //per evitare lo screen tearing
        
    player.punteggio += Math.round(delta/33);

    if(player.punteggio % 1000 == 0 && player.punteggio != 0)
        audio.playAudio(audio.audio_yeah);

    if(camera_x > fine_sezione + margine_caricamento){ //margine per evitare che venga rimossa troppo prima
        caricaSezione();
        rimuoviSezione();

        //fine_sezione = map_col * tile_size;
        fine_sezione += buffer_sezioni[buffer_sezioni.length - 1].map_col * tile_size;
    }
    

    //drawSATBox(ctx, player.collision_box, 'cyan');
    //drawTileCollisionDebug();
    
    if(in_lava || player.y > canvas.height + tile_size || player.x < -player.width){ //GAME OVER
        ctx.drawImage(gameover_img, 0, 0);
        stato_gioco = "game over";
        audio.audio_scream.play();
        return;
    }

    requestAnimationFrame(update);
}

function start(){
    camera_x = 0;
    camera_speed = 2;
    stato_gioco = "play";
    player.stato = "run";
    audio.playAudio(audio.audio_yahoo);
    last_frame_timestamp = performance.now();
}

function reset(){
    location.reload(); //ricarica la pagina, eventualmente creare uno script tale che resetti il buffer_sezioni e tutti gli altri valori prima di update()
}

document.addEventListener("keydown", (e) => {
    if(e.code == "Enter"){
        if(stato_gioco == "menu")
            start();
        if(stato_gioco == "game over")
            reset();
    }

    if(e.code == "KeyP"){
        pausa = !pausa;
        last_frame_timestamp = performance.now();

        if(!pausa)
            requestAnimationFrame(update);
    }

    if(stato_gioco == "play" && !pausa){
        if(e.code == "Space" && !e.repeat && (player.on_ground || player.on_slope)){
            e.preventDefault();
            jump();
        }

        if(e.code == "ArrowRight" && player.stato != "dash" && player.stato != "dash_end" && !e.repeat){
            e.preventDefault();
            punch();
        }
    }
});

document.addEventListener("keyup", (e) => {
    if(e.code == "Space")
        player.jump_premuto = false;
});

requestAnimationFrame(update);