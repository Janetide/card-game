// Ember Duel — mouse and keyboard. Clicks are delegated from the app root so
// re-rendering never orphans a handler; keys 1–7 play cards, Space ends the
// turn, R restarts, Enter starts.
import { endPlayerTurn, playCard, resetGame, startGame } from './game.js';
import { unlockAudio } from './audio.js';
import { render } from './render.js';

function playCardByIndex(game, index) {
  const card = game.player.hand[index];
  if (!card) return;
  if (playCard(game, 'player', card.id)) render(game);
  else render(game);
}

/** Wire all input once; `onChange` re-renders after every action. */
export function bindInput(game) {
  const app = document.getElementById('app');
  app.addEventListener('click', (event) => {
    unlockAudio();
    const target = event.target;
    const startButton = target.closest('#start-button');
    if (startButton) {
      startGame(game);
      render(game);
      return;
    }
    const againButton = target.closest('#again-button');
    if (againButton) {
      resetGame(game);
      startGame(game);
      render(game);
      return;
    }
    const endTurnButton = target.closest('#end-turn-button');
    if (endTurnButton) {
      endPlayerTurn(game);
      render(game);
      return;
    }
    const restartButton = target.closest('#restart-button');
    if (restartButton) {
      resetGame(game);
      startGame(game);
      render(game);
      return;
    }
    const cardButton = target.closest('[data-card-id]');
    if (cardButton) {
      const cardId = Number(cardButton.getAttribute('data-card-id'));
      playCard(game, 'player', cardId);
      render(game);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && game.phase === 'title') {
      unlockAudio();
      startGame(game);
      render(game);
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      unlockAudio();
      resetGame(game);
      startGame(game);
      render(game);
      return;
    }
    if (game.phase !== 'play') return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      unlockAudio();
      endPlayerTurn(game);
      render(game);
      return;
    }
    const digit = Number(event.key);
    if (digit >= 1 && digit <= 7) {
      unlockAudio();
      playCardByIndex(game, digit - 1);
    }
  });
}
