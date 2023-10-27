import { DEFAULT_LINE_HEIGHT } from '../constants/map.js';
import { NotAllowedView } from '../views/notAllowedView.js';

export class TextPresenter {
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
        const { left, top, width, height, angle } = this.view.state;
        const notAllowedState = { left, top, width, height, angle };
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

    const handleRotating = (e) => {
      const { left, top, angle } = e.transform.target;
      const state = { left, top, angle };
      this.view.setState(state);

      updateNotAllowed();
    };

    const handleResizing = (e) => {
      const { left, top, width, height, angle } = e.transform.target;
      const state = { left, top, width, height, angle };
      this.view.setState(state);

      updateNotAllowed();
    };

    const handleModified = (e) => {
      if (!e.transform) return;
      const { action, target } = e.transform;

      if (['rotate', 'resizing'].includes(action)) {
        clearNotAllowed();

        const rect = this.view.getBoundingRect();
        if (this.model.parent.isOutOfMap(rect)) {
          this.view.setState({
            left: this.model.left,
            top: this.model.top,
            width: this.model.width,
            height: this.model.height,
            angle: this.model.angle,
          });
          this.view.parent.render();
          return;
        }
      }

      if (action === 'rotate') {
        this.model.rotate(target.angle, target.left, target.top);
      } else if (action === 'resizing') {
        this.model.resize(target.left, target.top, target.width, target.height);
      }
    };

    const handleChange = (e) => {
      const { text, left, top, width, height, angle } = this.view.mainObject;
      const state = { text, left, top, width, height, angle };
      this.view.setState(state);

      updateNotAllowed();
    };

    const handleEditingExited = (e) => {
      clearNotAllowed();

      const rect = this.view.getBoundingRect();
      if (this.model.parent.isOutOfMap(rect)) {
        // TODO: reset more props
        this.view.setState({
          text: this.model.content,
          left: this.model.left,
          top: this.model.top,
          width: this.model.width,
          height: this.model.height,
          angle: this.model.angle,
        });
        this.view.parent.render();
        return;
      }

      const { text, height } = this.view.mainObject;
      this.model.setContent(text, height);
    };

    this.view.mainObject.on('rotating', handleRotating);
    this.view.mainObject.on('resizing', handleResizing);
    this.view.mainObject.on('modified', handleModified);
    this.view.mainObject.on('changed', handleChange);
    this.view.mainObject.on('editing:exited', handleEditingExited);
    return () => {
      this.view.mainObject.off('rotating', handleRotating);
      this.view.mainObject.off('resizing', handleResizing);
      this.view.mainObject.off('modified', handleModified);
      this.view.mainObject.off('editing:exited', handleEditingExited);
    };
  }

  _modelToState(model) {
    return {
      zIndex: model.zIndex,
      left: model.left,
      top: model.top,
      width: model.width,
      height: model.height,
      angle: model.angle,
      opacity: model.opacity,
      text: model.content,
      fontSize: model.fontSize,
      fill: model.color,
      fontStyle: model.isItalic ? 'italic' : 'normal',
      fontWeight: model.isBold ? 700 : 400,
      underline: model.isUnderline,
      textAlign: model.horizontalAlign.toLowerCase(),
      lineHeight: model.lineHeight === null
        ? DEFAULT_LINE_HEIGHT
        : model.lineHeight / model.fontSize,
    };
  }
}
