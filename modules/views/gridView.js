import { LayerGrid, TILE_SIZE } from '../constants/map.js';
import { VImage } from  './fabricExtensions.js';

export class GridView {
  constructor(width, height) {
    const onLoad = () => {
      this.parent?.render();
    };
    const options = {
      left: -0.5,
      top: -0.5,
      width: TILE_SIZE * width + 1,
      height: TILE_SIZE * height + 1,
      selectable: false,
      evented: false,
      zIndex: LayerGrid,
      src: createGridSVGUrl(width, height),
      objectCaching: false,
    };
    this.mainObject = new VImage(onLoad, options);
  }

  getMainObject() {
    return this.mainObject;
  }

  getObjects() {
    return [this.mainObject];
  }

  setViewOptions() {}

  dispose() {}
}

function createGridSVGUrl(width, height) {
  let svgStr = '';
  const widthPx = width * 64 + 1;
  const heightPx = height * 64 + 1;
  svgStr += `<svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" fill="none" style="stroke: rgb(207,207,207);" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i <= width; i += 1) {
    const x1 = 0.5 + i * 64;
    const y1 = 0.5;
    const x2 = 0.5 + i * 64;
    const y2 = 0.5 + height * 64;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    svgStr += line;
  }
  for (let j = 0; j <= height; j += 1) {
    const x1 = 0.5;
    const y1 = 0.5 + j * 64;
    const x2 = 0.5 + width * 64;
    const y2 = 0.5 + j * 64;
    const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    svgStr += line;
  }
  svgStr += '</svg>';
  return `data:image/svg+xml,${svgStr}`;
}
