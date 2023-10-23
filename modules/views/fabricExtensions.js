// Vland 前缀 V
fabric.VImage = fabric.util.createClass(fabric.Image, {
  initialize: function(onLoad, options) {
    this.__view = null;
    this.__onLoad = onLoad;
    const element = null;
    this.callSuper('initialize', element, options);
    // 初始化时如果options中有src，则立即加载图片资源
    options && options.src && this.setSrc(options.src);
  },
  update: function(state) {
    const inSelection = this.group && this.group.type === 'activeSelection';
    if (inSelection && ('left' in state || 'top' in state)) {
      return this;
    }
    return this.set(state);
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

// fabric.Group
// fabric.Rect
// fabric.Image
// fabric.Textbox
// fabric.ActiveSelection
