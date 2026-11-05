// Ejecución explícita y secuencial. Solo fixtures; salida JSON a stdout.
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { volumeFixture, VOLUME_SIZES } from './volume-fixtures.mjs';
import { fingerprint } from './json.mjs';

const mib = value => Number((value / 1048576).toFixed(3));
const median = list => [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)];
async function sample(moduleUrl, size) {
  const { validateBackup } = await import(moduleUrl), fixture = volumeFixture(size), text = JSON.stringify(fixture);
  const warmup = validateBackup(text);
  if (warmup.status !== 'complete') throw new Error('La fixture moderada no se acepta: ' + JSON.stringify(warmup.issues));
  const samples = [];
  for (let repeat = 0; repeat < 3; repeat++) {
    globalThis.gc?.();
    const before = process.memoryUsage(), start = performance.now();
    const result = validateBackup(text), elapsedMs = performance.now() - start, after = process.memoryUsage();
    if (result.status !== 'complete') throw Error('El validador rechazó una fixture medida.');
    samples.push({ repeat: repeat + 1, elapsedMs: Number(elapsedMs.toFixed(3)), heapBeforeMiB: mib(before.heapUsed), heapAfterMiB: mib(after.heapUsed),
      heapDeltaMiB: mib(after.heapUsed - before.heapUsed), rssBeforeMiB: mib(before.rss), rssAfterMiB: mib(after.rss), maxRssProcessMiB: Number((process.resourceUsage().maxRSS / 1024).toFixed(3)) });
  }
  return { gamesPerKind: size, totalGames: fixture.manifest.totals.representations, totalEvents: fixture.data.localEvents.length + fixture.data.cloudEvents.length,
    pending: fixture.data.pendingIntents.length, inputBytes: Buffer.byteLength(text, 'utf8'), inputSha256: fingerprint(fixture),
    summary: warmup.summary, samples, medianMs: median(samples.map(row => row.elapsedMs)), minMs: Math.min(...samples.map(row => row.elapsedMs)),
    maxMs: Math.max(...samples.map(row => row.elapsedMs)), maxHeapAfterMiB: Math.max(...samples.map(row => row.heapAfterMiB)),
    maxRssProcessMiB: Math.max(...samples.map(row => row.maxRssProcessMiB)) };
}
async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--sample') {
    const size = Number(args[1]);
    if (!VOLUME_SIZES.includes(size)) throw Error('Solo se miden los tres volúmenes moderados definidos.');
    const result = await sample(args[2], size); process.stdout.write(JSON.stringify(result)); return;
  }
  if (args.length !== 0 && !(args.length === 2 && args[0] === '--baseline')) throw Error('Uso: node benchmark.mjs [--baseline ruta/validate.mjs]');
  const variants = args.length ? [['anterior', pathToFileURL(args[1]).href], ['ajustado', new URL('validate.mjs', import.meta.url).href]] : [['ajustado', new URL('validate.mjs', import.meta.url).href]];
  const results = [];
  for (const size of VOLUME_SIZES) for (const [validator, moduleUrl] of variants) {
    const run = spawnSync(process.execPath, ['--expose-gc', '--max-old-space-size=256', fileURLToPath(import.meta.url), '--sample', String(size), moduleUrl], {
      encoding: 'utf8', timeout: 45000, maxBuffer: 1048576, windowsHide: true
    });
    if (run.error || run.status !== 0) throw Error('La medición se detuvo sin insistir: ' + (run.error?.code ?? run.stderr));
    results.push({ validator, ...JSON.parse(run.stdout) });
  }
  for (const size of VOLUME_SIZES) {
    const pair = results.filter(row => row.gamesPerKind === size);
    if (pair.length === 2 && (pair[0].inputSha256 !== pair[1].inputSha256 || JSON.stringify(pair[0].summary) !== JSON.stringify(pair[1].summary))) throw Error('La comparación no usa el mismo contenido o resultado.');
  }
  process.stdout.write(JSON.stringify({ node: process.version, platform: process.platform, arch: process.arch, repetitions: 3, warmups: 1,
    method: 'Procesos seriales por caso/variante; GC antes de cada muestra; tiempo del validador completo. heap antes/después no es pico. maxRSS del proceso incluye preparación y calentamiento.',
    safety: '25/75/225 partidos de cada clase; sin concurrencia ni servidores; old-space limitado a 256 MiB y guardia de ejecución de 45 s, sin umbrales de aprobación de rendimiento.', results }, null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
