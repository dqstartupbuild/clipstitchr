export type OpenAiComputerAction =
  | {
      button?: string;
      keys?: string[];
      type: "click";
      x: number;
      y: number;
    }
  | {
      button?: string;
      keys?: string[];
      type: "double_click";
      x: number;
      y: number;
    }
  | {
      keys?: string[];
      scrollX?: number;
      scrollY?: number;
      type: "scroll";
      x: number;
      y: number;
    }
  | {
      text: string;
      type: "type";
    }
  | {
      keys: string[];
      type: "keypress";
    }
  | {
      keys?: string[];
      path: Array<[number, number] | { x: number; y: number }>;
      type: "drag";
    }
  | {
      keys?: string[];
      type: "move";
      x: number;
      y: number;
    }
  | {
      type: "screenshot";
    }
  | {
      type: "wait";
    };
