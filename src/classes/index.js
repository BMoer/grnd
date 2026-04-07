import { saas } from './saas.js';
import { consumer } from './consumer.js';
import { deeptech } from './deeptech.js';

export const CLASSES = {
  saas,
  consumer,
  deeptech,
};

export function getClass(id) {
  return CLASSES[id] ?? null;
}
