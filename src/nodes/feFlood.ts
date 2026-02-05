import type { FeNodeFactory } from "./types";

const feFlood: FeNodeFactory = ({ textAttr }) => ({
  type: "feFlood",
  title: "填充",
  description: "生成一块纯色图像，可与其它节点合成。",
  inputs: {
    "flood-color": () => textAttr("填充颜色 flood-color", "#ffffff"),
    "flood-opacity": () => textAttr("透明度 flood-opacity", "1"),
  },
});

export default feFlood;
