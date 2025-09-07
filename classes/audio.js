export function playAudio(audio){
    const clone = audio.cloneNode(); // crea una copia indipendente
    clone.play();

    clone.addEventListener('ended', () => {
        clone.remove();
    });
}

export const audio_excellent = new Audio('./../assets/sfx/Excellent03.opus');
export const audio_hurry_up = new Audio('./../assets/sfx/HurryUp04.opus');
export const audio_scream = new Audio('./../assets/sfx/Scream02.opus');
export const audio_yahoo = new Audio('./../assets/sfx/Yahoo05.opus');
export const audio_blue_gem = new Audio('./../assets/sfx/Crystal_blue.opus');
export const audio_red_gem = new Audio('./../assets/sfx/Crystal_red.opus');
export const audio_walk = new Audio('./../assets/sfx/Wario_Walk.opus');
export const audio_jump = new Audio('./../assets/sfx/Wario_Jump.opus');
export const audio_dash = new Audio('./../assets/sfx/Wario_Attack.opus');
export const audio_block_destroy = new Audio('./../assets/sfx/Wario_AttackBlock.opus');
export const audio_yeah = new Audio('./../assets/sfx/Yeah01.opus');
export const audio_alright = new Audio('./../assets/sfx/Alright01.opus');
export const audio_diamond = new Audio('./../assets/sfx/Diamond.opus');
export const audio_pause_on = new Audio('./../assets/sfx/PauseON.opus');
export const audio_pause_off = new Audio('./../assets/sfx/PauseOFF.opus');