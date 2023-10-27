import { MapItem } from './mapItem.js';

export class Image extends MapItem {
  constructor(data) {
    super();
    this.parent = null;
    this.id = data.id;
    this.materialId = data.materialId;
    this.zIndex = data.zIndex;
    this.left = data.left;
    this.top = data.top;
    this.width = data.width;
    this.height = data.height;
    this.angle = data.angle;
    this.flipX = data.flipX;
    this.flipY = data.flipY;
    this.opacity = data.opacity;
    this.imageURL = data.imageURL;
    this.imageWidth = data.imageWidth;
    this.imageHeight = data.imageHeight;
    this.name = data.name;
    this.userLayer = data.userLayer;
    this.isMaskPlayer = data.isMaskPlayer;
    this.effect3D = data.effect3D;
  }

  moveTo(left, top) {
    const patch = { left, top };
    this.update(patch);
  }

  setOpacity(opacity) {
    const patch = { opacity };
    this.update(patch);
  }

  toggleMaskPlayer() {
    const patch = { isMaskPlayer: !this.isMaskPlayer };
    this.update(patch);
  }

  toggleEffect3D() {
    const patch = { effect3D: !this.effect3D };
    this.update(patch);
  }

  scaleFlip(left, top, width, height, flipX, flipY) {
    const patch = { left, top, width, height, flipX, flipY };
    this.update(patch);
  }

  rotate(angle, left, top) {
    const patch = { angle, left, top };
    this.update(patch);
  }
}
