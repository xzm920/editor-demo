// config
export const imageOptions = {
  lockMovementX: true,
  lockMovementY: true,
  hasControls: false,
  strokeWidth: 0,
  borderScaleFactor: 2,
  borderColor: '#8F7EF4',
  borderOpacityWhenMoving: 1,
};

export const impassableOptions = {
  ...imageOptions,
  src: 'https://dev-oss.vland.live/material/system/65433e2848c544d1ab0c43a51043f095_1649646689.png',
  zIndex: 9,
  opacity: 0.5,
  evented: false,
  selectable: false,
};
