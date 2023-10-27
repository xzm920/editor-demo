import { Model } from './models/mapModel.js';
import { Presenter } from './presenters/mapPresenter.js';
import { View } from './views/mapView.js';
import { ToolName } from './controllers/tool.js';
import { SelectTool } from './controllers/selectTool.js';
import { HistoryManager } from './history/historyManager.js';
import { EventBus } from './utils/eventBus.js';
import { HandTool } from './controllers/handleTool.js';
import { EraserTool } from './controllers/eraserTool.js';
import { TiledObject } from './models/tiledObject.js';
import { Image } from './models/image.js';
import { Text } from './models/text.js';
import { Spawn } from './models/spawn.js';
import { Layer, MAX_ZOOM, MIN_ZOOM } from './constants/map.js';
import { MouseWheel } from './controllers/mouseWheel.js';

export class Editor extends EventBus {
  constructor(options = {}) {
    const {
      id,
      width = 10,
      height = 10,
      canvasWidth = 600,
      canvasHeight = 600,
    } = options;
    super();

    this.width = width;
    this.height = height;

    this.model = new Model(width, height);
    this.presenter = new Presenter(this.model);
    this.view = new View({ id, width, height,canvasWidth, canvasHeight }, this.presenter);
    this.presenter.view = this.view;

    this.view.zoomToFit();
    this.view.render();

    this.historyManager = new HistoryManager(this.model);

    this.mouseWheel = new MouseWheel(this.view);

    this.currentTool = null;
    this.currentToolName = null;
    this.tools = new Map();
    this.registerTool(ToolName.select, SelectTool);
    this.registerTool(ToolName.hand, HandTool);
    this.registerTool(ToolName.eraser, EraserTool);

    this.invokeTool(ToolName.select);

    this._unlisten = this._listen();
  }

  reset(width, height, objects) {
    this.width = width;
    this.height = height;
    // FIXME:
    const items = objects
      .map((o) => {
        if (o.zIndex === Layer.objAboveAvatar || o.zIndex === Layer.objBelowAvatar) {
          return new TiledObject(o);
        } else if (o.zIndex === Layer.freeObjAboveAvatar || o.zIndex === Layer.freeObjBelowAvatar) {
          if ('content' in o) {
            return new Text(o);
          }
          return new Image(o);
        } else if (o.zIndex === Layer.tileEffect) {
          if (o.name === '出生点') {
            return new Spawn(o);
          }
        } else {
          return null;
        }
      })
      .filter((o) => !!o);
    this.model.reset(width, height, items);
  }

  add(itemModel) {
    this.model.add(itemModel);
  }

  remove(itemModel) {
    this.model.remove(itemModel);
  }

  dispose() {
    this.historyManager.dispose();
    this.mouseWheel.dispose();
    this.currentTool.dispose();
    this.view.dispose();
  }

  toggleTileEffect() {
    this.view.toggleTileEffect();
    this.view.render();
  }

  toggleMask() {
    this.view.toggleMask();
    this.view.render();
  }

  undo() {
    this.historyManager.undo();
  }

  redo() {
    this.historyManager.redo();
  }

  registerTool(name, Tool) {
    if (this.tools.has(name)) return;
    this.tools.set(name, Tool);
  }

  invokeTool(name) {
    this.stopTool();
    const Tool = this.tools.get(name);
    if (Tool) {
      this.currentToolName = name;
      this.currentTool = new Tool(this.model, this.view);
    }
  }

  stopTool() {
    if (this.currentTool !== null) {
      this.currentTool.dispose();
      this.currentToolName = null;
      this.currentTool = null;
    }
  }

  _listen() {
    const handleSelectionChange = ({ views }) => {
      const models = views.map((v) => this.model.getModelById(v.id));
      this.emit('selection:change', { models });
    };
    const handleZoomChange = ({ zoom }) => {
      this.emit('zoom:change', { zoom });
    };
    this.view.on('selection:change', handleSelectionChange);
    this.view.on('zoom:change', handleZoomChange);
    return () => {
      this.view.off('selection:change', handleSelectionChange);
      this.view.off('zoom:change', handleZoomChange);
    };
  }

  getMinZoom() {
    return MIN_ZOOM;
  }

  getMaxZoom() {
    return MAX_ZOOM;
  }

  getZoom() {
    return this.view.zoom;
  }

  setZoom(zoom) {
    this.view.zoomToCenter(zoom);
    this.view.render();
  }

  zoomToFit() {
    this.view.zoomToFit();
    this.view.render();
  }
}
