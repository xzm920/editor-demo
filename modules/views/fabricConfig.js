import { ImpassableUrl, Layer } from '../constants/map.js';

// config
const baseOptions = {
  lockMovementX: true,
  lockMovementY: true,
  hasControls: false,
  strokeWidth: 0,
  borderScaleFactor: 2,
  borderColor: '#8F7EF4',
  borderOpacityWhenMoving: 1,
  objectCaching: false,
  selectable: false,
};

export const imageOptions = {
  ...baseOptions,
};

export const textOptions = {
  ...baseOptions,
  fontFamily: 'PingFang SC, Microsoft YaHei, Noto Sans, sans-serif',
  splitByGrapheme: true,
  editingBorderColor: '#8F7EF4',
  cursorColor: '#282C4A',
};

export const impassableOptions = {
  ...imageOptions,
  zIndex: Layer.tileEffect,
  opacity: 0.5,
  evented: false,
  selectable: false,
  src: ImpassableUrl,
};
