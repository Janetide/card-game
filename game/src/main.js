// Ember Duel — boot. Reads ?shot=title|play|win|loss&seed=N for screenshots
// (shots play the real rules forward, so every frame is a genuine game), or
// starts on the title screen for a human player. Animations are disabled in
// shot mode so a screenshot catches the final state, not a transition.
import { createGame } from './game.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed')) || 7;

const game = createGame(seed);
if (shot) {
  document.body.classList.add('no-anim');
  stageShot(shot, game);
} else {
  bindInput(game);
}
render(game);
window.__emberDuel = game;
