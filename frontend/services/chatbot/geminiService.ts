import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "Anomalyse", a fraud support assistant.

**Style & Tone:**
- **Concise:** Keep responses UNDER 50 words.
- **Direct:** Use active voice.
- **Interactive:** Ask a question at the end to guide the next step.

**Flow:**
1. **User Choice:** The user will tell you what they want to do (Freeze, Transactions, or Contact).
2. **If 'Freeze':** Guide them to Card Settings > Freeze. Then ask: "Did you find the freeze button?"
3. **If 'Transactions':** Ask them to check the last 24 hours of activity. Then ask: "Do you see any charges you didn't make?"
4. **If 'Contact':** Provide number 1-800-942-8812.
5. **If Undecided:** Recommend freezing the card first as a safety precaution.

**Rules:**
- Do NOT ask for alert details.
- Do NOT ask for personal info.
`;

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private modelName = 'gemini-3-flash-preview';

  private getAIInstance(): GoogleGenAI {
    if (this.ai) return this.ai;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("Gemini API Key loaded:", apiKey ? "Found (starts with " + apiKey.substring(0, 5) + "...)" : "Not found");
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
    }

    this.ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
    return this.ai;
  }

  public initChat(): void {
    try {
      const ai = this.getAIInstance();
      this.chatSession = ai.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.5,
        },
      });
    } catch (error) {
      console.error("Chat initialization failed:", error);
    }
  }

  public async sendMessageStream(message: string): Promise<AsyncIterable<string>> {
    if (!this.chatSession) {
      this.initChat();
    }

    if (!this.chatSession) {
      throw new Error("Failed to initialize chat session.");
    }

    const result = await this.chatSession.sendMessageStream({ message });
    
    // Create a generator to yield text chunks
    async function* textGenerator() {
      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    }

    return textGenerator();
  }
}

export const geminiService = new GeminiService();