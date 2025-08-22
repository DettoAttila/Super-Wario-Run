export function playAudio(audio){
    const clone = audio.cloneNode(); // crea una copia indipendente
    clone.play();

    clone.addEventListener('ended', () => {
        clone.remove();
    });
}

export const audio_excellent = new Audio('./../assets/sfx/Excellent03.wav');
export const audio_hurry_up = new Audio('./../assets/sfx/HurryUp04.wav');
export const audio_scream = new Audio('./../assets/sfx/Scream02.wav');
export const audio_yahoo = new Audio('./../assets/sfx/Yahoo05.wav');
export const audio_blue_gem = new Audio('./../assets/sfx/Crystal_blue.wav');
export const audio_red_gem = new Audio('./../assets/sfx/Crystal_red.wav');
export const audio_walk = new Audio('./../assets/sfx/Wario_Walk.wav');
export const audio_jump = new Audio('./../assets/sfx/Wario_Jump.wav');
export const audio_dash = new Audio('./../assets/sfx/Wario_Attack.wav');
export const audio_block_destroy = new Audio('./../assets/sfx/Wario_AttackBlock.wav');
export const audio_yeah = new Audio('./../assets/sfx/Yeah01.wav');