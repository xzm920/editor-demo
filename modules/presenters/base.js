import { Layer } from '../constants/map.js';
import { TiledObjectPresenter } from './tiledObjectPresenter.js';
import { ImagePresenter } from './imagePresenter.js';
import { TiledObjectView } from '../views/tiledObjectView.js';
import { ImageView } from '../views/imageView.js';
import { TextPresenter } from './textPresenter.js';
import { TextView } from '../views/textView.js';
import { SpawnPresenter } from './spawnPresenter.js';
import { SpawnView } from '../views/spawnView.js';

// instance of ?
export function createPresenter(model) {
  if (model.zIndex === Layer.objAboveAvatar || model.zIndex === Layer.objBelowAvatar) {
    return new TiledObjectPresenter(model);
  } else if (model.zIndex === Layer.freeObjAboveAvatar || model.zIndex === Layer.freeObjBelowAvatar) {
    if ('content' in model) {
      return new TextPresenter(model);
    }
    return new ImagePresenter(model);
  } else if (model.zIndex === Layer.tileEffect) {
    if (model.name === '出生点') {
      return new SpawnPresenter(model);
    }
  }
  throw new Error('cannot create presenter');
}

export function createView(model, presenter) {
  if (model.zIndex === Layer.objAboveAvatar || model.zIndex === Layer.objBelowAvatar) {
    return new TiledObjectView(model.id, presenter);
  } else if (model.zIndex === Layer.freeObjAboveAvatar || model.zIndex === Layer.freeObjBelowAvatar) {
    if ('content' in model) {
      return new TextView(model.id, presenter);
    }
    return new ImageView(model.id, presenter);
  } else if (model.zIndex === Layer.tileEffect) {
    if (model.name === '出生点') {
      return new SpawnView(model.id, presenter);
    }
  }
  throw new Error('cannot create view');
}
