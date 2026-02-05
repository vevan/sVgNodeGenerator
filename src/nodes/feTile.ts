import type { FeNodeFactory } from "./types";

const feTile: FeNodeFactory = ({ textPort }) => ({
  type: "feTile",
  title: "平铺",
  description: "将输入图像平铺填充滤镜区域。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
  },
});

export default feTile;
