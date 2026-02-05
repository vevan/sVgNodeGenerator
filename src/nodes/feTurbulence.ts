import type { FeNodeFactory } from "./types";

const feTurbulence: FeNodeFactory = ({ textAttr, selectAttr }) => ({
  type: "feTurbulence",
  title: "湍流噪声",
  description: "生成分形噪声或湍流，用于材质与位移。",
  inputs: {
    type: () =>
      selectAttr("类型 type", "turbulence", ["turbulence", "fractalNoise"]),
    baseFrequency: () => textAttr("基础频率 baseFrequency", "0.02"),
    numOctaves: () => textAttr("倍频数 numOctaves", "1"),
    seed: () => textAttr("随机种子 seed", "1"),
    stitchTiles: () =>
      selectAttr("拼接 stitchTiles", "noStitch", ["noStitch", "stitch"]),
  },
});

export default feTurbulence;
