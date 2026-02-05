import type { FeNodeFactory } from "./types";

const feOffset: FeNodeFactory = ({ textPort, textAttr }) => ({
  type: "feOffset",
  title: "偏移",
  description: "将输入图像在 x/y 方向平移，常用于阴影位移。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    dx: () => textAttr("水平偏移 dx", "10"),
    dy: () => textAttr("垂直偏移 dy", "10"),
  },
});

export default feOffset;
