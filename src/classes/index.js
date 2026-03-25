import { saas } from './saas.js';

export const CLASSES = {
  saas,
};

export function getClass(id) {
  return CLASSES[id] ?? null;
}
