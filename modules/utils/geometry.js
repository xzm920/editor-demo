export class Point {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }

  offset(p) {
    return new Point(this.left + p.left, this.top + p.top);
  }
}

export class Rect {
  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  get right() {
    return this.left + this.width;
  }

  get bottom() {
    return this.top + this.height;
  }

  containRect(rect) {
    return (
      rect.left >= this.left &&
      rect.right <= this.right &&
      rect.top >= this.top &&
      rect.bottom <= this.bottom
    );
  }
}

export class RotatedRect {
  constructor(left, top, width, height, angle) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.angle = angle;
  }

  getBoundingRect() {
    if (this.angle === 0) {
      return new Rect(this.left, this.top, this.width, this.height);
    }
    
    const radians = degreesToRadians(-this.angle);
    const anchor = new Point(this.left, this.top);
    const tl = rotatePoint(new Point(0, 0), radians).offset(anchor);
    const tr = rotatePoint(new Point(this.width, 0), radians).offset(anchor);
    const bl = rotatePoint(new Point(0, this.height), radians).offset(anchor);
    const br = rotatePoint(new Point(this.width, this.height), radians).offset(anchor);
    const minLeft = Math.min.call(null, tl.left, tr.left, bl.left, br.left);
    const maxLeft = Math.max.call(null, tl.left, tr.left, bl.left, br.left);
    const minTop = Math.min.call(null, tl.top, tr.top, bl.top, br.top);
    const maxTop = Math.max.call(null, tl.top, tr.top, bl.top, br.top);
    return new Rect(minLeft, minTop, maxLeft - minLeft, maxTop - minTop);
  }
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function rotatePoint(point, radians) {
  const left = point.left;
  const top = point.top;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const rotatedLeft = left * cos + top * sin;
  const rotatedTop = left * -sin + top * cos;
  return new Point(rotatedLeft, rotatedTop);
}
