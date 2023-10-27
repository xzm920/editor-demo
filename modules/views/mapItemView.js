export class MapItemView {
  constructor() {
    // TODO:
  }

  intersectsWith(view) {
    return this.mainObject.intersectsWithObject(view.mainObject);
  }
}
