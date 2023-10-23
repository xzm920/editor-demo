import { AddCommand } from './addCommand.js';
import { RemoveCommand } from './removeCommand.js';
import { UpdateCommand } from './updateCommand.js';

export class HistoryManager {
  constructor(model) {
    this.model = model;
    this.maxUndoTimes = 100;
    this.undoStack = [];
    this.redoStack = [];
    this.stackItem = [];
    this.ignoreModelEvent = false;

    this._listen();
  }

  dispose() {
    this._unlisten();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    const stackItem = this.undoStack.pop();
    if (!stackItem) return;

    this.ignoreModelEvent = true;
    for (const command of stackItem) {
      command.undo();
    }
    this.redoStack.push(stackItem);
    this.ignoreModelEvent = false;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  redo() {
    const stackItem = this.redoStack.pop();
    if (!stackItem) return;

    this.ignoreModelEvent = true;
    for (const command of stackItem) {
      command.execute();
    }
    this.undoStack.push(stackItem);
    this.ignoreModelEvent = false;
  }

  _listen() {
    const handleAdd = ({ item }) => {
      // 在执行 undo/redo 的过程中不响应来自 model 的事件，避免发生循环调用
      if (this.ignoreModelEvent) return;
  
      const command = new AddCommand(this.model, item);
      this.pushCommand(command);
    };
    const handleRemove = ({ item }) => {
      if (this.ignoreModelEvent) return;
  
      const command = new RemoveCommand(this.model, item);
      this.pushCommand(command);
    };
    const handleUpdate = ({ item, changes, reason }) => {
      if (this.ignoreModelEvent) return;

      const command = new UpdateCommand(item, changes, reason);
      this.pushCommand(command);
    };

    this.model.on('add', handleAdd);
    this.model.on('remove', handleRemove);
    this.model.on('update', handleUpdate);
  }

  _unlisten() {
    this.model.off('add', handleAdd);
    this.model.off('remove', handleRemove);
    this.model.off('update', handleUpdate);
  }

  pushCommand(command) {
    this.stackItem.push(command);
    Promise.resolve().then(() => {
      this.pushStackItem(this.stackItem);
      this.stackItem = [];
    });
  }

  pushStackItem(stackItem) {
    // 避免 push 空数组到 undoStack
    if (stackItem.length > 0) {
      this.redoStack = [];
      this.undoStack.push(stackItem);
    }
  }
}
