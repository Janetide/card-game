# Ember Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Janetide/card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Janetide/card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Ember Duel is an original card battler: you, the Ember Knight, face Cinder, the Ash Witch, in a duel of three elements. Play cards to deal damage, break the element wheel, and chain the Kindled combo. First to 0 HP loses.

## How to play

- **Elements:** ▲ Ember beats ◆ Gale, ◆ Gale beats ● Tide, ● Tide beats ▲ Ember. Attacking with the beating element deals **double damage**.
- **Kindled combo:** play two cards of the same element in one turn and the second gets **+3 attack**.
- **Mana:** starts at 1 and grows by 1 each turn (up to 10), refilling every turn. Draw 2 cards a turn, hand limit 7.
- **Controls:** click a card to play it (keys 1–7), Space / End Turn to pass, R to restart.
- **Win:** reduce Cinder to 0 HP. Score = HP left × 10 + turns × 5 + cards played × 2.

## Run

Open `game/index.html` in desktop Chrome, or serve it:

```bash
node serve.ts   # serves game/ at http://localhost:8080
```

No build step, no network requests, no dependencies. Screenshot scenes: `?shot=title|play|win|loss&seed=7`.

Built with [make.fun](https://make.fun/?ref=trfjt22d&utm_source=github&utm_medium=readme&utm_campaign=card-game).

## Agent session transcripts

See [transcripts/](transcripts/) for the full AI agent session transcripts of this entry.
