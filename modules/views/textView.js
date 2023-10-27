import { DEFAULT_COLOR, DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT } from '../constants/map.js';
import { RotatedRect } from '../utils/geometry.js';
import { textControls } from './fabricControls.js';
import { textOptions } from './fabricConfig.js';
import { MapItemView } from './mapItemView.js';

export class TextView extends MapItemView {
  constructor(id, presenter) {
    super();

    this.id = id;
    this.presenter = presenter;
    this.parent = null;

    this.state = {
      zIndex: 0,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      angle: 0,
      opacity: 1,
      text: '',
      fontSize: DEFAULT_FONT_SIZE,
      fill: DEFAULT_COLOR,
      fontStyle: 'normal',
      fontWeight: 400,
      underline: false,
      textAlign: 'left',
      lineHeight: DEFAULT_LINE_HEIGHT,
    };

    this.mainObject = new VText({ padding: 6, hasControls: true });
    this.mainObject.__view = this;

    this._unlisten = this._listen();
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

    this.mainObject.set(this.state);
    this.mainObject.setCoords();
  }

  setViewOptions() {}

  dispose() {
    this._unlisten();
    this.presenter.dispose();
    this.presenter = null;
  }

  getBoundingRect() {
    const { left, top, width, height, angle } = this.state;
    const rotatedRect = new RotatedRect(left, top, width, height, angle);
    return rotatedRect.getBoundingRect();
  }

  _listen() {
    const handleUpBefore = (e) => {
      if (this.isMoving) {
        // HACK: 骗过fabric.js的代码
        if (e.transform === null) e.transform = {};
        e.transform.actionPerformed = true;
      }
    };
    this.mainObject.on('mouseup:before', handleUpBefore);
    return () => {
      this.mainObject.off('mouseup:before', handleUpBefore);
    };
  }
}

const VText = fabric.util.createClass(fabric.Textbox, {
  initialize: function (options = {}) {
    const { text, ...restOptions } = options;
    const newOptions = {
      ...textOptions,
      ...restOptions,
    };
    this.callSuper('initialize', text ?? '', newOptions);
    this.controls = textControls;
  },
});
