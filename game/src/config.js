// Ember Duel — shared constants: the three elements, the arena numbers and the
// card pool. Everything that tunes the game lives here and nowhere else.
export const ELEMENTS = {
  ember: { name: 'Ember', symbol: '▲', color: '#e2483d', dark: '#7a1d16', beats: 'gale' },
  tide: { name: 'Tide', symbol: '●', color: '#2f7fe0', dark: '#123f7a', beats: 'ember' },
  gale: { name: 'Gale', symbol: '◆', color: '#2fae6e', dark: '#0f5c33', beats: 'tide' },
};

export const ELEMENT_ORDER = ['ember', 'tide', 'gale'];

export const MAX_HP = 30;
export const MAX_MANA = 10;
export const HAND_LIMIT = 7;
export const DECK_SIZE = 24;
export const DRAW_PER_TURN = 2;
export const COMBO_BONUS = 3;
export const ADVANTAGE_MULTIPLIER = 2;

// Every card in the pool: name, element, mana cost, attack. A deck is two
// shuffled copies of the pool (8 cards x 3 elements = 24).
export const CARD_POOL = [
  { name: 'Spark', element: 'ember', cost: 1, attack: 2 },
  { name: 'Cinder', element: 'ember', cost: 2, attack: 4 },
  { name: 'Flare', element: 'ember', cost: 3, attack: 6 },
  { name: 'Inferno', element: 'ember', cost: 5, attack: 9 },
  { name: 'Droplet', element: 'tide', cost: 1, attack: 2 },
  { name: 'Stream', element: 'tide', cost: 2, attack: 4 },
  { name: 'Surge', element: 'tide', cost: 3, attack: 6 },
  { name: 'Tsunami', element: 'tide', cost: 5, attack: 9 },
  { name: 'Breeze', element: 'gale', cost: 1, attack: 2 },
  { name: 'Gust', element: 'gale', cost: 2, attack: 4 },
  { name: 'Storm', element: 'gale', cost: 3, attack: 6 },
  { name: 'Cyclone', element: 'gale', cost: 5, attack: 9 },
];

// Extra mid-cost cards so hands feel varied: one 4-cost bruiser per element.
export const BRUISERS = [
  { name: 'Wildfire', element: 'ember', cost: 4, attack: 8 },
  { name: 'Riptide', element: 'tide', cost: 4, attack: 8 },
  { name: 'Tempest', element: 'gale', cost: 4, attack: 8 },
];

export const OPPONENT_NAME = 'Cinder, the Ash Witch';
export const PLAYER_NAME = 'You, the Ember Knight';
export const GAME_TITLE = 'EMBER DUEL';
