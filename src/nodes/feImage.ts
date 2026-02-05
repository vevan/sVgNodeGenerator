import type { FeNodeFactory } from "./types";

const feImage: FeNodeFactory = ({ textAttr, selectAttr, imagePicker }) => ({
  type: "feImage",
  title: "图像",
  description: "引入外部图像或 SVG 作为滤镜输入。",
  inputs: {
    __picker: () => imagePicker("本地图片"),
    href: () => textAttr("链接 href", ""),
    xlinkHref: () => textAttr("链接 xlink:href", ""),
    x: () => textAttr("x", "0"),
    y: () => textAttr("y", "0"),
    width: () => textAttr("width", ""),
    height: () => textAttr("height", ""),
    preserveAspectRatio: () =>
      selectAttr("preserveAspectRatio", "xMidYMid meet", [
        "none",
        "xMinYMin meet",
        "xMidYMin meet",
        "xMaxYMin meet",
        "xMinYMid meet",
        "xMidYMid meet",
        "xMaxYMid meet",
        "xMinYMax meet",
        "xMidYMax meet",
        "xMaxYMax meet",
        "xMinYMin slice",
        "xMidYMin slice",
        "xMaxYMin slice",
        "xMinYMid slice",
        "xMidYMid slice",
        "xMaxYMid slice",
        "xMinYMax slice",
        "xMidYMax slice",
        "xMaxYMax slice",
      ]),
    crossOrigin: () =>
      selectAttr("crossorigin", "anonymous", ["anonymous", "use-credentials", ""]),
  },
});

export default feImage;
