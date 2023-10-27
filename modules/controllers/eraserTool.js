import { snapToGrid } from '../utils/map.js';
import { EraserView } from '../views/eraserView.js';
import { TiledObjectView } from '../views/tiledObjectView.js';

export class EraserTool {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    let panning = false;
    let lastPos = null;
    let eraserView = new EraserView();

    const remove = () => {
      const views = this.view.getSortedItemViews().reverse();
      for (const view of views) {
        if (view.intersectsWith(eraserView)) {
          const m = this.model.getModelById(view.id);
          this.model.remove(m);
          return;
        }
      }
    }

    this.view.addToolView(eraserView);

    this.view.onMouseDown = () => {
      panning = true;
      remove();
    };
    this.view.onMouseMove = (e) => {
      const { x, y } = e.pos;
      const pos = { left: snapToGrid(x), top: snapToGrid(y) };
      if (lastPos && lastPos.left === pos.left && lastPos.top === pos.top) return;
      lastPos = pos;
      eraserView.setState(pos);
      this.view.render();

      if (panning) {
        remove();
      }
    };
    this.view.onMouseUp = () => {
      panning = false;
    };
    return () => {
      this.view.removeToolView(eraserView);
      eraserView = null;
      this.view.onMouseDown = null;
      this.view.onMouseMove = null;
      this.view.onMouseUp = null;
    };
  }
}
