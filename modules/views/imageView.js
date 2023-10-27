import { RotatedRect } from '../utils/geometry.js';
import { imageOptions } from './fabricConfig.js';
import { imageControls } from './fabricControls.js';
import { VImage } from './fabricExtensions.js';
import { MapItemView } from './mapItemView.js';

export class ImageView extends MapItemView {
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
      scaleX: 1,
      scaleY: 1,
      flipX: false,
      flipY: false,
      angle: 0,
      opacity: 1,
    };

    const onLoad = () => { this.parent?.render(); };
    this.mainObject = new VImage(onLoad, { ...imageOptions, padding: 6, hasControls: true });
    // TODO:
    this.mainObject.controls = imageControls;
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
    this.mainObject.setCoords();
    if (newState.src && newState.src !== oldState.src) {
      this.mainObject.setSrc(newState.src);
    }
  }

  setViewOptions() {}

  dispose() {
    this.presenter.dispose();
    this.presenter = null;
  }

  getBoundingRect() {
    const { left, top, width, height, scaleX, scaleY, angle } = this.state;
    const rotatedRect = new RotatedRect(left, top, width * scaleX, height * scaleY, angle);
    return rotatedRect.getBoundingRect();
  }
}
