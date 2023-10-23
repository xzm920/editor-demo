export class AddCommand {
  constructor(model, item) {
    this.model = model;
    this.item = item;
  }

  execute() {
    this.model.add(this.item);
  }

  undo() {
    this.model.remove(this.item);
  }
}
