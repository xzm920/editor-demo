import { VImage, VImpassable } from './fabricExtensions.js';
import { imageOptions, impassableOptions } from './fabricConfig.js';
import { MapItemView } from './mapItemView.js';

export class TiledObjectView extends MapItemView {
  constructor(id, presenter) {
    super();
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
      isCollider: false,
    };

    this._onLoad = () => { this.parent?.render(); };
    this.mainObject = new VImage(this._onLoad, imageOptions);
    this.mainObject.__view = this;
    this.impassableObject = null;
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject, this.impassableObject].filter((o) => o !== null);
  }

  setState(state) {
    const oldState = this.state;
    const newState = {
      ...this.state,
      ...state,
    };
    this.state = newState;

    this.mainObject.set(newState);
    this.mainObject.setCoords();
    if (newState.src && newState.src !== oldState.src) {
      this.mainObject.setSrc(newState.src);
    }

    if (newState.isCollider && !oldState.isCollider) {
      this.impassableObject = new VImpassable(this._onLoad, impassableOptions);
      this.impassableObject.__view = this;
      const impassableState = this._getImpassableState();
      this.impassableObject.set(impassableState);
      this.impassableObject.setCoords();
    } else if (!newState.isCollider && oldState.isCollider) {
      this.impassableObject.__view = null;
      this.impassableObject = null;
    } else if (newState.isCollider && oldState.isCollider) {
      const impassableState = this._getImpassableState();
      this.impassableObject.set(impassableState);
      this.impassableObject.setCoords();
    }
  }

  setViewOptions(viewOptions) {
    if (this.impassableObject) {
      const impassableState = this._getImpassableState();
      this.impassableObject.set(impassableState);
    }
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
