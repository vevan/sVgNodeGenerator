import type { FeNodeFactory } from "./types";

const feGaussianBlur: FeNodeFactory = ({ textPort, textAttr }) => ({
  type: "feGaussianBlur",
  title: "高斯模糊",
  description: "对输入图像进行高斯模糊，常用于阴影或柔化边缘。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    stdDeviation: () => textAttr("模糊半径 stdDeviation", "4"),
  },
});

export default feGaussianBlur;
