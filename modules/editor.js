import { Model } from './models/mapModel.js';
import { Presenter } from './presenters/mapPresenter.js';
import { View } from './views/mapView.js';
import { SelectTool } from './controllers/selectTool.js';
import { HistoryManager } from './history/historyManager.js';

export class Editor {
  constructor(id) {
    this.model = new Model();
    this.presenter = new Presenter(this.model);
    this.view = new View(id, this.presenter);
    this.presenter.view = this.view;

    this.historyManager = new HistoryManager(this.model);

    this.currentTool = new SelectTool(this.model, this.view);
  }

  add(itemModel) {
    this.model.add(itemModel);
  }

  remove(itemModel) {
    this.model.remove(itemModel);
  }

  dispose() {
    this.historyManager.dispose();
    this.currentTool.dispose();
    this.view.dispose();
  }

  toggleTileEffect() {
    this.view.toggleTileEffect();
    this.view.render();
  }

  undo() {
    this.historyManager.undo();
  }

  redo() {
    this.historyManager.redo();
  }
}
