import { isMac } from '../constants/env.js';
import { MAX_ZOOM, MIN_ZOOM } from '../constants/map.js';

export class MouseWheel {
  constructor(view) {
    this.view = view;
    this._unlisten = this._listen();
  }

  dispose() {
    this._unlisten();
  }

  _listen() {
    const handleMouseWheel = (e) => {
      // 防止过度滚动导致浏览器回弹，防止缩放导致浏览器页面缩放
      e.e.preventDefault();
      const { ctrlKey, shiftKey, metaKey } = e.e;
      let { deltaX, deltaY } = e.e;
      const ctrlAndCommandKey = ctrlKey || (isMac ? metaKey : false);

      // mac按住shift键滑动鼠标滚轮的时候，会自动转换成横向；其他平台需要手动转换
      if (!isMac && shiftKey) {
        const temp = deltaX;
        deltaX = deltaY;
        deltaY = temp;
      }

      if (ctrlAndCommandKey) {
        if (deltaY === 0) return;
        // 缩放
        const zoom = this.view.zoom;
        let newZoom = deltaY > 0 ? zoom / 1.09 : zoom * 1.09;
        newZoom = Math.max(MIN_ZOOM, newZoom);
        newZoom = Math.min(MAX_ZOOM, newZoom);
        if (newZoom === zoom) return;

        this.view.zoomToPoint({ left: e.pointer.x, top: e.pointer.y }, newZoom);
        this.view.render();
      } else {
        // 移动
        const offset = { left: -deltaX, top: -deltaY };
        this.view.relativePan(offset);
        this.view.render();
      }
    };
    this.view.onMouseWheel = handleMouseWheel;
    return () => {
      this.view.onMouseWheel = null;
    };
  }
}
