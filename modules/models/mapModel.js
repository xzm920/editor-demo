import { EventBus } from '../utils/eventBus.js';

export class Model extends EventBus {
  constructor() {
    super();
    this.collection = new Set();
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
}
