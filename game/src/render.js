// Ember Duel — every pixel the player sees, as DOM. render(state) rebuilds the
// table from the game state; the screens are title, play, win and loss. Cards
// are real DOM elements so their values stay readable at thumbnail size.
import { ELEMENTS, MAX_HP, OPPONENT_NAME } from './config.js';
import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN } from './game.js';
import { setSoundEnabled, soundEnabled } from './audio.js';

const app = document.getElementById('app');

function elementBadge(element) {
  const info = ELEMENTS[element];
  return `<span class="element-badge element-${element}" title="${info.name}">${info.symbol} ${info.name}</span>`;
}

function hpBar(hp) {
  const percent = Math.max(0, Math.round((hp / MAX_HP) * 100));
  const low = percent <= 25 ? ' low' : '';
  return `<div class="hp-bar${low}"><div class="hp-fill" style="width:${percent}%"></div><span class="hp-text">${hp} / ${MAX_HP} HP</span></div>`;
}

function manaGems(mana, maxMana) {
  let gems = '';
  for (let i = 0; i < maxMana; i += 1) {
    gems += `<span class="mana-gem${i < mana ? ' full' : ''}">◆</span>`;
  }
  return `<div class="mana" title="Mana">${gems}<span class="mana-text">${mana}/${maxMana}</span></div>`;
}

/** One face-up card. `playable` marks it clickable; `index` is its hotkey. */
export function cardElement(card, playable, index) {
  const info = ELEMENTS[card.element];
  const key = index !== undefined ? `<span class="card-key">${index + 1}</span>` : '';
  return `<button type="button" class="card element-${card.element}${playable ? ' playable' : ' dimmed'}" data-card-id="${card.id}" ${playable ? '' : 'disabled'}>
    ${key}
    <span class="card-cost" title="Mana cost">${card.cost}</span>
    <span class="card-symbol">${info.symbol}</span>
    <span class="card-attack" title="Attack">${card.attack}</span>
    <span class="card-name">${card.name}</span>
    <span class="card-element">${info.name}</span>
  </button>`;
}

function cardBackElement() {
  return '<div class="card card-back"><span class="card-back-symbol">✦</span></div>';
}

function titleScreen(game) {
  return `<section class="screen title-screen">
    <p class="title-kicker">A BATTLE OF ELEMENTS</p>
    <h1 class="game-title">EMBER<br>DUEL</h1>
    <p class="title-tagline">Outsmart ${OPPONENT_NAME}. Play cards, chain the Kindled combo, and break the element wheel.</p>
    <div class="wheel">
      <span class="wheel-item element-ember">▲ Ember beats ◆ Gale</span>
      <span class="wheel-item element-gale">◆ Gale beats ● Tide</span>
      <span class="wheel-item element-tide">● Tide beats ▲ Ember</span>
      <span class="wheel-item wheel-combo">Same element twice in a turn: Kindled +3</span>
    </div>
    <button type="button" class="big-button" id="start-button">▶ &nbsp;Start Duel</button>
    <p class="title-hint">Click a card to play it · Keys 1–7 play cards · Space ends your turn · R restarts</p>
    <p class="title-hint">Mana grows every turn. Advantage doubles damage. First to 0 HP loses.</p>
  </section>`;
}

