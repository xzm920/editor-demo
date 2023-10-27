import { TILE_SIZE } from '../constants/map.js';
import { RotatedRect } from '../utils/geometry.js';
import { snapToGrid } from '../utils/map.js';

export class SelectTool {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this._unlisten = this._listen();
    this._unlistenKeys = this._listenKeys();
  }

  dispose() {
    this._unlisten();
    this._unlistenKeys();
  }

  _listen() {
    let isDown = false;
    let downPoint = null;
    let startPos = null;
    let isClick = true;
    let target = null;
    let subTarget = null;
    let lastDeltaX = null;
    let lastDeltaY = null;

    const calcMovement = (startPoint, endPoint) => {
      let deltaX;
      let deltaY;
      const byTile = this._shouldMoveSelectionByTile();
      if (byTile) {
        deltaX = snapToGrid(endPoint.x) - snapToGrid(startPoint.x);
        deltaY = snapToGrid(endPoint.y) - snapToGrid(startPoint.y);
      } else {
        deltaX = endPoint.x - startPoint.x;
        deltaY = endPoint.y - startPoint.y;
      }

      // 修正movement
      const left = startPos.left + deltaX;
      const top = startPos.top + deltaY;
      const { width, height, scaleX = 1, scaleY = 1, angle = 0 } = this.view.selection.state;
      const rotatedRect = new RotatedRect(left, top, width * scaleX, height * scaleY, angle);
      const bbox = rotatedRect.getBoundingRect();
      const bounds = this.model.getBounds();
      const offsetLeft = bbox.left - bounds.left;
      if (offsetLeft < 0) {
        deltaX += byTile ? -(Math.floor(offsetLeft / TILE_SIZE) * TILE_SIZE) : -offsetLeft;
      }
      const offsetRight = bbox.right - bounds.right;
      if (offsetRight > 0) {
        deltaX += byTile ? -(Math.ceil(offsetRight / TILE_SIZE) * TILE_SIZE) : -offsetRight;
      }
      const offsetTop = bbox.top - bounds.top;
      if (offsetTop < 0) {
        deltaY += byTile ? -(Math.floor(offsetTop / TILE_SIZE) * TILE_SIZE) : -offsetTop;
      }
      const offsetBottom = bbox.bottom - bounds.bottom;
      if (offsetBottom > 0) {
        deltaY += byTile ? -(Math.ceil(offsetBottom / TILE_SIZE) * TILE_SIZE) : -offsetBottom;
      }

      return { deltaX, deltaY };
    }

    const handleMouseDown = (e) => {
      // FIXME: 抽象泄漏
      if (e.transform && e.transform.action !== 'drag') return;
      isClick = true;
      isDown = true;
      downPoint = e.pos;
      target = this.view.findTarget(e);

      if (target) {
        subTarget = this.view.findTarget(e, true);
      }

      if (!target) {
        if (!e.e.shiftKey) {
          this.view.clearSelection();
          this.view.render();
        }
        return;
      }

      if (this.view.selection !== target) {
        let views = this.view.getSelectedViews();
        if (e.e.shiftKey) {
          if (views.includes(target)) {
            views = views.filter(v => v !== target);
          } else {
            views = [...views, target];
          }
        } else {
          views = [target];
        }
        this.view.setSelection(views);
        this.view.render();
      }

      if (this.view.selection) {
        const { state } = this.view.selection;
        startPos = { left: state.left, top: state.top };
      }
    };

    const handleMouseMove = (e) => {
      isClick = false;
      if (isDown && this.view.selection) {
        // FIXME:
        this.view.selection.isMoving = true;

        const movePoint = e.pos;
        const { deltaX, deltaY } = calcMovement(downPoint, movePoint);
        if (lastDeltaX === deltaX && lastDeltaY === deltaY) return; // skip
        lastDeltaX = deltaX;
        lastDeltaY = deltaY;

        const left = startPos.left + deltaX;
        const top = startPos.top + deltaY;
        this.view.selection.setState({ left, top });
        this.view.render();
      }
    };

    const handleMouseUp = (e) => {
      if (isDown && this.view.selection) {
        // FIXME:
        this.view.selection.isMoving = false;

        if (isClick) {
          if (this.view.selection === target && target.type === 'selection') {
            if (subTarget) {
              let views = this.view.getSelectedViews();
              if (e.e.shiftKey) {
                if (views.includes(subTarget)) {
                  views = views.filter(v => v !== subTarget);
                } else {
                  views = [...views, subTarget];
                }
              } else {
                views = [subTarget];
              }
              this.view.setSelection(views);
              this.view.render();
            } else {
              this.view.clearSelection();
              this.view.render();
            }
          }
        } else {
          const upPoint = e.pos;
          const { deltaX, deltaY } = calcMovement(downPoint, upPoint);

          const left = startPos.left + deltaX;
          const top = startPos.top + deltaY;
          this.view.selection.setState({ left, top });
          this.view.render();

          const views = this.view.getSelectedViews();
          const models = views.map((v) => this.model.getModelById(v.id));
          models.forEach((m) => {
            m.moveTo(m.left + deltaX, m.top + deltaY);
          });
        }
      }

      isDown = false;
      downPoint = null;
      startPos = null;
      isClick = true;
      target = null;
      subTarget = null;
      lastDeltaX = null;
      lastDeltaY = null;
    };

    this.view.onMouseDown = handleMouseDown;
    this.view.onMouseMove = handleMouseMove;
    this.view.onMouseUp = handleMouseUp;
    return () => {
      this.view.onMouseDown = null;
      this.view.onMouseMove = null;
      this.view.onMouseUp = null;
    };
  }

  _listenKeys() {
    const handleDelete = (event, handler) => {
      const views = this.view.getSelectedViews();
      if (views.length > 0) {
        const models = views.map((v) => this.model.getModelById(v.id));
        models.forEach((m) => {
          this.model.remove(m);
        });
      }
    };
    hotkeys('backspace, del', handleDelete);
    return () => {
      hotkeys.unbind('backspace, del', handleDelete);
    };
  }

  _shouldMoveSelectionByTile() {
    const views = this.view.getSelectedViews();
    return views.some((v) => {
      const m = this.model.getModelById(v.id);
      return m.shouldMoveByTile();
    });
  }
}
