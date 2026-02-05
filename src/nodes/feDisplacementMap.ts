import type { FeNodeFactory } from "./types";

const feDisplacementMap: FeNodeFactory = ({ textPort, textAttr, selectAttr }) => ({
  type: "feDisplacementMap",
  title: "位移贴图",
  description: "使用第二路输入作为位移图扭曲第一路输入。",
  inputs: {
    in: () => textPort("输入 in（被扭曲）", "SourceGraphic"),
    in2: () => textPort("输入 in2（位移图）", "SourceGraphic"),
    scale: () => textAttr("强度 scale", "20"),
    xChannelSelector: () =>
      selectAttr("X 通道 xChannelSelector", "R", ["R", "G", "B", "A"]),
    yChannelSelector: () =>
      selectAttr("Y 通道 yChannelSelector", "G", ["R", "G", "B", "A"]),
  },
});

export default feDisplacementMap;
