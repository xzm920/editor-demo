// Vland 前缀 V
export const VImage = fabric.util.createClass(fabric.Image, {
  initialize: function(onLoad, options) {
    this.__view = null;
    this.__onLoad = onLoad;
    const element = null;
    this.callSuper('initialize', element, options);
    // 初始化时如果options中有src，则立即加载图片资源
    options && options.src && this.setSrc(options.src);
  },
  setSrc: function(src, callback, options) {
    const { width, height } = this;
    const wrapCallback = (context, isError) => {
      if (isError) {
        // 因为加载图片失败后，fabric.js会将宽高设置为0
        this.set({ width, height });
        return;
      }
      // 图片加载成功的回调
      this.__onLoad && this.__onLoad();
      callback && callback(context, isError);
    };
    this.callSuper('setSrc', src, wrapCallback, options);
  },
});

export const VImpassable = fabric.util.createClass(fabric.Rect, {
  type: 'impassable',
  initialize(onLoad, options) {
    const { src, ...restOptions } = options;
    const newOptions = {
      ...restOptions,
      fill: 'transparent',
    };
    this.callSuper('initialize', newOptions);
    fabric.util.loadImage(src, (image, isError) => {
      if (isError) return;
      this.set('fill', new fabric.Pattern({
        source: image,
        repeat: 'repeat',
      }));
      onLoad && onLoad();
    }, this, true);
  },
})
// fabric.Group
// fabric.Rect
// fabric.Image
// fabric.Textbox
// fabric.ActiveSelection
