// Ember Duel — the hand-in program (Node 22, standard library only). It copies
// this repository's game/ and screenshots/ into /output and writes the dossier
// the judge reads, with the vendored make.fun library. The game itself is
// plain static files: game/index.html plus its modules, no build step, no
// network request. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly, before writing anything, when the game is not there: a
// silent empty /output would look like a valid entry until the gate reads it.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing: the game was not built');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('screenshots/ is missing: take the screenshots first');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
