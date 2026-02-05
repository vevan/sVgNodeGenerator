type DynamicInputsOptions = {
  baseKey: string;
  labelPrefix: string;
  minCount: number;
  initialCount?: number;
  createInput: (index: number, key: string, label: string) => any;
};

type AnyNode = {
  inputs: Record<string, any>;
  __dynamicInputOptions?: DynamicInputsOptions;
  hooks?: {
    beforeLoad?: {
      subscribe: (token: string, handler: (state: any) => any) => void;
    };
  };
};

const toIndex = (key: string, baseKey: string) => {
  const raw = key.slice(baseKey.length);
  const index = Number.parseInt(raw, 10);
  return Number.isFinite(index) ? index : 0;
};

const getOptions = (node: AnyNode) => {
  const options = node.__dynamicInputOptions;
  if (!options) {
    throw new Error("Dynamic input options not attached.");
  }
  return options;
};

const getKeys = (node: AnyNode) => {
  const options = getOptions(node);
  return Object.keys(node.inputs).filter((key) => key.startsWith(options.baseKey));
};

const getSortedKeys = (node: AnyNode) => {
  const options = getOptions(node);
  return getKeys(node).sort(
    (a, b) => toIndex(a, options.baseKey) - toIndex(b, options.baseKey)
  );
};

const getNextIndex = (node: AnyNode) => {
  const options = getOptions(node);
  const indices = getKeys(node).map((key) => toIndex(key, options.baseKey));
  let i = 1;
  while (indices.includes(i)) {
    i += 1;
  }
  return i;
};

export const addDynamicInput = (node: AnyNode, index?: number) => {
  const options = getOptions(node);
  const idx = index ?? getNextIndex(node);
  const key = `${options.baseKey}${idx}`;
  if (node.inputs[key]) {
    return;
  }
  const label = `${options.labelPrefix} ${key}`;
  const input = options.createInput(idx, key, label);
  (input as any).__section = "input";
  (node as any).addInput(key, input);
  (node as any).__dynamicInputsVersion = ((node as any).__dynamicInputsVersion ?? 0) + 1;
};

export const removeDynamicInput = (node: AnyNode) => {
  const options = getOptions(node);
  const keys = getSortedKeys(node);
  if (keys.length <= options.minCount) {
    return;
  }
  const key = keys[keys.length - 1];
  (node as any).removeInput(key);
  (node as any).__dynamicInputsVersion = ((node as any).__dynamicInputsVersion ?? 0) + 1;
};

export const listDynamicInputKeys = (node: AnyNode) => getSortedKeys(node);

const ensureCount = (node: AnyNode, count: number) => {
  const current = getKeys(node).length;
  for (let i = current + 1; i <= count; i += 1) {
    addDynamicInput(node, i);
  }
};

const ensureFromState = (node: AnyNode, state: any) => {
  const options = getOptions(node);
  const inputs = state?.inputs || {};
  Object.keys(inputs)
    .filter((key) => key.startsWith(options.baseKey))
    .forEach((key) => {
      if (!node.inputs[key]) {
        const idx = toIndex(key, options.baseKey);
        addDynamicInput(node, idx || undefined);
      }
    });
};

export const attachDynamicInputs = (node: AnyNode, options: DynamicInputsOptions) => {
  if (!node.__dynamicInputOptions) {
    node.__dynamicInputOptions = options;
  }

  node.hooks?.beforeLoad?.subscribe("dynamicInputs", (state) => {
    ensureFromState(node, state);
    return state;
  });

  ensureCount(node, options.initialCount ?? options.minCount);
};
