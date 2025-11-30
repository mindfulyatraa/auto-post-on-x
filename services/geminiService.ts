import { GoogleGenAI, Type } from "@google/genai";

export const generateTweetIdeas = async (
  apiKey: string, 
  topic: string, 
  sentiment: string = 'inspiring, energetic, and slightly futuristic', 
  count: number = 3
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });

  // Space Runner persona system instruction
  const systemInstruction = `You are the social media manager for 'Space Runner', a brand that combines futuristic sci-fi aesthetics with athletic motivation. 
  Your tone is ${sentiment}. 
  Keep tweets under 280 characters. 
  Use hashtags like #SpaceRunner, #FutureFitness, #RunTheGalaxy.
  Avoid generic advice; make it sound like it's coming from a runner on a spaceship.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} distinct tweet ideas about: ${topic}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const checkGrammarAndTone = async (apiKey: string, content: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Critique and improve this tweet for the 'Space Runner' brand (sci-fi/athletic theme). Keep it under 280 chars. Return only the improved version.\n\nTweet: "${content}"`,
  });

  return response.text || content;
};