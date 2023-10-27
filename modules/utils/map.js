import { isMac } from '../constants/env.js';
import { TILE_SIZE } from '../constants/map.js';

export const snapToGrid = (coord) => {
  return Math.floor(coord / TILE_SIZE) * TILE_SIZE;
}

export function isCtrlOrCommandKey(e) {
  return isMac ? e.metaKey : e.ctrlKey;
}
