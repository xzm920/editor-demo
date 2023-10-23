import { TiledObjectPresenter } from './tiledObjectPresenter.js';
import { TiledObjectView } from '../views/tiledObjectView.js';

export class Presenter {
  constructor(model) {
    this.model = model;
    this.view = null;

    this._unlisten = this._listen();
    this._isRebuildScheduled = false;
  }

  _listen() {
    const handleAdd = ({ item: itemModel }) => {
      const itemPresenter = new TiledObjectPresenter(itemModel);
      const itemView = new TiledObjectView(itemModel.id, itemPresenter);
      itemPresenter.view = itemView;
      itemPresenter.updateView();
      this.view.add(itemView);
      this.view.render();
    };
    const handleRemove = ({ item: itemModel }) => {
      const itemView = this.view.findViewById(itemModel.id);
      this.view.remove(itemView);
      if (this.view.getSelectedViews().includes(itemView)) {
        this._requestRebuildSelection();
      }
      this.view.render();
    };
    
    const handleUpdate = ({ item: itemModel }) => {
      const itemView = this.view.findViewById(itemModel.id);
      if (this.view.getSelectedViews().includes(itemView)) {
        this._requestRebuildSelection();
      }
      this.view.render();
    };
    this.model.on('add', handleAdd);
    this.model.on('remove', handleRemove);
    this.model.on('update', handleUpdate);
    return () => {
      this.model.off('add', handleAdd);
      this.model.off('remove', handleRemove);
      this.model.off('update', handleUpdate);
    };
  }

  _requestRebuildSelection() {
    if (this._isRebuildScheduled) return;
    this._isRebuildScheduled = true;
    Promise.resolve().then(() => {
      this._rebuildSelection();
      this._isRebuildScheduled = false;
    });
  }

  _rebuildSelection() {
    const itemViews = this.view.getSelectedViews()
      .filter((v) => this.view.views.has(v));
    this.view.clearSelection();
    itemViews.forEach((v) => {
      v.setState(v.state);
    });
    this.view.setSelection(itemViews);
  }
  
  dispose() {
    this.view = null;
    this._unlisten();
  }
}
