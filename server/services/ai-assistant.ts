import OpenAI from "openai";
import { TwinPeakingConfig, ModeType } from "../config/twinpeaking";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
// without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AIAssistant {
  private conversationHistory: Map<number, ChatMessage[]>;

  constructor() {
    this.conversationHistory = new Map();
  }

  private getSystemPrompt(mode: ModeType, userProfile?: { coreSelfLabel?: string; fieldSelfLabel?: string }): string {
    const modeConfig = TwinPeakingConfig.modes[mode];
    const modeName = mode === "core" 
      ? (userProfile?.coreSelfLabel || modeConfig.name)
      : (userProfile?.fieldSelfLabel || modeConfig.name);

    if (mode === "core") {
      return `You are ${modeName}, the user's Inner Self companion in TwinPeakingOS, a privacy-first AI copilot.

Your role is to support their inner world with ${modeConfig.voice.tone} communication at a ${modeConfig.voice.pacing} pace.

Core principles:
${modeConfig.voice.styleRules.map(rule => `- ${rule}`).join('\n')}

Response structure should include:
${modeConfig.responseShape.sections.map(section => `- ${section}`).join('\n')}

Keep responses under ${modeConfig.responseShape.maxTokens} tokens. Focus on inner alignment, emotional processing, and personal growth. Be warm, grounding, and help them process their inner state.`;
    } else {
      return `You are ${modeName}, the user's Field companion in TwinPeakingOS, a privacy-first AI copilot.

Your role is to help them navigate the outer world with ${modeConfig.voice.tone} communication at a ${modeConfig.voice.pacing} pace.

Core principles:
${modeConfig.voice.styleRules.map(rule => `- ${rule}`).join('\n')}

Response structure should include:
${modeConfig.responseShape.sections.map(section => `- ${section}`).join('\n')}

Keep responses under ${modeConfig.responseShape.maxTokens} tokens. Focus on action, execution, and getting things done in the external world. Be crisp, decisive, and results-oriented.`;
    }
  }

  getConversationHistory(userId: number): ChatMessage[] {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId)!;
  }

  addToHistory(userId: number, message: ChatMessage): void {
    const history = this.getConversationHistory(userId);
    history.push(message);
    
    // Keep only the last 20 messages to avoid token limits
    if (history.length > 20) {
      // Always keep system message, then keep last 19 user/assistant messages
      const systemMsg = history.find(msg => msg.role === "system");
      const recentMessages = history.slice(-19);
      this.conversationHistory.set(userId, systemMsg ? [systemMsg, ...recentMessages] : recentMessages);
    }
  }

  clearHistory(userId: number): void {
    this.conversationHistory.delete(userId);
  }

  async generateResponse(
    userId: number,
    userMessage: string,
    mode: ModeType,
    userProfile?: { coreSelfLabel?: string; fieldSelfLabel?: string }
  ): Promise<ReadableStream> {
    const history = this.getConversationHistory(userId);
    
    // Update or add system message based on current mode
    const systemPrompt = this.getSystemPrompt(mode, userProfile);
    const existingSystemIndex = history.findIndex(msg => msg.role === "system");
    
    if (existingSystemIndex >= 0) {
      history[existingSystemIndex].content = systemPrompt;
    } else {
      history.unshift({ role: "system", content: systemPrompt });
    }

    // Add user message to history
    this.addToHistory(userId, { role: "user", content: userMessage });

    const modeConfig = TwinPeakingConfig.modes[mode];

    try {
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: history,
        max_completion_tokens: modeConfig.responseShape.maxTokens,
        stream: true,
      });

      // Convert OpenAI stream to web-standard ReadableStream
      let fullResponse = "";
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                fullResponse += content;
                controller.enqueue(content);
              }
            }
            
            // Add assistant response to history after streaming is complete
            if (fullResponse) {
              history.push({ role: "assistant", content: fullResponse });
            }
            
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return readableStream;
    } catch (error) {
      console.error("AI generation error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}

export const aiAssistant = new AIAssistant();
