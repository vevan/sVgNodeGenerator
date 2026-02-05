import type { FeNodeFactory } from "./types";

const feDropShadow: FeNodeFactory = ({ textPort, textAttr }) => ({
  type: "feDropShadow",
  title: "投影",
  description: "基于偏移 + 模糊生成投影。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    dx: () => textAttr("水平偏移 dx", "0"),
    dy: () => textAttr("垂直偏移 dy", "4"),
    stdDeviation: () => textAttr("模糊半径 stdDeviation", "4"),
    "flood-color": () => textAttr("投影颜色 flood-color", "#000000"),
    "flood-opacity": () => textAttr("透明度 flood-opacity", "0.5"),
  },
});

export default feDropShadow;
