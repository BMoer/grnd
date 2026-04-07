import { saas } from './saas.js';
import { consumer } from './consumer.js';
import { deeptech } from './deeptech.js';
import { marketplace } from './marketplace.js';
import { service } from './service.js';

export const CLASSES = {
  saas,
  consumer,
  deeptech,
  marketplace,
  service,
};

export function getClass(id) {
  return CLASSES[id] ?? null;
}
