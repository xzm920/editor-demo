class EventBus {
  constructor() {
    this.emitter = mitt();
  }

  on(type, handler) {
    this.emitter.on(type, handler);
  }

  off(type, handler) {
    this.emitter.off(type, handler);
  }

  clear() {
    this.emitter.all.clear();
  }

  emit(type, event) {
    this.emitter.emit(type, event);
  }
}

class Editor {
  constructor(id) {
    this.model = new Model();
    this.presenter = new Presenter(this.model);
    this.view = new View(id, this.presenter);
  }

  add(itemModel) {
    this.model.add(itemModel);
  }

  remove(itemModel) {
    this.model.remove(itemModel);
  }

  dispose() {
    this.view.dispose();
  }

  toggleTileEffect() {
    this.view.setViewOptions({
      showTileEffect: !this.view.viewOptions.showTileEffect,
    });
    this.view.render();
  }
}

// =============================================================================
class Presenter {
  constructor(model) {
    this.model = model;
    this.view = null;
    // FIXME:
    this._modelToView = new WeakMap();
    this._viewToModel = new WeakMap();
  }

  getModelByView(view) {
    return this._viewToModel.get(view);
  }

  getViewByModel(model) {
    return this._modelToView.get(model);
  }

  attachView(view) {
    this.view = view;
    this.controller = new SelectController(this, this.model, this.view);

    this.handleAdd = this.handleAdd.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.model.on('add', this.handleAdd);
    this.model.on('remove', this.handleRemove);
  }
  
  detachView() {
    this.controller.dispose();

    this.model.off('add', this.handleAdd);
    this.model.off('remove', this.handleRemove);

    this.view = null;
  }

  handleAdd(itemModel) {
    // FIXME:
    const presenter = new TiledObjectPresenter(itemModel);
    const itemView = new TiledObjectView(presenter);
    this.view.add(itemView);
    this.view.render();

    this._modelToView.set(itemModel, itemView);
    this._viewToModel.set(itemView, itemModel);
  }

  handleRemove(itemModel) {
    const itemView = this.getViewByModel(itemModel);
    this.view.remove(itemView);
    this.view.render();

    this._modelToView.delete(itemModel);
    this._viewToModel.delete(itemView);
  }
}

