import { TwinPeakingConfig, ModeType } from "../config/twinpeaking";

export class ModeClassifier {
  private manualOverride: ModeType | null = null;
  private overrideExpiry: number | null = null;

  setManualOverride(mode: ModeType, duration: number = 1800000): void {
    this.manualOverride = mode;
    this.overrideExpiry = Date.now() + duration;
  }

  clearManualOverride(): void {
    this.manualOverride = null;
    this.overrideExpiry = null;
  }

  classifyMessage(message: string): ModeType {
    if (this.manualOverride && this.overrideExpiry && Date.now() < this.overrideExpiry) {
      return this.manualOverride;
    }

    if (this.manualOverride && this.overrideExpiry && Date.now() >= this.overrideExpiry) {
      this.clearManualOverride();
    }

    const lowerMessage = message.toLowerCase();

    const innerWorldKeywords = TwinPeakingConfig.signals.intentKeywords.innerWorld;
    const outerWorldKeywords = TwinPeakingConfig.signals.intentKeywords.outerWorld;

    let innerScore = 0;
    let outerScore = 0;

    for (const keyword of innerWorldKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        innerScore += 1;
      }
    }

    for (const keyword of outerWorldKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        outerScore += 1;
      }
    }

    if (outerScore > innerScore) {
      return "field";
    } else if (innerScore > outerScore) {
      return "core";
    }

    return "core";
  }

  getCurrentMode(): ModeType | null {
    if (this.manualOverride && this.overrideExpiry && Date.now() < this.overrideExpiry) {
      return this.manualOverride;
    }
    return null;
  }
}
