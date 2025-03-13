
import { PalmReading } from "../services/PalmAnalysisService";

export interface ExtendedPalmReading extends PalmReading {
  translationNote?: string;
  language?: string;
}