function tableScreen(game) {
  const player = game.player;
  const opponent = game.opponent;
  const yourTurn = game.turnOwner === 'player';
  const last = game.lastDamage;
  let banner = '';
  if (last) {
    const who = last.side === 'player' ? 'You dealt' : `${OPPONENT_NAME} dealt`;
    banner = `<div class="damage-banner">${who} <strong>${last.damage}</strong> damage with ${last.card}${last.advantage ? ' — advantage ×2!' : ''}${last.combo ? ' — Kindled +3!' : ''}</div>`;
  }
  const opponentHand = opponent.hand.map(() => cardBackElement()).join('');
  const playerHand = player.hand
    .map((card, index) => cardElement(card, yourTurn && card.cost <= player.mana, index))
    .join('');
  const logLines = game.log.slice(-5).map((line) => `<li>${line}</li>`).join('');
  return `<section class="screen table-screen">
    <header class="table-top">
      <div class="fighter opponent-fighter">
        <div class="fighter-name">${OPPONENT_NAME}</div>
        ${hpBar(opponent.hp)}
        ${manaGems(opponent.mana, opponent.maxMana)}
      </div>
      <div class="turn-box">
        <div class="turn-label">TURN ${game.turn}</div>
        <div class="turn-owner">${yourTurn ? 'YOUR TURN' : 'CINDER ACTS…'}</div>
        <div class="deck-count">Deck ${player.deck.length} · Foe deck ${opponent.deck.length}</div>
      </div>
      <div class="fighter player-fighter">
        <div class="fighter-name">You — Ember Knight</div>
        ${hpBar(player.hp)}
        ${manaGems(player.mana, player.maxMana)}
      </div>
    </header>
    <div class="opponent-hand" aria-label="Opponent hand">${opponentHand}<span class="hand-count">${opponent.hand.length} cards</span></div>
    <div class="middle-row">
      <div class="arena-note">Element wheel: ▲ Ember &gt; ◆ Gale &gt; ● Tide &gt; ▲ Ember · Same element twice: Kindled +3</div>
      ${banner}
    </div>
    <ol class="log" aria-label="Battle log">${logLines}</ol>
    <div class="player-hand" aria-label="Your hand">${playerHand}</div>
    <footer class="table-bottom">
      <button type="button" class="big-button end-turn" id="end-turn-button" ${yourTurn ? '' : 'disabled'}>End Turn ⏎</button>
      <button type="button" class="small-button" id="restart-button">↻ Restart (R)</button>
      <button type="button" class="small-button" id="sound-button">${soundEnabled() ? '🔊 Sound on' : '🔇 Sound off'}</button>
      <span class="score-hint">Score ${game.score || player.hp * 10 + game.turn * 5 + game.cardsPlayed * 2} · Cards played ${game.cardsPlayed}</span>
    </footer>
  </section>`;
}

function endScreen(game, won) {
  const title = won ? 'VICTORY!' : 'DEFEAT';
  const line = won
    ? `The Ash Witch falls. Your knight stands with ${game.player.hp} HP to spare.`
    : `${OPPONENT_NAME} wins this duel. The embers fade — for now.`;
  return `<section class="screen end-screen ${won ? 'win' : 'loss'}">
    <p class="title-kicker">${won ? 'THE DUEL IS YOURS' : 'THE DUEL IS LOST'}</p>
    <h1 class="game-title">${title}</h1>
    <p class="title-tagline">${line}</p>
    <div class="score-card">
      <div class="score-row"><span>Final score</span><strong>${game.score}</strong></div>
      <div class="score-row"><span>HP left</span><strong>${game.player.hp} × 10 = ${game.player.hp * 10}</strong></div>
      <div class="score-row"><span>Turns</span><strong>${game.turn} × 5 = ${game.turn * 5}</strong></div>
      <div class="score-row"><span>Cards played</span><strong>${game.cardsPlayed} × 2 = ${game.cardsPlayed * 2}</strong></div>
    </div>
    <button type="button" class="big-button" id="again-button">${won ? '▶ &nbsp;Duel Again' : '↻ &nbsp;Try Again'}</button>
    <p class="title-hint">Press R to play again</p>
  </section>`;
}

/** Draw the whole game from state. Called after every action. */
export function render(game) {
  let html;
  if (game.phase === PHASE_TITLE) html = titleScreen(game);
  else if (game.phase === PHASE_WIN) html = endScreen(game, true);
  else if (game.phase === PHASE_LOSS) html = endScreen(game, false);
  else html = tableScreen(game);
  app.innerHTML = html;
  const soundButton = document.getElementById('sound-button');
  if (soundButton) {
    soundButton.addEventListener('click', () => {
      setSoundEnabled(!soundEnabled());
      render(game);
    });
  }
}
