import BaseAIProvider from "./BaseAIProvider";
import { AIProvider, ModalityType } from "@/shared/types/ai";

export default class DalleProvider extends BaseAIProvider {
  constructor() {
    super(AIProvider.DALLE, [ModalityType.IMAGE]);
  }
}
