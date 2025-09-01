import * as audio from './audio.js';

export const player = {
    width: 32,
    height: 38,
    frame_x: 0,
    frame_y: 0,
    x: 10,
    y: 89,
    salto: 0,
    jump_premuto: false,
    jump_premuto_tempo: 0,
    rincorsa: 0,
    g: 0.8,
    collision_box: null,
    on_ground: false,
    on_slope: false,
    stato: "idle", //IDLE DI DEFAULT
    gemme: 0,
    punteggio: 0
}

player.collision_box = new SAT.Box(new SAT.Vector(player.x, player.y), player.width/2, player.height - 8);

export function jump(){
    player.salto = -8;
    //player.rincorsa = 2;
    player.y += player.salto;
    player.jump_premuto = true;
    player.jump_premuto_tempo = 0;
    audio.playAudio(audio.audio_jump);
}

export function punch(){
    player.stato = "dash";
    player.rincorsa = 5;
    audio.playAudio(audio.audio_dash);
}

export const animazione_idle = (() => {
    let frame_counter = 0;
    let frame_x = 0;
    let frame_y = 0;
    
    return function(){
        frame_counter++;
        if(frame_counter >= 10){
            frame_counter = 0;
            frame_x++;
            if(frame_x >= 7){
                frame_x = 0;
                frame_y++;
                if(frame_y >= 3)
                    frame_y = 0;
            }
        }
        
        player.frame_x = frame_x;
        player.frame_y = frame_y;
    }
})();

export const animazione_dashing = (() => {
    let frame_counter = 0;
    let frame_x = 0;

    return function(){
        frame_counter++;
        if(frame_counter >= 2){
            frame_counter = 0;
            frame_x++;
            if(frame_x >= 5){
                frame_x = 0;
            }
        }

        player.frame_x = frame_x;
        player.frame_y = 0;
    }
})();

export const animazione_run = (() => {
    let frame_counter = 0;
    let frame_x = 0;

    return function(){
        frame_counter++;
        if(frame_counter >= 4 && (player.on_ground || player.on_slope)){
            frame_counter = 0;
            frame_x++;
            if(frame_x >= 10){
                frame_x = 0;
            }
        }

        player.frame_x = frame_x;
        player.frame_y = 0;
    }
})();
