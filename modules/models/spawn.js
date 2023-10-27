import { MapItem } from './mapItem.js'

export class Spawn extends MapItem {
  constructor(data) {
    super();
    this.parent = null;

    this.id = data.id;
    this.zIndex = data.zIndex;
    this.left = data.left;
    this.top = data.top;
    this.width = data.width;
    this.height = data.height;
    this.isCollider = data.isCollider;
    this.isMaskPlayer = data.isMaskPlayer;
    this.userLayer = data.userLayer;
    this.name = data.name;
    this.tileID = data.tileID;
    this.imageURL = data.imageURL;
  }

  moveTo(left, top) {
    if (left % 64 !== 0 || top % 64 !== 0) return;
    const patch = { left, top };
    this.update(patch);
  }
}
