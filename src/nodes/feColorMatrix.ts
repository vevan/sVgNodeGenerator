import type { FeNodeFactory } from "./types";

const feColorMatrix: FeNodeFactory = ({ textPort, textAttr, selectAttr }) => ({
  type: "feColorMatrix",
  title: "颜色矩阵",
  description: "使用矩阵或变换类型来调整颜色、饱和度或色相。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    type: () =>
      selectAttr("类型 type", "matrix", ["matrix", "saturate", "hueRotate", "luminanceToAlpha"]),
    values: () =>
      textAttr(
        "矩阵值 values（20项）",
        "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
      ),
  },
});

export default feColorMatrix;
