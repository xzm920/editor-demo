import { LayerMask } from '../constants/map.js';

export class MaskView {
  constructor() {
    this.parent = null;

    this.state = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      visible: false,
    };

    this.mainObject = new fabric.Rect({
      selectable: false,
      evented: false,
      fill: '#282C4A',
      opacity: 0.3,
      zIndex: LayerMask,
    });
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject];
  }

  update() {
    const { invertTransform, qrDecompose } = fabric.util;
    const vpt = this.parent.canvas.viewportTransform;
    const invertedVpt = invertTransform(vpt);
    const { scaleX, scaleY, translateX, translateY } = qrDecompose(invertedVpt);
    const state = {
      left: translateX,
      top: translateY,
      width: this.parent.canvasWidth * scaleX,
      height: this.parent.canvasHeight * scaleY,
    };
    this.setState(state);
  }

  setState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.mainObject.set(this.state);
  }

  setViewOptions(viewOptions) {
    const state = {
      visible: viewOptions.showMask,
    };
    this.setState(state);
  }

  dispose() {}
}