class SelectController {
  constructor(presenter, model, view) {
    this.presenter = presenter;
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

    const getViews = (selectionView) => {
      if (!selectionView) return [];
      return selectionView instanceof SelectionView
        ? [...selectionView.views]
        : [selectionView];
    };

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

      if (target !== this.view.selectionView) {
        let views = getViews(this.view.selectionView);
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

      if (this.view.selectionView) {
        const { state } = this.view.selectionView;
        startPos = { left: state.left, top: state.top };
      }
    };

    const handleMouseMove = (e) => {
      isClick = false;
      if (isDown && this.view.selectionView) {
        const movePoint = e.pos;
        const left = startPos.left + movePoint.x - downPoint.x;
        const top = startPos.top + movePoint.y - downPoint.y;
        this.view.selectionView.setState({ left, top });
        this.view.render();
      }
    };

    const handleMouseUp = (e) => {
      if (isDown && this.view.selectionView) {
        if (isClick) {
          if (target === this.view.selectionView && target instanceof SelectionView) {
            if (subTarget) {
              let views = getViews(this.view.selectionView);
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
          const left = startPos.left + upPoint.x - downPoint.x;
          const top = startPos.top + upPoint.y - downPoint.y;
          this.view.selectionView.setState({ left, top });
          this.view.render();
        }
      }

      isDown = false;
      downPoint = null;
      startPos = null;
      isClick = true;
      target = null;
      subTarget = null;
    };

    this.view.on('mouse:down', handleMouseDown);
    this.view.on('mouse:move', handleMouseMove);
    this.view.on('mouse:up', handleMouseUp);
    return () => {
      this.view.on('mouse:down', handleMouseDown);
      this.view.off('mouse:move', handleMouseMove);
      this.view.off('mouse:up', handleMouseUp);
    };
  }

  _listenKeys() {
    const handleDelete = (event, handler) => {
      const views = this.view.getSelectedViews();
      if (views.length > 0) {
        const models = views.map((v) => this.presenter.getModelByView(v));
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

class Model extends EventBus {
  constructor() {
    super();
    this.collection = new Set();
  }

  add(itemModel) {
    this.collection.add(itemModel);
    this.emit('add', itemModel);
  }

  remove(itemModel) {
    this.collection.delete(itemModel);
    this.emit('remove', itemModel);
  }
}

class View extends EventBus {
  constructor(id, presenter) {
    super();
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
    this.selectionView = null;

    this.presenter = presenter;
    presenter.view = this;
    presenter.attachView(this);

    this._unlisten = this._listen();
  }

  _listen() {
    const handleMouseDown = (e) => {
      this.emit('mouse:down', {
        ...e,
        pos: e.absolutePointer,
      });
    };
    const handleMouseMove = (e) => {
      this.emit('mouse:move', {
        ...e,
        pos: e.absolutePointer,
      });
    };
    const handleMouseUp = (e) => {
      this.emit('mouse:up', {
        ...e,
        pos: e.absolutePointer,
      });
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
    this._unlisten();
    this.presenter.detachView();
    this.presenter = null;

    this.canvas.dispose();
  }

  add(itemView) {
    this.canvas.add(...itemView.objects);

    itemView.parent = this;
    itemView.setViewOptions(this.viewOptions);
    this.views.add(itemView);
  }

  remove(itemView) {
    if (this.selectionView) {
      this.clearSelection();
    }

    this.canvas.remove(...itemView.objects);

    itemView.parent = null;
    itemView.dispose();

    this.views.delete(itemView);
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
    if (this.selectionView === null) return [];
    if (this.selectionView instanceof SelectionView) {
      return this.selectionView.views;
    }
    return [this.selectionView];
  }

  setSelection(views) {
    this.selectionView = null;
    this.canvas.discardActiveObject();

    if (views.length === 1) {
      this.canvas.setActiveObject(views[0].mainObject);
      this.selectionView = views[0];
    } else if (views.length > 1) {
      this.selectionView = new SelectionView(views, this);
      this.canvas.setActiveObject(this.selectionView.mainObject);
    }
  }

  clearSelection() {
    this.selectionView = null;
    this.canvas.discardActiveObject();
  }

  findTarget(e, skipGroup) {
    const object = this.canvas.findTarget(e.e, skipGroup);
    
    if (!object) return null;
    return object.__view;
  }
}

// =============================================================================
class SelectionView {
  constructor(views, canvasView) {
    this.views = views;
    const objects = views.map((v) => v.mainObject);
    this.mainObject = new fabric.ActiveSelection(objects, {
      canvas: canvasView.canvas,
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
      width: bounds.height,
      height: bounds.height,
    };
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
  }
}

// =============================================================================
class TiledObjectModel extends EventBus {
  constructor(data) {
    super();
    this.id = data.id;
    this.imageURL = data.imageURL;
    this.left = data.left;
    this.top = data.top;
    this.width = data.width;
    this.height = data.height;
    this.zIndex = data.zIndex;
    this.isCollider = data.isCollider;
    this.isMaskPlayer = data.isMaskPlayer;
    this.userLayer = data.userLayer;
    this.name = data.name;
    this.tileID = data.tileID;
    this.spin = data.spin;
  }

  moveTo(left, top) {
    this.left = left;
    this.top = top;

    this.emit('update', {
      model: this,
      patch: { left, top },
    });
  }
}

class TiledObjectPresenter {
  constructor(model) {
    this.model = model;
    this.view = null;
  }

  attachView(view) {
    this.view = view;
    const state = this._modelToState(this.model);
    this.view.setState(state);

    this._handleModelUpdate = this._handleModelUpdate.bind(this);
    this.model.on('update', this._handleModelUpdate);
  }
  
  detachView() {
    this.model.off('update', this._handleModelUpdate);

    this.view = null;
  }

  _handleModelUpdate({ model, patch }) {
    const state = this._modelToState(model);
    this.view.setState(state);
  }

  _modelToState(model) {
    return {
      left: model.left,
      top: model.top,
      width: model.width,
      height: model.height,
      zIndex: model.zIndex,
      src: model.imageURL,
    };
  }
}

// 理解为 View 层
class TiledObjectView {
  constructor(presenter) {
    this.parent = null;
    this.mainObject = createImage();
    this.mainObject.__view = this;
    this.impassableObject = createImage({
      src: 'https://dev-oss.vland.live/material/system/65433e2848c544d1ab0c43a51043f095_1649646689.png',
      zIndex: 9,
      opacity: 0.5,
      evented: false,
      selectable: false,
    });
    this.impassableObject.__view = this;
    this._unlisten = this._listen();

    // 理解为 ViewModel 层
    this.state = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: 0,
      src: '',
    };

    // Presenter 层
    this.presenter = presenter;
    this.presenter.attachView(this);
  }

  get objects() {
    return [this.mainObject, this.impassableObject];
  }

  _getImpassableState() {
    const viewOptions = this.parent?.viewOptions ?? {};
    return {
      left: this.state.left,
      top: this.state.top,
      width: this.state.width,
      height: this.state.height,
      visible: viewOptions.showTileEffect ? true : false,
    };
  }

  _listen() {
    const onImageLoad = () => {
      this.parent?.render();
    };
    this.mainObject.on('load', onImageLoad);
    this.impassableObject.on('load', onImageLoad);
    return () => {
      this.mainObject.off('load', onImageLoad);
      this.impassableObject.off('load', onImageLoad);
    };
  }

  dispose() {
    this._unlisten();
    this.presenter.detachView();
    this.presenter = null;
  }

  setState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
    updateImage(this.mainObject, this.state);

    const impassableState = this._getImpassableState();
    updateImage(this.impassableObject, impassableState);
  }

  setViewOptions(viewOptions) {
    const impassableState = this._getImpassableState();
    updateImage(this.impassableObject, impassableState);
  }
}

// =============================================================================
function createImage(options = {}) {
  const image = new fabric.Image(null, {
    lockMovementX: true,
    lockMovementY: true,
    hasControls: false,
    strokeWidth: 0,
    borderScaleFactor: 2,
    borderColor: '#8F7EF4',
    borderOpacityWhenMoving: 1,
    ...options,
  });
  image.controls = {};

  if (image.src) {
    const { width, height } = image; 
    image.setSrc(image.src, (_, isError) => {
      if (isError) {
        // 因为加载图片失败后，fabric.js会将宽高设置为0
        image.set({ width, height });
        return;
      }
      image.fire('load');
    });
  }

  return image;
}

function updateImage(image, state) {
    const keys = Object.keys(state);
    const inSelection = image.group ? image.group.type === 'activeSelection' : false;
    for (let key of keys) {
      if (key === 'src') continue;
      if (['left', 'top'].includes(key) && inSelection) {
        continue;
      }
      image.set({ [key]: state[key] });
    }
    // FIXME: 修改src的时候，width/height可能会改变
    if (state.src && state.src !== image.src) {
      image.set({ src: state.src });
      const { width, height } = image;
      image.setSrc(state.src, (_, isError) => {
        if (isError) {
          // 因为加载图片失败后，fabric.js会将宽高设置为0
          image.set({ width, height });
          return;
        }
        image.fire('load');
      });
    }
    image.setCoords();
}
