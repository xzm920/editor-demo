import { Layer } from '../constants/map.js';
import { EventBus } from '../utils/eventBus.js';

export class MapItem extends EventBus {
  constructor() {
    super();
  }

  shouldMoveByTile() {
    return this.zIndex !== Layer.background
      && this.zIndex !== Layer.freeObjAboveAvatar
      && this.zIndex !== Layer.freeObjBelowAvatar;
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
