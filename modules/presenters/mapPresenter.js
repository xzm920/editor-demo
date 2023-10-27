import { createPresenter, createView } from './base.js';

export class Presenter {
  constructor(model) {
    this.model = model;
    this.view = null;

    this._unlisten = this._listen();
  }

  _listen() {
    const handleReset = ({ width, height, items }) => {
      const views = items.map((itemModel) => {
        const itemPresenter = createPresenter(itemModel);
        const itemView = createView(itemModel, itemPresenter);
        itemPresenter.attchView(itemView);
        return itemView;
      });
      this.view.reset(width, height, views);
      this.view.zoomToFit();
      this.view.render();
    };
    const handleAdd = ({ item: itemModel }) => {
      const itemPresenter = createPresenter(itemModel);
      const itemView = createView(itemModel, itemPresenter);
      itemPresenter.attchView(itemView);
      this.view.add(itemView);
      this.view.render();
    };
    const handleRemove = ({ item: itemModel }) => {
      const itemView = this.view.getViewById(itemModel.id);
      this.view.remove(itemView);
      if (this.view.getSelectedViews().includes(itemView)) {
        this.view.requestResetSelection();
      }
      this.view.render();
    };
    
    const handleUpdate = ({ item: itemModel }) => {
      const itemView = this.view.getViewById(itemModel.id);
      if (this.view.getSelectedViews().includes(itemView)
        && this.view.selection.type === 'selection'
      ) {
        this.view.requestResetSelection();
      }
      this.view.render();
    };
    this.model.on('reset', handleReset);
    this.model.on('add', handleAdd);
    this.model.on('remove', handleRemove);
    this.model.on('update', handleUpdate);
    return () => {
      this.model.off('reset', handleReset);
      this.model.off('add', handleAdd);
      this.model.off('remove', handleRemove);
      this.model.off('update', handleUpdate);
    };
  }
  
  dispose() {
    this.view = null;
    this._unlisten();
  }
}
