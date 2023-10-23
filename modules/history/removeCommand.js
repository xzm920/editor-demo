export class RemoveCommand {
  constructor(model, item) {
    this.model = model;
    this.item = item;
  }

  execute() {
    this.model.remove(this.item);
  }

  undo() {
    this.model.add(this.item);
  }
}
