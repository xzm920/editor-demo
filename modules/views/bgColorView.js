import { LayerBgColor } from '../constants/map.js';

export class BgColorView {
  constructor(width, height) {
    this.mainObject = new fabric.Rect({
      left: 0,
      top: 0,
      width: 64 * width,
      height: 64 * height,
      fill: '#fff',
      selectable: false,
      evented: false,
      zIndex: LayerBgColor,
    });
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject];
  }

  setViewOptions() {}

  dispose() {}
}
