import BaseAIProvider from "./BaseAIProvider";
import { AIProvider, ModalityType } from "@/shared/types/ai";

export default class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super(AIProvider.OPENAI, [
      ModalityType.TEXT,
      ModalityType.IMAGE,
      ModalityType.AUDIO,
    ]);
  }
}
