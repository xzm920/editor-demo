declare namespace fabric {
  interface Object {}
}

interface IEventHandler {
  (e: any): void;
}

interface IEditor {
  model: IMapModel;
  view: IMapView;
  history: IHistoryManager;
  width: number;
  height: number;

  restore(): void;
  resizeMap(): void;

  registerTool(): void;
  invokeTool(): void;
  stopTool(): void;

  undo(): void;
  redo(): void;

  toggleTileEffect(): void;

  dispose(): void;
}

interface IHistoryManager {
  undo(): void;
  redo(): void;
}

// controller 层
interface IMapController {
  model: IMapModel;
  view: IMapView;
  dispose(): void;
}

interface IMapPresenter {
  model: IMapModel;
  onAdd
  dispose(): void;
}

interface IItemController {
  model: IItemModel;
  view: IItemView;
  dispose(): void;
}

interface IItemPresenter {
  model: IItemModel;
  view: IItemView;
  dispose(): void;
}

// model 层
interface IMapModel {
  add(item: IItemModel): void;
  remove(item: IItemModel): void;
  reset(items: IItemModel[]): void;
}

interface IItemModel {
  move(left: number, top: number): void;
}

// view model 层
interface IMapView {
  presenter: IMapPresenter;
  controller: IMapController;
  onMouseDown: IEventHandler | null;
  onMouseMove: IEventHandler | null;
  onMouseUp: IEventHandler | null;
  // TODO: more event delegate

  canvasWidth: number;
  canvasHeight: number;
  showTileEffect: boolean; // TODO: 是否应该放在 view 中?

  zoom: number;
  offset: { left: number, top: number };

  views: Set<IItemView>; // grid, mask, map items, ...
  selection: IItemView; // TODO: activeSelection?

  render(): void;
  add(view: IItemView): void;
  remove(view: IItemView): void;
  reset(views: IItemView[]): void;

  setDimensions(): void;
  setDefaultCursor(): void;
  setHoverCursor(): void;
  toggleTileEffect(): void;

  zoomToPoint(): void;
  zoomToFit(): void;
  relativePan(): void;

  undo(): void;
  redo(): void;

  dispose(): void;
}

// FIXME:
interface IItemView {
  id: string;
  presenter: IItemPresenter;
  parent: IMapView | null;
  state: IBaseState;

  getMainObject(): fabric.Object;
  getObjects(): fabric.Object[];
  setState(state: IBaseState): void;
  setViewOptions(): void;
  dispose(): void;
}

interface IMapItemView extends IItemView {

}

interface IBaseView {
  object: fabric.Object;
  update(state: IBaseState): void;
}

// state of view
interface IBaseState {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
}

interface IImageState extends IBaseState {
  src: string;
}
