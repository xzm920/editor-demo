import { LayerNotAllowed, TILE_SIZE } from '../constants/map.js';

export class NotAllowedView {
  constructor() {
    this.parent = null;

    this.state = {
      angle: 0,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

    const onLoad = () => { this.parent?.render(); };
    this.mainObject = new VNotAllowed(onLoad);
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
    this.mainObject.update(this.state);
  }

  setViewOptions() {}

  dispose() {}
}

const VNotAllowed = fabric.util.createClass(fabric.Group, {
  initialize: function(onLoad, options = {}) {
    const rect = new fabric.Rect({
      originX: 'center',
      originY: 'center',
      width: options.width ?? 0,
      height: options.height ?? 0,
      fill: 'rgba(227, 77, 89, 0.5)',
    });
    this.callSuper('initialize', [rect], {
      originX: 'left',
      originY: 'top',
      angle: options.angle ?? 0,
      left: options.left ?? 0,
      top: options.top ?? 0,
      width: options.width ?? 0,
      height: options.height ?? 0,
      strokeWidth: 0,
      selectable: false,
      hasControls: false,
      evented: false,
      zIndex: LayerNotAllowed,
    });
    const url = '/modules/assets/not-allowed@2x.png';
    fabric.util.loadImage(url, (imgElem, isError) => {
      if (isError) return;

      if (this.width >= 64 && this.height >= 64) {
        const image = new fabric.Image(imgElem, {
          originX: 'center',
          originY: 'center',
          width: 128,
          height: 128,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        this.add(image);
        onLoad && onLoad();
      }
    });
  },
  update: function(options) {
    this.set(options);
    if ('width' in options) {
      this.item(0).set('width', options.width);
    }
    if ('height' in options) {
      this.item(0).set('height', options.height);
    }
    this.setCoords();
    this.setObjectsCoords();
  },
});
