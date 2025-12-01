// OpenRouter AI Service (OpenAI SDK compatible)
// Using OpenRouter for better reliability and multiple model support

export const generateTweetIdeas = async (
  apiKey: string,
  topic: string,
  sentiment: string = 'inspiring, energetic, and slightly futuristic',
  count: number = 3
): Promise<string[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://auto-post-on-x.onrender.com',
        'X-Title': 'X-Bot Auto Post',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Fast and free
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media expert specializing in engaging Twitter content for a futuristic fitness brand called Space Runner.',
          },
          {
            role: 'user',
            content: `Generate ${count} unique tweet ideas about "${topic}". Tone: ${sentiment}. Keep each under 280 characters. Return as a JSON array of strings.`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, split by newlines
      return content.split('\n').filter((line: string) => line.trim().length > 0);
    }

    return [content];
  } catch (error) {
    console.error('Error generating tweet ideas:', error);
    throw error;
  }
};

export const checkGrammarAndTone = async (apiKey: string, content: string): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://auto-post-on-x.onrender.com',
        'X-Title': 'X-Bot Auto Post',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional editor. Improve the grammar, tone, and engagement of social media posts while keeping them under 280 characters.',
          },
          {
            role: 'user',
            content: `Improve this tweet: "${content}"`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error checking grammar:', error);
    throw error;
  }
};