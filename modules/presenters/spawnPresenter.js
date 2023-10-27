export class SpawnPresenter {
  constructor(model) {
    this.model = model;
    this.view = null;

    this._unlisten = this._listen();
  }

  attchView(view) {
    this.view = view;
    const state = this._modelToState(this.model);
    this.view.setState(state);
  }

  dispose() {
    this._unlisten();
    this.view = null;
  }

  _listen() {
    const handleModelUpdate = ({ item, patch }) => {
      const state = this._modelToState(this.model);
      this.view.setState(state);
    };
    this.model.on('update', handleModelUpdate);
    return () => {
      this.model.off('update', handleModelUpdate);
    };
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
