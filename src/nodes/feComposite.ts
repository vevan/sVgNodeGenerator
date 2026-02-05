import type { FeNodeFactory } from "./types";

const feComposite: FeNodeFactory = ({ textPort, textAttr, selectAttr }) => ({
  type: "feComposite",
  title: "复合",
  description: "对两路输入进行算子合成或算术合成。",
  inputs: {
    in: () => textPort("输入 in（底图）", "SourceGraphic"),
    in2: () => textPort("输入 in2（叠加）", "SourceGraphic"),
    operator: () =>
      selectAttr("算子 operator", "over", [
        "over",
        "in",
        "out",
        "atop",
        "xor",
        "arithmetic",
      ]),
    k1: () => textAttr("k1（仅 arithmetic）", "0"),
    k2: () => textAttr("k2（仅 arithmetic）", "0"),
    k3: () => textAttr("k3（仅 arithmetic）", "0"),
    k4: () => textAttr("k4（仅 arithmetic）", "0"),
  },
});

export default feComposite;
