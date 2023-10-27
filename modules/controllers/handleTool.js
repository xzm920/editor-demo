import { isCtrlOrCommandKey } from '../utils/map.js';

export class HandTool {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.setDefaultCursor('grab');
    this.view.setHoverCursor('grab');
    this._unlisten = this._listen();
  }

  dispose() {
    this.view.setDefaultCursor('default');
    this.view.setHoverCursor('default');
    this._unlisten();
  }

  _listen() {
    let panning = false;
    this.view.onMouseDown = () => {
      panning = true;
    };
    this.view.onMouseMove = (e) => {
      if (panning && !isCtrlOrCommandKey(e.e)) {
        const offset = { left: e.e.movementX, top: e.e.movementY };
        this.view.relativePan(offset);
        this.view.render();
      }
    };
    this.view.onMouseUp = () => {
      panning = false;
    };
    return () => {
      this.view.onMouseDown = null;
      this.view.onMouseMove = null;
      this.view.onMouseUp = null;
    };
  }
}
