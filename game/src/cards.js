// Ember Duel — the deck and the card rules: building, drawing, element
// advantage and the Kindled combo. No rendering here, only numbers.
import {
  ADVANTAGE_MULTIPLIER,
  BRUISERS,
  CARD_POOL,
  COMBO_BONUS,
  DECK_SIZE,
  ELEMENTS,
} from './config.js';
import { shuffle } from './random.js';

let nextCardId = 1;

/** One physical card: a pool entry plus a unique id. */
export function makeCard(entry) {
  const card = { id: nextCardId, name: entry.name, element: entry.element, cost: entry.cost, attack: entry.attack };
  nextCardId += 1;
  return card;
}

/** Build a fresh deck: two copies of the pool plus the bruisers, shuffled. */
export function buildDeck(random) {
  const entries = CARD_POOL.concat(CARD_POOL, BRUISERS);
  const deck = shuffle(entries, random).slice(0, DECK_SIZE).map(makeCard);
  return deck;
}

/** Draw up to `count` cards from the deck into the hand. Returns what was drawn. */
export function drawCards(deck, hand, count, limit) {
  const drawn = [];
  while (drawn.length < count && deck.length > 0 && hand.length < limit) {
    const card = deck.shift();
    hand.push(card);
    drawn.push(card);
  }
  return drawn;
}

/** True when attacker's element beats defender's element on the wheel. */
export function hasAdvantage(attackerElement, defenderElement) {
  if (!defenderElement) return false;
  return ELEMENTS[attackerElement].beats === defenderElement;
}

/**
 * Damage a card deals: base attack, doubled on element advantage, plus the
 * Kindled combo bonus when it shares an element with a card already played
 * this turn. `lastElements` lists the elements played earlier this turn.
 */
export function cardDamage(card, defenderElement, lastElements) {
  let damage = card.attack;
  if (hasAdvantage(card.element, defenderElement)) damage *= ADVANTAGE_MULTIPLIER;
  if (lastElements.includes(card.element)) damage += COMBO_BONUS;
  return damage;
}

/** A short label for a card, used by the log and the AI. */
export function cardLabel(card) {
  return `${card.name} ${ELEMENTS[card.element].symbol} ${card.attack}`;
}
