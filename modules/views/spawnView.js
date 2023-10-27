import { MapItemView } from './mapItemView.js';
import { VImage } from './fabricExtensions.js';
import { imageOptions } from './fabricConfig.js';

export class SpawnView extends MapItemView {
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
    };

    this._onLoad = () => { this.parent?.render(); };
    this.mainObject = new VImage(this._onLoad, imageOptions);
    this.mainObject.__view = this;
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject];
  }

  setState(state) {
    const oldState = this.state;
    const newState = {
      ...this.state,
      ...state,
    };
    this.state = newState;
    this.mainObject.set(this.state);
    if (newState.src && newState.src !== oldState.src) {
      this.mainObject.setSrc(newState.src);
    }
  }

  setViewOptions() {}

  dispose() {
    this.presenter.dispose();
    this.presenter = null;
  }
}
