import type { PlatformAdapter } from '../services/platform/PlatformAdapter';
import { createPlatformAdapter } from '../services/platform/createPlatformAdapter';

let adapter: PlatformAdapter | null = null;

export function initPlatformAdapter(): PlatformAdapter {
  adapter = createPlatformAdapter();
  return adapter;
}

export function getPlatformAdapter(): PlatformAdapter {
  if (!adapter) throw new Error('Platform adapter has not been initialized yet');
  return adapter;
}
