interface IEditor {

}

interface IView {
  presenter: IPresenter;
}

interface IPresenter {
  view: IView;
  model: IModel;
}

interface IModel {
  presenter: IPresenter;
}



interface IItemView extends IBaseView {
  presenter: IItemPresenter;
}

interface IItemPresenter {
  view: IItemView;
  model: IItemModel;
}

interface IItemModel {
  presenter: IItemPresenter;
}

interface IBaseView {

}
