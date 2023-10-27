import { LayerTool, TILE_SIZE } from '../constants/map.js';

const delta = 0.01;

export class EraserView {
  constructor() {
    this.state = {
      left: 0,
      top: 0,
    };
    this.mainObject = new fabric.Rect({
      left: 0 + delta,
      top: 0 + delta,
      width: TILE_SIZE - delta * 2,
      height: TILE_SIZE - delta * 2,
      fill: '#000',
      opacity: 0.4,
      strokeWidth: 0,
      selectable: false,
      hasControls: false,
      evented: false,
      zIndex: LayerTool,
    });
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject];
  }

  setState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.mainObject.set({
      left: this.state.left + delta,
      top: this.state.top + delta,
    });
  }

  setViewOptions() {}

  dispose() {}
}
