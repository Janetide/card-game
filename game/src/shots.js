// Ember Duel — the screenshot scenes behind ?shot=title|play|win|loss. Each one
// plays the real rules forward from a fresh game with a fixed seed, steered by
// a simple autopilot (play the best affordable card by damage, end the turn),
// so every frame is what a real game looks like and the same seed always
// gives the same frame. No scene is staged by hand.
import { endPlayerTurn, playCard, startGame } from './game.js';
import { cardDamage } from './cards.js';

/** The autopilot's turn: choose the set of cards that deals the most damage
 * with this turn's mana (a small knapsack over a hand of at most 7), then play
 * them in that order. Advantage counts double; the Kindled combo adds +3 to
 * the second and later card of an element in the set. */
function autopilotTurn(game) {
  const hand = game.player.hand;
  const mana = game.player.mana;
  const defenderElement = game.opponent.lastElement;
  let bestSet = [];
  let bestDamage = 0;
  const count = hand.length;
  for (let mask = 1; mask < 1 << count; mask += 1) {
    let cost = 0;
    const set = [];
    for (let i = 0; i < count; i += 1) {
      if (mask & (1 << i)) {
        cost += hand[i].cost;
        set.push(hand[i]);
      }
    }
    if (cost > mana) continue;
    // Play order inside the set: biggest damage first, so the combo lands on
    // the later cards of a shared element.
    set.sort((a, b) => cardDamage(b, defenderElement, []) - cardDamage(a, defenderElement, []));
    const seen = [];
    let damage = 0;
    for (const card of set) {
      damage += cardDamage(card, defenderElement, seen);
      seen.push(card.element);
    }
    if (damage > bestDamage) {
      bestDamage = damage;
      bestSet = set;
    }
  }
  for (const card of bestSet) {
    if (game.phase !== 'play') return;
    playCard(game, 'player', card.id);
  }
  if (game.phase === 'play') endPlayerTurn(game);
}

/**
 * Set `game` to the named scene and return the phase it shows. `win` steers
 * the autopilot aggressively until the witch falls; `loss` lets the witch
 * win by playing passively (only cheap cards, never the big ones).
 */
export function stageShot(name, game) {
  if (name === 'title') return 'title';
  startGame(game);
  if (name === 'play') {
    for (let turn = 0; turn < 3 && game.phase === 'play'; turn += 1) {
      autopilotTurn(game);
    }
    return game.phase;
  }
  if (name === 'win') {
    let guard = 0;
    while (game.phase === 'play' && guard < 40) {
      guard += 1;
      autopilotTurn(game);
    }
    return game.phase;
  }
  // loss: the player only ever plays 1-cost cards, so the witch wins.
  let guard = 0;
  while (game.phase === 'play' && guard < 40) {
    guard += 1;
    let played = false;
    for (const card of game.player.hand.slice()) {
      if (card.cost === 1 && card.cost <= game.player.mana) {
        playCard(game, 'player', card.id);
        played = true;
        break;
      }
    }
    if (!played || game.phase !== 'play') {
      if (game.phase === 'play') endPlayerTurn(game);
      continue;
    }
    if (game.phase === 'play') endPlayerTurn(game);
  }
  return game.phase;
}
