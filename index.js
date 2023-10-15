const editor = new Editor('canvas-root');

const data = {
  id: "32a89e0f-c6b0-4ab5-b16c-507a841b0a35",
  imageURL: "https://dev-oss.vland.live/material/system/624ebcff4ff28daf5e79bafa/5a80d05e92e94c45a166e5899fbd0562_1649327359.png",
  left: 0,
  top: 0,
  width: 64,
  height: 64,
  zIndex: 6,
  isCollider: true,
  isMaskPlayer: true,
  userLayer: 2,
  name: "MA办公椅_2.png",
  tileID: "DUIuz645eWQ5yAxGNvS4N",
};

const data1 = {
  id: "32a89e0f-c6b0-4ab5-b16c-507a841b0a36",
  imageURL: "https://dev-oss.vland.live/material/system/624ebcff4ff28daf5e79bafa/5a80d05e92e94c45a166e5899fbd0562_1649327359.png",
  left: 256,
  top: 128,
  width: 64,
  height: 64,
  zIndex: 6,
  isCollider: true,
  isMaskPlayer: true,
  userLayer: 2,
  name: "MA办公椅_2.png",
  tileID: "DUIuz645eWQ5yAxGNvS4N",
};

const data2 = {
  id: "32a89e0f-c6b0-4ab5-b16c-507a841b0a37",
  imageURL: "https://dev-oss.vland.live/material/system/624ebcff4ff28daf5e79bafa/5a80d05e92e94c45a166e5899fbd0562_1649327359.png",
  left: 128,
  top: 256,
  width: 64,
  height: 64,
  zIndex: 6,
  isCollider: true,
  isMaskPlayer: true,
  userLayer: 2,
  name: "MA办公椅_2.png",
  tileID: "DUIuz645eWQ5yAxGNvS4N",
};

const model = new TiledObjectModel(data);
editor.add(model);

const model1 = new TiledObjectModel(data1);
editor.add(model1);

const model2 = new TiledObjectModel(data2);
editor.add(model2);
