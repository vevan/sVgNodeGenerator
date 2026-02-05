import type { FeNodeFactory } from "./types";

const feMorphology: FeNodeFactory = ({ textPort, textAttr, selectAttr }) => ({
  type: "feMorphology",
  title: "形态学",
  description: "对输入图像做膨胀或腐蚀操作。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    operator: () => selectAttr("操作 operator", "erode", ["erode", "dilate"]),
    radius: () => textAttr("半径 radius", "2 2"),
  },
});

export default feMorphology;
