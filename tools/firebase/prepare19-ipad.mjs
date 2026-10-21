// Mismo origen y marcadores de las dos copias anteriores; datos conservados.
import { prepare17 } from './prepare17-ipad.mjs';
export const prepare19 = () => prepare17({ outputRoot: '.test-artifacts/firebase/fase19/candidate', buildPrefix: '19', compatibleBuildIds: ['17-ff347879fc8976cc', '18-eda58c0c0461ab73'] });
if (process.argv[1]?.endsWith('prepare19-ipad.mjs')) {
  const result = await prepare19(); console.log(JSON.stringify({ buildId: result.manifest.buildId, files: result.manifest.files.length, output: result.output, deployed: false }, null, 2));
}
