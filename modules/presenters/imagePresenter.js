import { NotAllowedView } from '../views/notAllowedView.js';

export class ImagePresenter {
  constructor(model) {
    this.model = model;
    this.view = null;

    this._unlisten = this._listen();
  }

  attchView(view) {
    this.view = view;
    const state = this._modelToState(this.model);
    this.view.setState(state);

    this._unlistenView = this._listenView();
  }

  dispose() {
    this._unlisten();
    this._unlistenView();
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

  _listenView() {
    let notAllowedView = null;

    const updateNotAllowed = () => {
      const rect = this.view.getBoundingRect();
      if (this.model.parent.isOutOfMap(rect)) {
        if (notAllowedView === null) {
          notAllowedView = new NotAllowedView();
        }
        const { left, top, width, height, scaleX, scaleY, flipX, flipY, angle } = this.view.state;
        const notAllowedState = { left, top, width: width * scaleX,  height: height * scaleY, flipX, flipY, angle };
        notAllowedView.setState(notAllowedState);
        this.view.parent.addToolView(notAllowedView);
        this.view.parent.render();
      } else {
        if (notAllowedView) {
          this.view.parent.removeToolView(notAllowedView);
          this.view.parent.render();
        }
      }
    };

    const clearNotAllowed = () => {
      if (notAllowedView) {
        this.view.parent.removeToolView(notAllowedView);
        this.view.parent.render();
        notAllowedView = null;
      }
    };

    // TODO: 
    const handleScaling = (e) => {
      const { left, top, scaleX, scaleY, flipX, flipY } = e.transform.target;
      const state = { left, top, scaleX, scaleY, flipX, flipY };
      this.view.setState(state);

      updateNotAllowed();
    };

    // TODO:
    const handleRotating = (e) => {
      const { left, top, angle } = e.transform.target;
      const state = { left, top, angle };
      this.view.setState(state);

      updateNotAllowed();
    };

    const handleModified = (e) => {
      const { action, target } = e.transform;

      if (['scale', 'scaleX', 'scaleY', 'rotate'].includes(action)) {
        clearNotAllowed();

        const rect = this.view.getBoundingRect();
        if (this.model.parent.isOutOfMap(rect)) {
          this.view.setState({
            left: this.model.left,
            top: this.model.top,
            scaleX: this.model.width / this.model.imageWidth,
            scaleY: this.model.height / this.model.imageHeight,
            flipX: this.model.flipX,
            flipY: this.model.flipY,
            angle: this.model.angle,
          });
          this.view.parent.render();
          return;
        }
      }

      if (['scale', 'scaleX', 'scaleY'].includes(action)) {
        this.model.scaleFlip(target.left, target.top, target.width * target.scaleX, target.height * target.scaleY, target.flipX, target.flipY);
      } else if (action === 'rotate') {
        this.model.rotate(target.angle, target.left, target.top);
      }
    };
    this.view.mainObject.on('scaling', handleScaling);
    this.view.mainObject.on('rotating', handleRotating);
    this.view.mainObject.on('modified', handleModified);
    return () => {
      this.view.mainObject.off('scaling', handleScaling);
      this.view.mainObject.off('rotating', handleRotating);
      this.view.mainObject.off('modified', handleModified);
    };
  }

  _modelToState(model) {
    return {
      left: model.left,
      top: model.top,
      width: model.imageWidth,
      height: model.imageHeight,
      zIndex: model.zIndex,
      src: model.imageURL,
      scaleX: model.width / model.imageWidth,
      scaleY: model.height / model.imageHeight,
      flipX: model.flipX,
      flipY: model.flipY,
      angle: model.angle,
      opacity: model.opacity,
    };
  }
}
