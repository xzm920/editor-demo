export class SelectionView {
  constructor(views, parent) {
    this.type = 'selection';
    this.views = views;
    this.parent = parent;
    const objects = views.map((v) => v.getMainObject());
    this.mainObject = new fabric.ActiveSelection(objects, {
      canvas: parent.canvas,
      hasControls: false,
      lockMovementY: true,
      lockMovementX: true,
      strokeWidth: 0,
      borderScaleFactor: 2,
      borderColor: '#8F7EF4',
      borderOpacityWhenMoving: 1,
      cornerColor: '#FFFFFF',
      cornerStrokeColor: '#8F7EF4',
    });
    this.mainObject.__view = this;

    const bounds = this._getBounds();
    this.state = {
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
      angle: 0,
    };
  }

  getViews() {
    return this.views;
  }

  getMainObject() {
    return this.mainObject;
  }

  _getBounds() {
    const left = Math.min(...this.views.map(v => v.state.left));
    const top = Math.min(...this.views.map(v => v.state.top));
    const right = Math.max(...this.views.map(v => v.state.left + v.state.width));
    const bottom = Math.max(...this.views.map(v => v.state.top + v.state.height));
    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  }

  setState(state) {
    const deltaX = state.left - this.state.left;
    const deltaY = state.top - this.state.top;
    this.state = {
      ...this.state,
      left: state.left,
      top: state.top,
    };
    this.mainObject.set({ left: state.left, top: state.top });
    this.mainObject.setCoords();

    this.views.forEach((v) => {
      v.setState({
        left: v.state.left + deltaX,
        top: v.state.top + deltaY,
      });
    });

    this.parent.requestResetSelection();
  }

  setViewOptions() {}

  dispose() {}
}
