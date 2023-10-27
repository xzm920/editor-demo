import { MapItem } from './mapItem.js';

export class Text extends MapItem {
  constructor(data) {
    super();
    this.parent = null;

    this.id = data.id;
    this.zIndex = data.zIndex;
    this.left = data.left;
    this.top = data.top;
    this.width = data.width;
    this.height = data.height;
    this.angle = data.angle;
    this.content = data.content;
    this.fontSize = data.fontSize;
    this.color = data.color;
    this.userLayer = data.userLayer;
    this.isMaskPlayer = data.isMaskPlayer;
    this.opacity = data.opacity;
    this.isItalic = data.isItalic;
    this.isBold = data.isBold;
    this.isUnderline = data.isUnderline;
    this.horizontalAlign = data.horizontalAlign;
    this.lineHeight = data.lineHeight;
  }

  moveTo(left, top) {
    const patch = { left, top };
    this.update(patch);
  }

  toggleMaskPlayer() {
    const patch = { isMaskPlayer: !this.isMaskPlayer };
    this.update(patch);
  }

  rotate(angle, left, top) {
    const patch = { angle, left, top };
    this.update(patch);
  }

  resize(left, top, width, height) {
    const patch = { left, top, width, height };
    this.update(patch);
  }

  setContent(content, height) {
    const patch = { content, height };
    this.update(patch);
  }

  setOpacity(opacity) {
    const patch = { opacity };
    this.update(patch);
  }

  setFontSize(fontSize) {
    const patch = { fontSize }; // and height?
    this.update(patch);
  }

  setColor(color) {
    const patch = { color };
    this.update(patch);
  }

  setItalic(isItalic) {
    const patch = { isItalic };
    this.update(patch);
  }

  setBold(isBold) {
    const patch = { isBold };
    this.update(patch);
  }

  setUnderline(isUnderline) {
    const patch = { isUnderline };
    this.update(patch);
  }

  setTextAlign(textAlign) {
    const patch = { textAlign };
    this.update(patch);
  }

  setLineHeight(lineHeight) {
    const patch = { lineHeight }; // and height?
    this.update(patch);
  }
}
