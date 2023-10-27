import { MAX_ZOOM, MIN_ZOOM, TILE_SIZE } from '../constants/map.js'
import { EventBus } from '../utils/eventBus.js';
import { BgColorView } from './bgColorView.js';
import { GridView } from './gridView.js';
import { MaskView } from './maskView.js';
import { SelectionView } from './selectionView.js';

export class View extends EventBus {
  constructor(options, presenter) {
    super();
    const {
      id,
      width,
      height,
      canvasWidth,
      canvasHeight,
    } = options;
    this.width = width;
    this.height = height;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.presenter = presenter;

    this.canvas = new fabric.Canvas(id, {
      width: canvasWidth,
      height: canvasHeight,
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
      showMask: false,
    };

    this.bgColorView = new BgColorView(width, height);
    this.bgColorView.parent = this;
    this.gridView = new GridView(width, height);
    this.gridView.parent = this;
    this.maskView = new MaskView();
    this.maskView.parent = this;
    this.maskView.update();
    this.toolViews = new Set();
    this.views = new Set();
    this.selection = null;

    this.onMouseDown = null;
    this.onMouseMove = null;
    this.onMouseUp = null;
    this.onMouseWheel = null;

    this._unlisten = this._listen();

    this.panRestricted = true;
    this.canvasPadding = 100;
    this.zoom = 1;
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
    const handleMouseWheel = (e) => {
      if (this.onMouseWheel) {
        this.onMouseWheel(e);
      }
    };
    this.canvas.on('mouse:down', handleMouseDown);
    this.canvas.on('mouse:move', handleMouseMove);
    this.canvas.on('mouse:up', handleMouseUp);
    this.canvas.on('mouse:wheel', handleMouseWheel);
    return () => {
      this.canvas.off('mouse:down', handleMouseDown);
      this.canvas.off('mouse:move', handleMouseMove);
      this.canvas.off('mouse:up', handleMouseUp);
      this.canvas.off('mouse:wheel', handleMouseWheel);
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

  addToolView(view) {
    view.parent = this;
    this.toolViews.add(view);
  }

  removeToolView(view) {
    view.parent = null;
    view.dispose();
    this.toolViews.delete(view);
  }

  reset(width, height, itemViews) {
    this.width = width;
    this.height = height;
    this.bgColorView = new BgColorView(width, height);
    this.gridView = new GridView(width, height);
    this.views = new Set(itemViews);
    this.views.forEach((v) => {
      v.parent = this;
      v.setViewOptions(this.viewOptions);
    });
  }

  add(itemView) {
    itemView.parent = this;
    itemView.setViewOptions(this.viewOptions);
    this.views.add(itemView);
  }

  remove(itemView) {
    itemView.parent = null;
    itemView.dispose();
    this.views.delete(itemView);
  }

  toggleTileEffect() {
    this.setViewOptions({
      showTileEffect: !this.viewOptions.showTileEffect,
    });
  }

  toggleMask() {
    this.setViewOptions({
      showMask: !this.viewOptions.showMask,
    });
  }

  setViewOptions(viewOptions) {
    this.viewOptions = {
      ...this.viewOptions,
      ...viewOptions,
    };
    const views = [...this.views, this.maskView];
    views.forEach((itemView) => {
      itemView.setViewOptions(this.viewOptions);
    });
  }

  getSortedItemViews() {
    return [...this.views].sort((a, b) => {
      if (a.zIndex < b.zIndex) return -1;
      if (a.zIndex > b.zIndex) return 1;
      return 0;
    });
  }

  render() {
    const views = [
      this.bgColorView,
      this.gridView,
      this.maskView,
      ...this.toolViews,
      ...this.views,
    ];
    const objects = views.map((v) => v.getObjects()).flat().sort((a, b) => {
      if (a.zIndex < b.zIndex) return -1;
      if (a.zIndex > b.zIndex) return 1;
      return 0;
    });
    this.canvas._objects = objects;
    objects.forEach((o) => {
      o.canvas = this.canvas;
      o.setCoords();
    });
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
    this.emit('selection:change', { views });
  }

  clearSelection() {
    const oldSelection = this.selection;
    this.selection = null;
    this.canvas.discardActiveObject();
    if (oldSelection !== null) {
      this.emit('selection:change', { views: [] });
    }
  }

  findTarget(e, skipGroup) {
    const object = this.canvas.findTarget(e.e, skipGroup);

    if (!object) {
      return null;
    }
    return object.__view;
  }

  getViewById(id) {
    return [...this.views].find((v) => v.id === id) ?? null;
  }

  requestResetSelection() {
    if (this._isResetSelectionScheduled) return;
    this._isResetSelectionScheduled = true;
    Promise.resolve().then(() => {
      this._resetSelection();
      this._isResetSelectionScheduled = false;
    });
  }

  _resetSelection() {
    const itemViews = this.getSelectedViews()
      .filter((v) => this.views.has(v));
    this.clearSelection();
    itemViews.forEach((v) => {
      v.setState(v.state);
    });
    this.setSelection(itemViews);
  }

  zoomToPoint(pos, zoom) {
    this.zoom = zoom;
    this.canvas.zoomToPoint({ x: pos.left, y: pos.top }, zoom);
    if (this.panRestricted) {
      this._restrictMapPan();
    }
    this._restartCursorImmediately();
    this.emit('zoom:change', { zoom });
    this.maskView.update();
  }

  zoomToFit() {
    const scaleX = this.canvasWidth / (this.width * TILE_SIZE);
    const scaleY = this.canvasHeight / (this.height * TILE_SIZE);
    const scale = Math.min(scaleX, scaleY);
    const translateX = (this.canvasWidth - this.width * TILE_SIZE * scale) / 2;
    const translateY = (this.canvasHeight - this.height * TILE_SIZE * scale) / 2;
    const vpt = [scale, 0, 0, scale, translateX, translateY];
    this.canvas.setViewportTransform(vpt);
    this._restartCursorImmediately();
    this.zoom = scale;
    this.emit('zoom:change', { zoom: scale });
    this.maskView.update();
  }

  zoomToCenter(zoom) {
    if (zoom === this.zoom) return;

    let newZoom = zoom;
    if (zoom < MIN_ZOOM) {
      newZoom = MIN_ZOOM;
    } else if (zoom > MAX_ZOOM) {
      newZoom = MAX_ZOOM;
    }
    this.zoom = newZoom;

    const { left, top } = this.canvas.getCenter();
    this.zoomToPoint({ left, top }, newZoom);
    this._restartCursorImmediately();
    this.maskView.update();
  }

  relativePan(offset) {
    this.canvas.relativePan({ x: offset.left, y: offset.top });
    if (this.panRestricted) {
      this._restrictMapPan();
    }
    this._restartCursorImmediately();
    this.maskView.update();
  }

  _restrictMapPan() {
    const mapWidth = this.width * TILE_SIZE * this.canvas.getZoom();
    const mapHeight = this.height * TILE_SIZE * this.canvas.getZoom();
    const vpt = [...this.canvas.viewportTransform];

    let translateX = vpt[4];
    const lockedX = (this.canvasWidth - mapWidth) / 2 > this.canvasPadding;
    const leftInvalid = translateX > this.canvasPadding;
    const rightInvalid = (this.canvasWidth - translateX - mapWidth) > this.canvasPadding;
    if (lockedX) {
      translateX = (this.canvasWidth - mapWidth) / 2;
    } else if (leftInvalid) {
      translateX = this.canvasPadding;
    } else if (rightInvalid) {
      translateX = this.canvasWidth - mapWidth - this.canvasPadding;
    }
    vpt[4] = translateX;

    let translateY = vpt[5];
    const lockedY = (this.canvasHeight - mapHeight) / 2 > this.canvasPadding;
    const topInvalid = translateY > this.canvasPadding;
    const bottomInvalid = (this.canvasHeight - translateY - mapHeight) > this.canvasPadding;
    if (lockedY) {
      translateY = (this.canvasHeight - mapHeight) / 2;
    } else if (topInvalid) {
      translateY = this.canvasPadding;
    } else if (bottomInvalid) {
      translateY = this.canvasHeight - mapHeight - this.canvasPadding;
    }
    vpt[5] = translateY;

    if (vpt[4] !== this.canvas.viewportTransform[4] || vpt[5] !== this.canvas.viewportTransform[5]) {
      this.canvas.setViewportTransform(vpt);
    }
  }

  _restartCursorImmediately() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox' && activeObject.isEditing) {
      activeObject.initDelayedCursor(true);
    }
  }

  setDefaultCursor(cursor) {
    this.canvas.defaultCursor = cursor;
  }

  setHoverCursor(cursor) {
    this.canvas.hoverCursor = cursor;
  }
}
