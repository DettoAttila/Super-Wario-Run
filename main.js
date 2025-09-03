import * as audio from './classes/audio.js';
import { checkOnGround, checkOnSlope, creaCollisioni, in_lava, risolviCollisione } from './classes/collision.js';
import { buffer_sezioni, caricaSezione, rimuoviSezione, Sezione, sezioneRandom } from './classes/map.js';
import { animazione_dashing, animazione_idle, animazione_run, jump, player, punch } from './classes/player.js';
import * as draw from './classes/draw.js';

//Nel canvas disegniamo la grafica
export const canvas = document.getElementById("schermata_gioco");
export const ctx = canvas.getContext("2d");

canvas.width = 240;
canvas.height = 160;

//Quadro iniziale
export let fg_tilemap = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 226, 227, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 226, 227, 242, 243, 0, 0, 226, 227, 0, 0, 0,
            0, 0, 226, 227, 242, 243, 258, 259, 0, 0, 242, 243, 0, 0, 0,
            226, 227, 242, 243, 258, 259, 274, 275, 226, 227, 258, 259, 274, 308, 0,
            242, 246, 258, 259, 274, 275, 226, 227, 242, 243, 274, 275, 244, 0, 0,
            258, 262, 274, 275, 226, 227, 242, 243, 258, 259, 226, 214, 0, 0, 0,
            274, 275, 226, 227, 242, 243, 258, 259, 290, 291, 242, 244, 0, 0, 0,
            0, 0, 0, 0, 258, 259, 0, 0, 0, 0, 258, 259, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 274, 275, 0, 0, 0],[1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003,
            1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971, 1073742003, 1073742004, 1073741987, 1073741988, 1073741971,
            1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956, 1073741957, 1073741954, 1073741955, 1073741956,
            99, 100, 101, 102, 36, 99, 100, 101, 102, 36, 99, 100, 101, 102, 36,
            115, 116, 117, 118, 0, 115, 116, 117, 118, 0, 115, 116, 117, 118, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5,
            19, 20, 21, 22, 19, 20, 21, 22, 19, 20, 21, 22, 19, 20, 21,
            130, 131, 132, 133, 130, 131, 132, 133, 130, 131, 132, 133, 130, 131, 132]];

export const tile_size = 16;
export const tile_col = 16;

let margine_caricamento = tile_size*5; //grullo

export let map_col = 15;
export let map_row = 10;

let sezione0 = new Sezione(fg_tilemap, map_col, map_row);

buffer_sezioni.push(sezione0);  //inizializzazione buffer di partenza
buffer_sezioni.push(sezioneRandom());
buffer_sezioni.push(sezioneRandom());

//Camera e movimento
export let camera_x = 0;
export let camera_speed;
let acc = 0.2;
let timer = 0;  //il tempo passato dall'inizio della partita
let last_frame_timestamp = 0;  //il timestamp dell'ultimo frame

//Stato
let pausa = false;

let fine_sezione = map_col * tile_size;
export let stato_gioco = "menu";

//UPDATE FRAME PER FRAME
function update(time){
    if(stato_gioco == "game over") return;
    if(pausa) return;

    switch(player.stato){
        case "idle":
            draw.player_img.src = "assets/wario_idle.png";
            animazione_idle();
            break;
        case "run":
            draw.player_img.src = "assets/wario_running.png";
            animazione_run();
            break;
        case "dash":
            draw.player_img.src = "assets/wario_dashing.png";
            animazione_dashing();
            break;
        case "dash_end":
            draw.player_img.src = "assets/wario_dashing.png";
            animazione_dashing();
            break;
    }

    draw.drawBG();
    draw.drawStage(0); //per disegnare eventuali elementi in "background"
    draw.drawPlayer();
    draw.drawStage();
    draw.drawParticelle();

    if(stato_gioco == "menu")
        ctx.drawImage(draw.title_img, 0, 0);
    else draw.drawGUI();

    if(stato_gioco == "menu"){
        player.stato = "idle";
        requestAnimationFrame(update);
        return;
    }
    
    if(player.stato == "run")
        audio.audio_walk.play();

    if(player.stato == "dash_end"){
        player.x -= camera_speed;

        if(player.x < 10){
            player.stato = "run";
            player.x = 10;
        }
    }

    if(player.stato == "dash" && player.x < 50){
        player.x += player.rincorsa;   

        if(player.x >= 50)
            player.stato = "dash_end";
    }

    //se finisce un po' troppo indietro dopo una collisione
    if(player.stato == "run" && player.x < 10){
        player.x++;
    }
    
    const tile_collisions = creaCollisioni();
    
    const delta = time - last_frame_timestamp; //tempo trascorso dall'ultimo frame
    last_frame_timestamp = time;
    
    if(!player.on_ground){
        if(player.jump_premuto && (player.jump_premuto_tempo > 40 && player.jump_premuto_tempo < 340)){
            player.jump_premuto_tempo += delta;
            player.salto += -0.012 * delta;
        } else player.jump_premuto_tempo += delta;
        
        player.salto += player.g;
        player.y += player.salto;
    }

    player.collision_box.pos.x = player.x + 10; //+5
    player.collision_box.pos.y = player.y + 9;
    
    player.on_ground = checkOnGround(tile_collisions);
    player.on_slope = checkOnSlope(tile_collisions);
    risolviCollisione(tile_collisions);

    if(player.on_ground) //sostanzialmente: prima verifica se è in aria e gestisci, gestisci le collisioni e infine se è per terra setta salto a 0
        player.salto = 0;

    timer += delta;

    if(timer >= 30000){
        camera_speed += acc;
        timer = 0;
        audio.playAudio(audio.audio_hurry_up);
    }
    
    camera_x += camera_speed;
        
    player.punteggio += Math.round(delta/33);

    if(player.punteggio % 1000 == 0 && player.punteggio != 0)
        audio.playAudio(audio.audio_yeah);

    if(camera_x > fine_sezione + margine_caricamento){ //margine per evitare che venga rimossa troppo prima
        rimuoviSezione();
        caricaSezione();
        fine_sezione += buffer_sezioni[0].map_col * tile_size;
    }
    
    if(in_lava || player.y > canvas.height + tile_size || player.x < -player.width){ //GAME OVER
        ctx.drawImage(draw.gameover_img, 0, 0);
        stato_gioco = "game over";

        const is_high_score = checkHighestScore();

        checkClassifica().then(in_classifica => {
            if(in_classifica || is_high_score){
                audio.playAudio(audio.audio_alright);
                salvaPunteggio(in_classifica, is_high_score);
            } else {
                audio.audio_scream.play();
            }
            return;
        });
    }

    requestAnimationFrame(update);
}

