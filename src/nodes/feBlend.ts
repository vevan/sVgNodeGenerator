import type { FeNodeFactory } from "./types";

const feBlend: FeNodeFactory = ({ textPort, selectAttr }) => ({
  type: "feBlend",
  title: "混合",
  description: "将两路输入按指定模式混合。",
  inputs: {
    in: () => textPort("输入 in（底图）", "SourceGraphic"),
    in2: () => textPort("输入 in2（叠加）", "SourceGraphic"),
    mode: () =>
      selectAttr("混合模式 mode", "multiply", [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ]),
  },
});

export default feBlend;
