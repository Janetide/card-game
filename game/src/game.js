// Ember Duel — the game itself: state, turns, damage and win/loss. It knows
// nothing about the DOM; render.js draws whatever this state holds, and
// input.js calls these functions when the player acts.
import {
  DRAW_PER_TURN,
  HAND_LIMIT,
  MAX_HP,
  MAX_MANA,
  OPPONENT_NAME,
  PLAYER_NAME,
} from './config.js';
import { buildDeck, cardDamage, cardLabel, drawCards, hasAdvantage } from './cards.js';
import { choosePlay } from './ai.js';
import { makeRandom } from './random.js';
import { hitSound, loseSound, playCardSound, turnSound, winSound } from './audio.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_WIN = 'win';
export const PHASE_LOSS = 'loss';

/** A fresh game state for the given seed. */
export function createGame(seed) {
  const random = makeRandom(seed);
  return {
    seed,
    random,
    phase: PHASE_TITLE,
    turn: 1,
    turnOwner: 'player',
    player: {
      name: PLAYER_NAME,
      hp: MAX_HP,
      mana: 1,
      maxMana: 1,
      deck: buildDeck(random),
      hand: [],
      discard: [],
      lastElement: null,
    },
    opponent: {
      name: OPPONENT_NAME,
      hp: MAX_HP,
      mana: 1,
      maxMana: 1,
      deck: buildDeck(random),
      hand: [],
      discard: [],
      lastElement: null,
    },
    playedThisTurn: [],
    log: [`${OPPONENT_NAME} challenges you. First to 0 HP loses.`],
    score: 0,
    cardsPlayed: 0,
    lastDamage: null,
  };
}

/** Deal the opening hands and enter the play phase. */
export function startGame(game) {
  drawCards(game.player.deck, game.player.hand, 3, HAND_LIMIT);
  drawCards(game.opponent.deck, game.opponent.hand, 3, HAND_LIMIT);
  game.phase = PHASE_PLAY;
  game.log.push('You draw 3 cards. Your turn — play a card or end the turn.');
  turnSound();
}

/** Begin a side's turn: grow mana, refill it, draw cards. Mana does not grow
 * on the first turn of the game, so the witch starts at 1 mana like you. */
function beginTurn(game, side) {
  const actor = game[side];
  actor.maxMana = Math.min(MAX_MANA, actor.maxMana + (game.turn === 1 ? 0 : 1));
  actor.mana = actor.maxMana;
  const drawn = drawCards(actor.deck, actor.hand, DRAW_PER_TURN, HAND_LIMIT);
  game.playedThisTurn = [];
  game.turnOwner = side;
  if (drawn.length > 0) {
    game.log.push(`${actor.name} draws ${drawn.length}.`);
  } else if (actor.deck.length === 0) {
    game.log.push(`${actor.name} has no cards left to draw.`);
  }
}

/** Score so far: HP kept, turns survived, cards played. */
function computeScore(game) {
  return game.player.hp * 10 + game.turn * 5 + game.cardsPlayed * 2;
}

/** Apply a card's damage and check for a winner. Returns true when the game ends. */
function applyDamage(game, attackerSide, card) {
  const defender = game[attackerSide === 'player' ? 'opponent' : 'player'];
  const attacker = game[attackerSide];
  const elements = game.playedThisTurn.map((entry) => entry.element);
  const damage = cardDamage(card, defender.lastElement, elements);
  const advantage = hasAdvantage(card.element, defender.lastElement);
  const combo = elements.includes(card.element);
  defender.hp = Math.max(0, defender.hp - damage);
  attacker.lastElement = card.element;
  game.playedThisTurn.push({ element: card.element, name: card.name });
  game.cardsPlayed += 1;
  game.lastDamage = { side: attackerSide, damage, advantage, combo, card: card.name };
  let line = `${attacker.name} plays ${cardLabel(card)} for ${damage} damage`;
  if (advantage) line += ' — element advantage ×2!';
  if (combo) line += ' — Kindled combo +3!';
  line += '.';
  game.log.push(line);
  hitSound();
  if (defender.hp <= 0) {
    game.phase = attackerSide === 'player' ? PHASE_WIN : PHASE_LOSS;
    game.score = computeScore(game);
    if (game.phase === PHASE_WIN) {
      game.log.push(`Victory! Score ${game.score}.`);
      winSound();
    } else {
      game.log.push(`Defeat. Score ${game.score}.`);
      loseSound();
    }
    return true;
  }
  return false;
}

/**
 * Play a card from `side`'s hand by id. Returns false when the card cannot
 * be played (wrong phase, wrong turn, not in hand, not enough mana).
 */
export function playCard(game, side, cardId) {
  if (game.phase !== PHASE_PLAY) return false;
  if (game.turnOwner !== side) return false;
  const actor = game[side];
  const index = actor.hand.findIndex((card) => card.id === cardId);
  if (index === -1) return false;
  const card = actor.hand[index];
  if (card.cost > actor.mana) return false;
  actor.hand.splice(index, 1);
  actor.discard.push(card);
  actor.mana -= card.cost;
  playCardSound();
  return !applyDamage(game, side, card);
}

/** The player ends their turn; the AI then takes its own turn. */
export function endPlayerTurn(game) {
  if (game.phase !== PHASE_PLAY || game.turnOwner !== 'player') return;
  game.log.push('You end your turn.');
  takeOpponentTurn(game);
}

/** The AI plays its cards, then the next player turn begins. */
function takeOpponentTurn(game) {
  const ai = game.opponent;
  beginTurn(game, 'opponent');
  let guard = 0;
  while (game.phase === PHASE_PLAY && guard < 12) {
    guard += 1;
    const card = choosePlay(ai.hand, ai.mana, game.player.lastElement, game.playedThisTurn.map((entry) => entry.element));
    if (!card) break;
    playCard(game, 'opponent', card.id);
  }
  if (game.phase !== PHASE_PLAY) return;
  game.turn += 1;
  beginTurn(game, 'player');
  game.log.push(`Turn ${game.turn} — your move.`);
  turnSound();
}

/** Back to the title screen with a fresh shuffle of the same seed. */
export function resetGame(game) {
  const fresh = createGame(game.seed + 1);
  Object.assign(game, fresh);
}
