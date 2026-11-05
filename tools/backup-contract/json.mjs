// Prototipo independiente: solo JSON en memoria y SHA-256 nativo de Node.
import { createHash } from 'node:crypto';
import { types } from 'node:util';

export class ContractError extends Error {
  constructor(code, path, message, status = 'invalid') {
    super(message); Object.assign(this, { code, path, status });
  }
}
export function fail(code, path, message, status) { throw new ContractError(code, path, message, status); }
export const LIMITS = Object.freeze({ bytes: 8 * 1024 * 1024, depth: 64, nodes: 200000, string: 262144 });
const forbidden = new Set(['__proto__', 'prototype', 'constructor', 'toJSON']);
function unicode(value, path) {
  if (!value.isWellFormed()) fail('UNICODE', path, 'Unicode contiene un sustituto aislado.');
}

// Descenso recursivo: descubre claves duplicadas (también escapadas) antes
// de construir cada objeto. JSON.parse solo decodifica un literal string.
export function parseStrict(text, { profile = 'contract' } = {}) {
  if (typeof text !== 'string') fail('INPUT_TYPE', '$', 'Se requiere texto JSON sin parsear.');
  if (!['contract', 'jcs'].includes(profile)) fail('PROFILE', '$', 'Perfil numérico desconocido.');
  if (Buffer.byteLength(text, 'utf8') > LIMITS.bytes) fail('LIMIT_BYTES', '$', 'Texto demasiado grande para el prototipo.');
  let offset = 0, nodes = 0;
  const ws = () => { while (/[\x20\t\r\n]/.test(text[offset] ?? '\0')) offset++; };
  const syntax = path => fail('JSON_SYNTAX', path, `Sintaxis JSON inválida en posición ${offset}.`);
  function string(path) {
    const start = offset++;
    let closed = false;
    while (offset < text.length) {
      const char = text[offset++];
      if (char === '"') { closed = true; break; }
      if (char === '\\') offset++;
    }
    if (!closed) syntax(path);
    let value;
    try { value = JSON.parse(text.slice(start, offset)); } catch { syntax(path); }
    unicode(value, path);
    if (value.length > LIMITS.string) fail('LIMIT_STRING', path, 'Texto individual demasiado largo.');
    return value;
  }
  function value(path, depth) {
    if (depth > LIMITS.depth) fail('LIMIT_DEPTH', path, 'Profundidad excesiva.');
    if (++nodes > LIMITS.nodes) fail('LIMIT_NODES', path, 'Demasiados valores JSON.');
    ws(); const char = text[offset];
    if (char === '"') return string(path);
    if (char === '{') {
      offset++; ws(); const object = Object.create(null), keys = new Set();
      if (text[offset] === '}') { offset++; return object; }
      for (;;) {
        if (text[offset] !== '"') syntax(path);
        const key = string(path);
        if (keys.has(key)) fail('DUPLICATE_KEY', path, 'Clave JSON repetida.');
        if (profile === 'contract' && forbidden.has(key)) fail('FORBIDDEN_KEY', path, 'Clave peligrosa prohibida.');
        keys.add(key); ws(); if (text[offset++] !== ':') syntax(path);
        object[key] = value(`${path}.${key}`, depth + 1); ws();
        if (text[offset] === '}') { offset++; return object; }
        if (text[offset++] !== ',') syntax(path); ws();
      }
    }
    if (char === '[') {
      offset++; ws(); const array = [];
      if (text[offset] === ']') { offset++; return array; }
      for (;;) {
        array.push(value(`${path}[${array.length}]`, depth + 1)); ws();
        if (text[offset] === ']') { offset++; return array; }
        if (text[offset++] !== ',') syntax(path); ws();
      }
    }
    for (const [literal, result] of [['true', true], ['false', false], ['null', null]]) {
      if (text.startsWith(literal, offset)) { offset += literal.length; return result; }
    }
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(offset));
    if (!match) syntax(path);
    const token = match[0]; offset += token.length;
    const number = Number(token);
    if (!Number.isFinite(number)) fail('NUMBER_RANGE', path, 'Número no finito.');
    if (profile === 'contract' && (!/^(?:0|[1-9]\d*)$/.test(token) || !Number.isSafeInteger(number))) {
      fail('NUMBER_PROFILE', path, 'JSON 1.0 solo admite enteros seguros no negativos con notación decimal simple.');
    }
    return number;
  }
  const result = value('$', 0); ws(); if (offset !== text.length) syntax('$');
  return result;
}

// RFC 8785: primitivas ECMAScript, orden UTF-16 y emisión manual de objetos.
// Emitir mediante JSON.stringify(objetoOrdenado) alteraría las claves numéricas.
export function canonicalize(input) {
  const active = new Set(); let nodes = 0;
  function visit(value, path, depth) {
    if (++nodes > LIMITS.nodes || depth > LIMITS.depth) fail('JCS_LIMIT', path, 'Límite de canonicalización.');
    if (value === null || typeof value === 'boolean') return JSON.stringify(value);
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) fail('JCS_NUMBER', path, 'JCS rechaza NaN e infinitos.');
      return JSON.stringify(value);
    }
    if (typeof value === 'string') { unicode(value, path); return JSON.stringify(value); }
    if (typeof value !== 'object' || types.isProxy(value)) fail('JCS_TYPE', path, 'JCS requiere datos JSON simples.');
    if (active.has(value)) fail('JCS_CYCLE', path, 'JSON no admite ciclos.');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
    if (!(proto === null || proto === Object.prototype || (array && proto === Array.prototype))) fail('JCS_TYPE', path, 'Objeto ajeno a JSON.');
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length) fail('JCS_TYPE', path, 'Símbolos ajenos a JSON.');
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (array && key === 'length') continue;
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail('JCS_TYPE', path, 'No se ejecutan getters ni propiedades ocultas.');
      unicode(key, path);
    }
    active.add(value);
    let result;
    if (array) {
      if (Object.keys(value).length !== value.length) fail('JCS_TYPE', path, 'Array disperso o con propiedades adicionales.');
      const items = [];
      for (let i = 0; i < value.length; i++) {
        if (!Object.hasOwn(descriptors, String(i))) fail('JCS_TYPE', path, 'Array disperso.');
        items.push(visit(descriptors[i].value, `${path}[${i}]`, depth + 1));
      }
      result = '[' + items.join(',') + ']';
    } else {
      result = '{' + Object.keys(descriptors).sort().map(key => JSON.stringify(key) + ':' + visit(descriptors[key].value, `${path}.${key}`, depth + 1)).join(',') + '}';
    }
    active.delete(value); return result;
  }
  return visit(input, '$', 0);
}
export const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
export const fingerprint = value => sha256(canonicalize(value));
export const canonicalBytes = value => Buffer.byteLength(canonicalize(value), 'utf8');
