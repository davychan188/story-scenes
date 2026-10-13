import type { GrammarTip } from "./grammar";
import type { Provider } from "./llm";

export type Scene = {
  index: number;
  title: string;
  caption: string;
  imagePrompt: string;
  imageUrl?: string | null;
};

export type StoryResponse = {
  provider: Provider;
  demoMode: boolean;
  correctedText: string;
  tips: GrammarTip[];
  scenes: Scene[];
  error?: string;
};

export type StatusResponse = {
  provider: Provider;
  demoMode: boolean;
  textModel: string | null;
  imageModel: string | null;
};
