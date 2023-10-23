import './fabricExtensions.js';
import { imageOptions, impassableOptions } from './fabricConfig.js';

export class TiledObjectView {
  constructor(id, presenter) {
    this.id = id;
    this.presenter = presenter;
    this.parent = null;

    this.state = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: 0,
      src: '',
    };

    const onLoad = () => { this.parent?.render(); };
    this.mainObject = new fabric.VImage(onLoad, imageOptions);
    this.mainObject.__view = this;
    this.impassableObject = new fabric.VImage(onLoad, impassableOptions);
    this.controls = {};
    this.impassableObject.__view = this;
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject, this.impassableObject];
  }

  setState(state) {
    const oldSrc = this.state.src;
    this.state = {
      ...this.state,
      ...state,
    };
    this.mainObject.update(this.state);
    this.mainObject.setCoords();
    const newSrc = this.state.src;
    if (newSrc && newSrc !== oldSrc) {
      this.mainObject.setSrc(newSrc);
    }

    const impassableState = this._getImpassableState();
    this.impassableObject.update(impassableState);
    this.impassableObject.setCoords();
  }

  setViewOptions(viewOptions) {
    const impassableState = this._getImpassableState();
    this.impassableObject.update(impassableState);
  }

  dispose() {
    this.presenter.dispose();
    this.presenter = null;
  }

  _getImpassableState() {
    const viewOptions = this.parent?.viewOptions ?? {};
    return {
      left: this.state.left,
      top: this.state.top,
      width: this.state.width,
      height: this.state.height,
      visible: viewOptions.showTileEffect ? true : false,
    };
  }
}