mostraScoreboard();

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

async function salvaPunteggio(in_classifica, is_high_score){
    if(confirm("New High Score! Do you want to save it?")){
        let username = null;
        let valid = false;

        while(!valid){
            const input = prompt("Enter your name (max 15 characters):");

            if(input.length > 15){
                alert("Username too long! Try Again.");
                continue;
            }

            username = (input && input.trim() != "") ? input.trim() : "???";
            valid = true;
        }

        if(is_high_score){
            localStorage.setItem("local_highest_score", player.punteggio);
            localStorage.setItem("local_highest_gemme", player.gemme);
            localStorage.setItem("local_name", username);
        }
        
        if(in_classifica){
            try {
                const response = await fetch("save_score.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username, 
                        punteggio: player.punteggio, 
                        gems: player.gemme
                    })
                });
                
                if(!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                
                if(!result.success){
                    console.error("Error:", result.error);
                    alert("Error saving score.");
                }
                
            } catch (error) {
                console.error("Error saving score:", error);
                alert("Error saving score.");
            }
        }
    }
}

function checkHighestScore() {
    const local_highest_score = localStorage.getItem("local_highest_score") || 0;
    const local_highest_gemme = localStorage.getItem("local_highest_gemme") || 0;

    if(player.punteggio > local_highest_score || (player.punteggio == local_highest_score && player.gemme > local_highest_gemme))
        return true;

    return false;
}

async function checkClassifica() {
    try {
        const response = await fetch("check_score.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({punteggio: player.punteggio, gems: player.gemme})
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const risultato = await response.json();
        
        if (risultato.success) {
            return risultato.inClassifica; // o restituisci tutto l'oggetto risultato
        } else {
            console.error("Errore dal server:", risultato.error);
            return false;
        }

    } catch(error) {
        console.error("Errore in checkClassifica:", error);
        return false;
    }
}

async function getScoreboard(){
    try {
        const response = await fetch("print_classifica.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            return data.classifica;
        } else {
            console.error("Errore dal server:", data.error);
            return [];
        }
        
    } catch (error) {
        console.error("Errore nel recupero della classifica:", error);
        return [];
    }
}

async function mostraScoreboard() {
    const container = document.getElementById('classifica');
    
    //Loading
    container.codiceHTML = '<div class="loading">Loading...</div>';
    
    const classifica = await getScoreboard();
    
    // Crea la tabella HTML
    let table = `
        <img src="assets/monitor1.png" id="monitor1" alt="">
        <h2 id="scoreboard">Scoreboard</h2>
        <div class="classifica-wrapper">
            <table>
                <thead>
                    <tr>
                        <th id="thrank">Rank</th>
                        <th id="thname">Name</th>
                        <th id="thscore">Score</th>
                        <th id="thgems">Gems</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const crown_icon = '<img src="assets/crown_icon.png" width="16" height="16" alt="">';
    
    classifica.forEach((player, index) => {
        const rowClass = (index < 3)? `podio${index + 1}` : '';
        
        table +=`<tr class="${rowClass}">
                        <td>${(index == 0)? crown_icon : ''} ${player.posizione}</td>
                        <td class="username">${player.username}</td>
                        <td class="score">${player.score.toLocaleString()}</td>
                        <td class="gems">💎 ${player.gems}</td>
                    </tr>`;
    });
    
    table += 
                `</tbody>
            </table>
        </div>
        <br>
        <br>
        <div>
            Highest score: 
                ${localStorage.getItem("local_name") || "-"},
                ${localStorage.getItem("local_highest_score") || "-"},
                💎 ${localStorage.getItem("local_highest_gemme") || "-"}.
        </div>`;
    
    container.codiceHTML = table;

    container.codiceHTML = container.codiceHTML.replace(/💎/g, '<img src="assets/counter_icon.png" width="16" height="16" alt="">');
}

document.addEventListener("keydown", (e) => {
    switch(e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            e.preventDefault();
            e.stopPropagation();
            break;
    }

    if(e.code == "Enter"){
        if(stato_gioco == "menu")
            start();
        if(stato_gioco == "game over")
            reset();
    }

    if(e.code == "KeyP"){
        pausa = !pausa;
        audio.playAudio((pausa)? audio.audio_pause_on : audio.audio_pause_off);
        last_frame_timestamp = performance.now();

        if(!pausa)
            requestAnimationFrame(update);
    }

    if(stato_gioco == "play" && !pausa){
        if(e.code == "Space" && !e.repeat && (player.on_ground || player.on_slope))
            jump();

        if(e.code == "ArrowRight" && player.stato != "dash" && player.stato != "dash_end" && !e.repeat)
            punch();
    }
});

document.addEventListener("keyup", (e) => {
    if(e.code == "Space")
        player.jump_premuto = false;
});

requestAnimationFrame(update);