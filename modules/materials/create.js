import { Layer } from '../constants/map.js';
import { TiledObject } from '../models/tiledObject.js';
import { getUuid } from '../utils/uuid.js';

export function createTiledObject(material, pos) {
  return new TiledObject({
    id: getUuid(),
    left: pos?.left ?? 0,
    top: pos?.top ?? 0,
    width: material.w,
    height: material.h,
    zIndex: material.shelter ? Layer.objAboveAvatar : Layer.objBelowAvatar,
    userLayer: material.layer,
    isMaskPlayer: material.shelter,
    isCollider: material.obstacle,
    name: material.name,
    tileID: material.code,
    imageURL: material.url,
    spin: material.spin,
  });
}
