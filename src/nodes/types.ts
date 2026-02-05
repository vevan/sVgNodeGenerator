export type FeNodeDefinition = {
  type: string;
  title: string;
  description: string;
  inputs: Record<string, () => any>;
  outputs?: Record<string, () => any>;
  onCreate?: (node: any) => void;
  onPlaced?: (node: any) => void;
};

export type FeNodeFactory = (helpers: {
  textPort: (label: string, value: string) => any;
  textAttr: (label: string, value: string) => any;
  selectAttr: (label: string, value: string, options: string[]) => any;
  textInfo: (text: string) => any;
  textControl: (label: string) => any;
  lightControl: (label: string) => any;
  groupDivider: (label: string) => any;
  imagePicker: (label: string) => any;
}) => FeNodeDefinition;
