import { EventBus } from '../utils/eventBus.js';

export class TiledObjectModel extends EventBus {
  constructor(data) {
    super();
    this.parent = null;
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
    const patch = { left, top };
    this.update(patch, 'move');
  }

  update(patch, reason) {
    const changes = this._patchToChanges(patch);
    Object.assign(this, patch);

    const event = {
      item: this,
      patch,
      changes,
      reason,
    };
    this.emit('update', event);
    this.parent?.emit('update', event);
  }

  _patchToChanges(patch) {
    return Object.keys(patch).map((key) => ({
      key,
      prev: this[key],
      next: patch[key],
    }));
  }
}
