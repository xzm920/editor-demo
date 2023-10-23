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

    const handleMouseDown = (e) => {
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
        const movePoint = e.pos;
        const left = startPos.left + movePoint.x - downPoint.x;
        const top = startPos.top + movePoint.y - downPoint.y;
        this.view.selection.setState({ left, top });
        this.view.render();
      }
    };

    const handleMouseUp = (e) => {
      if (isDown && this.view.selection) {
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
          const deltaX = upPoint.x - downPoint.x;
          const deltaY = upPoint.y - downPoint.y;
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
}
