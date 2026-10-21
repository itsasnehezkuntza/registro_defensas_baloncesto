// Actualización correctiva del mismo origen; acepta su marcador anterior sin
// borrar ni reescribir los partidos ya guardados durante la prueba física.
import { prepare17 } from './prepare17-ipad.mjs';
export const prepare18 = () => prepare17({ outputRoot: '.test-artifacts/firebase/fase18/candidate', buildPrefix: '18', compatibleBuildIds: ['17-ff347879fc8976cc'] });
if (process.argv[1]?.endsWith('prepare18-ipad.mjs')) {
  const result = await prepare18(); console.log(JSON.stringify({ buildId: result.manifest.buildId, files: result.manifest.files.length, output: result.output, deployed: false }, null, 2));
}
