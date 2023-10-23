import { EventBus } from '../utils/eventBus.js';
import { SelectionView } from './selectionView.js';

export class View extends EventBus {
  constructor(id, presenter) {
    super();

    this.presenter = presenter;

    this.canvas = new fabric.Canvas(id, {
      width: 800,
      height: 800,
      stopContextMenu: true,
      preserveObjectStacking: true,
      renderOnAddRemove: false,
      hoverCursor: 'default',
      backgroundColor: '#F1F4F7',
      selectionKey: undefined,
      selection: false,
      selectionColor: 'rgba(143, 126, 244, 0.3)',
      selectionBorderColor: '#8F7EF4',
      selectionLineWidth: 2,
    });

    this.viewOptions = {
      showTileEffect: true,
    };

    this.views = new Set();
    this.selection = null;

    this.onMouseDown = null;
    this.onMouseMove = null;
    this.onMouseUp = null;

    this._unlisten = this._listen();
  }

  _listen() {
    const handleMouseDown = (e) => {
      if (this.onMouseDown) {
        this.onMouseDown({
          ...e,
          pos: e.absolutePointer,
        });
      }
    };
    const handleMouseMove = (e) => {
      if (this.onMouseMove) {
        this.onMouseMove({
          ...e,
          pos: e.absolutePointer,
        });
      }
    };
    const handleMouseUp = (e) => {
      if (this.onMouseUp) {
        this.onMouseUp({
          ...e,
          pos: e.absolutePointer,
        });
      }
    };
    this.canvas.on('mouse:down', handleMouseDown);
    this.canvas.on('mouse:move', handleMouseMove);
    this.canvas.on('mouse:up', handleMouseUp);
    return () => {
      this.canvas.off('mouse:down', handleMouseDown);
      this.canvas.off('mouse:move', handleMouseMove);
      this.canvas.off('mouse:up', handleMouseUp);
    };
  }

  dispose() {
    this.presenter.dispose();
    this.presenter = null;

    this._unlisten();
    this.canvas.dispose();
  }

  getViewById(id) {
    return [...this.views].find((v) => v.id === id) ?? null;
  }

  add(itemView) {
    this.canvas.add(...itemView.getObjects());

    itemView.parent = this;
    itemView.setViewOptions(this.viewOptions);
    this.views.add(itemView);
  }

  remove(itemView) {
    this.canvas.remove(...itemView.getObjects());

    itemView.parent = null;
    itemView.dispose();

    this.views.delete(itemView);
  }

  toggleTileEffect() {
    this.setViewOptions({
      showTileEffect: !this.viewOptions.showTileEffect,
    });
  }

  setViewOptions(viewOptions) {
    this.viewOptions = {
      ...this.viewOptions,
      ...viewOptions,
    };
    this.views.forEach((itemView) => {
      itemView.setViewOptions(this.viewOptions);
    });
  }

  render() {
    this.canvas.requestRenderAll();
  }

  getSelectedViews() {
    if (this.selection === null) return [];
    if (this.selection.type === 'selection') {
      return this.selection.getViews();
    }
    return [this.selection];
  }

  setSelection(views) {
    this.selection = null;
    this.canvas.discardActiveObject();

    if (views.length === 1) {
      this.selection = views[0];
      this.canvas.setActiveObject(this.selection.getMainObject());
    } else if (views.length > 1) {
      this.selection = new SelectionView(views, this);
      this.canvas.setActiveObject(this.selection.getMainObject());
    }
  }

  clearSelection() {
    this.selection = null;
    this.canvas.discardActiveObject();
  }

  findTarget(e, skipGroup) {
    const object = this.canvas.findTarget(e.e, skipGroup);
    // console.log('findTarget', object, e);
    if (!object) return null;
    return object.__view;
  }

  findViewById(id) {
    return [...this.views].find((v) => v.id === id) ?? null;
  }
}
