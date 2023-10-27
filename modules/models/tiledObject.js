import { Layer } from '../constants/map.js';
import { MapItem } from './mapItem.js';

export class TiledObject extends MapItem {
  constructor(data) {
    super();
    this.parent = null;

    this.id = data.id;
    this.left = data.left;
    this.top = data.top;
    this.width = data.width;
    this.height = data.height;
    this.zIndex = data.zIndex;
    this.isCollider = data.isCollider;
    this.isMaskPlayer = data.isMaskPlayer;
    this.userLayer = data.userLayer;
    this.name = data.name;
    this.tileID = data.tileID;
    this.imageURL = data.imageURL;
    this.effect3D = data.effect3D;
    this.spin = data.spin;

    // TODO:业务相关字段
  }

  moveTo(left, top) {
    if (left % 64 !== 0 || top % 64 !== 0) return;
    const patch = { left, top };
    this.update(patch);
  }

  switchPrevImage() {
    this._switchImage('prev');
  }

  switchNextImage() {
    this._switchImage('next');
  }

  _switchImage(direction) {
    if (this.spin.status && this.spin.images.length > 1) {
      const total = this.spin.images.length;
      const index = this.spin.images.findIndex((v) => v.url === this.imageURL);
      if (index > -1) {
        const newIndex = direction === 'prev'
          ? (index === 0 ? total - 1 : index -1)
          : (index === total -1 ? 0 : index + 1);
        const image = this.spin.images[newIndex];
        const patch = {
          name: image.name,
          width: image.w,
          height: image.h,
          imageURL: image.url,
        };
        this.update(patch);
      }
    }
  }

  toggleMaskPlayer() {
    if (this.isCollider) return;
    const isMaskPlayer = !this.isMaskPlayer;
    const patch = {
      isMaskPlayer,
      zIndex: isMaskPlayer ? Layer.objAboveAvatar : Layer.objBelowAvatar,
    };
    this.update(patch);
  }

  toggleCollider() {
    if (this.isMaskPlayer) return;
    const patch = { isCollider: !this.isCollider };
    this.update(patch);
  }

  toggleEffect3D() {
    const patch = { effect3D: !this.effect3D };
    this.update(patch);
  }
}
