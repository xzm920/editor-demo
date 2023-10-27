import { TILE_SIZE } from '../constants/map.js';
import { EventBus } from '../utils/eventBus.js';
import { Rect } from '../utils/geometry.js';

export class Model extends EventBus {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
    this.collection = new Set();
  }

  reset(width, height, items) {
    this.width = width;
    this.height = height;
    items.forEach((item) => {
      item.parent = this;
    });
    this.collection = new Set(items);
    const event = { width, height, items };
    this.emit('reset', event);
  }

  add(itemModel) {
    this.collection.add(itemModel);
    itemModel.parent = this;
    const event = { item: itemModel };
    this.emit('add', event);
  }

  remove(itemModel) {
    this.collection.delete(itemModel);
    itemModel.parent = null;
    const event = { item: itemModel };
    this.emit('remove', event);
  }

  getModelById(id) {
    return [...this.collection].find((m) => m.id === id) ?? null;
  }

  getBounds() {
    return new Rect(0, 0, TILE_SIZE * this.width, TILE_SIZE * this.height);
  }

  isOutOfMap(bbox) {
    return !this.getBounds().containRect(bbox);
  }
}
