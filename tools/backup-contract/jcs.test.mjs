import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalize, parseStrict, sha256 } from './json.mjs';

// Fuente independiente: RFC 8785, apéndice B (bits IEEE-754 -> texto esperado).
// Números JCS generales; el contrato deportivo impone un perfil más restrictivo.
const numbers = [
  ['0000000000000000', '0'], ['8000000000000000', '0'],
  ['0000000000000001', '5e-324'], ['8000000000000001', '-5e-324'],
  ['7fefffffffffffff', '1.7976931348623157e+308'], ['ffefffffffffffff', '-1.7976931348623157e+308'],
  ['4340000000000000', '9007199254740992'], ['c340000000000000', '-9007199254740992'],
  ['4430000000000000', '295147905179352830000'],
  ['44b52d02c7e14af5', '9.999999999999997e+22'], ['44b52d02c7e14af6', '1e+23'], ['44b52d02c7e14af7', '1.0000000000000001e+23'],
  ['444b1ae4d6e2ef4e', '999999999999999700000'], ['444b1ae4d6e2ef4f', '999999999999999900000'], ['444b1ae4d6e2ef50', '1e+21'],
  ['3eb0c6f7a0b5ed8c', '9.999999999999997e-7'], ['3eb0c6f7a0b5ed8d', '0.000001'],
  ['41b3de4355555553', '333333333.3333332'], ['41b3de4355555554', '333333333.33333325'], ['41b3de4355555555', '333333333.3333333'],
  ['41b3de4355555556', '333333333.3333334'], ['41b3de4355555557', '333333333.33333343'],
  ['becbf647612f3696', '-0.0000033333333333333333'], ['43143ff3c1cb0959', '1424953923781206.2']
];
for (const [bits, expected] of numbers) test('RFC8785 B: ' + bits, () => {
  const value = Buffer.from(bits, 'hex').readDoubleBE();
  assert.equal(canonicalize(value), expected);
});
for (const bits of ['7fffffffffffffff', '7ff0000000000000', 'fff0000000000000']) test('JCS rechaza no finito ' + bits, () => {
  assert.throws(() => canonicalize(Buffer.from(bits, 'hex').readDoubleBE()), { code: 'JCS_NUMBER' });
});
test('RFC8785 3.2.3: orden UTF-16, incluso claves numéricas y no BMP', () => {
  const input = { '\u20ac': 'Euro Sign', '\r': 'Carriage Return', '\ufb33': 'Hebrew Letter Dalet With Dagesh',
    '1': 'One', '\ud83d\ude00': 'Emoji: Grinning Face', '\u0080': 'Control', '\u00f6': 'Latin Small Letter O With Diaeresis' };
  const output = canonicalize(input);
  assert.deepEqual(Object.values(JSON.parse(output)), ['One', 'Carriage Return', 'Control', 'Latin Small Letter O With Diaeresis', 'Euro Sign', 'Emoji: Grinning Face', 'Hebrew Letter Dalet With Dagesh']);
  // JSON.parse + Object.values vuelve a priorizar "1": comparar también texto directo.
  assert.ok(output.startsWith('{"\\r":"Carriage Return","1":"One",'));
  assert.ok(output.indexOf('Emoji:') < output.indexOf('Hebrew'));
});
test('RFC8785 3.2.4: bytes UTF-8 exactos de la muestra', () => {
  const input = { numbers: [333333333.33333329, 1E30, 4.50, 2e-3, 1e-27],
    string: "€$\u000F\nA'B\"\\\\\"/", literals: [null, true, false] };
  const expectedHex = '7b226c69746572616c73223a5b6e756c6c2c747275652c66616c73655d2c226e756d62657273223a5b3333333333333333332e333333333333332c31652b33302c342e352c302e3030322c31652d32375d2c22737472696e67223a22e282ac245c75303030665c6e4127425c225c5c5c5c5c222f227d';
  assert.equal(Buffer.from(canonicalize(input), 'utf8').toString('hex'), expectedHex);
});
test('JCS recursivo, arrays estables y claves enteras lexicográficas', () => {
  assert.equal(canonicalize({ 2: 'dos', 10: 'diez', array: [{ z: 1, a: 2 }, null, false] }), '{"10":"diez","2":"dos","array":[{"a":2,"z":1},null,false]}');
});
test('JCS no normaliza Unicode y trata controles con escapes minúsculos', () => {
  assert.notEqual(canonicalize('é'), canonicalize('e\u0301'));
  assert.equal(canonicalize('\u000f\b\t\n\f\r/'), '"\\u000f\\b\\t\\n\\f\\r/"');
});
test('JCS rechaza Unicode inválido, ciclos, objetos y valores no JSON', () => {
  for (const value of ['\ud800', { '\udfff': 1 }, undefined, 1n, () => {}, new Date(), [,], [undefined], new Proxy({}, {})]) assert.throws(() => canonicalize(value));
  const cycle = {}; cycle.self = cycle; assert.throws(() => canonicalize(cycle), { code: 'JCS_CYCLE' });
  const getter = {}; Object.defineProperty(getter, 'a', { enumerable: true, get() { throw Error('No se debe ejecutar'); } });
  assert.throws(() => canonicalize(getter), { code: 'JCS_TYPE' });
  assert.throws(() => canonicalize({ toJSON() { throw Error('No ejecutar'); } }), { code: 'JCS_TYPE' });
});
test('JCS permite claves de texto constructor sin ejecutar ni contaminar', () => {
  assert.equal(canonicalize(parseStrict('{"constructor":"texto","__proto__":null}', { profile: 'jcs' })), '{"__proto__":null,"constructor":"texto"}');
  assert.equal({}.polluted, undefined);
});
test('SHA-256: vectores conocidos de vacío y abc, independientes del sello', () => {
  assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
