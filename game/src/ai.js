// Ember Duel — the opponent's brain. It scores every affordable card in its
// hand and plays the best one, then repeats while it can still afford a card
// and the play is worth it. It prefers element advantage, then the Kindled
// combo, then raw attack, and it holds back a cheap card when its mana would
// otherwise be wasted on nothing.
import { cardDamage } from './cards.js';

/** Score one candidate play: higher is better. */
export function scorePlay(card, mana, defenderElement, lastElements, handSize) {
  const damage = cardDamage(card, defenderElement, lastElements);
  let score = damage * 10 - card.cost * 2;
  // A card that leaves mana stranded is fine; a card that spends the last
  // mana on a weak hit is not.
  if (mana - card.cost === 0 && damage < 4) score -= 6;
  // Keep the hand flowing: a nearly full hand plays more freely.
  if (handSize >= 6) score += 4;
  return score;
}

/**
 * Pick the AI's next card, or null when it should stop. `state` carries the
 * AI hand, mana and the elements played this turn; `playerLastElement` is the
 * element the player last attacked with (the AI answers it when it can).
 */
export function choosePlay(hand, mana, playerLastElement, lastElements) {
  let best = null;
  let bestScore = 4; // below this, holding the cards is the better play
  for (const card of hand) {
    if (card.cost > mana) continue;
    const score = scorePlay(card, mana, playerLastElement, lastElements, hand.length);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}
