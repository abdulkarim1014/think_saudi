
import { GoogleGenAI, Type } from "@google/genai";
import { TweetAnalysis, TweetMode } from "../types";

// Initialize the Google GenAI SDK
// Using gemini-3-flash-preview for general text tasks
// Using gemini-2.5-flash-image for image generation

function cleanAndParseJSON(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return null;
  }
}

const checkQuotaError = (error: any) => {
  const errorStr = JSON.stringify(error).toLowerCase();
  if (
    error.message?.includes('429') || 
    error.message?.includes('quota') || 
    errorStr.includes('resource_exhausted') ||
    errorStr.includes('limit_reached')
  ) {
    throw new Error('QUOTA_EXCEEDED');
  }
};

// Fix: analyzeWritingStyle uses correct Model and property access for .text
export const analyzeWritingStyle = async (samples: string): Promise<{ description: string; traits: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      contents: `Analyze tweets to determine "Style DNA". Tweets: "${samples}". Return JSON with description (Arabic) and 3-5 traits.`
    });
    const data = cleanAndParseJSON(response.text || "{}");
    return data || { description: "تم التحليل", traits: ["عام"] };
  } catch (error: any) {
    checkQuotaError(error);
    return { description: "تحليل قياسي", traits: ["Standard"] };
  }
};

// Fix: analyzeTweetDraft uses correct Model and property access for .text
export const analyzeTweetDraft = async (draft: string, mode: TweetMode, styleDNA?: string): Promise<TweetAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let prompt = '';
    const memeInstructions = `
      - "reactionSearchQuery": Short English keywords for Giphy.
      - "memeKeywordsArabic": Arabic search terms for Pinterest.
      - "memeCaption": A short, funny Arabic punchline reflecting the tweet content.
    `;

    if (mode === 'REPLY') {
        prompt = `Write a high-quality Arabic REPLY to: "${draft}" ${styleDNA ? `Persona: "${styleDNA}"` : ''} ... improvedVersion, critique, explanation, hashtags, score, reactionSearchQuery, memeKeywordsArabic, memeCaption.`;
    } else {
        prompt = `Improve this Arabic tweet: "${draft}" ${styleDNA ? `Style: "${styleDNA}"` : ''} ... improvedVersion, critique, explanation, hashtags, score, reactionSearchQuery, memeKeywordsArabic, memeCaption.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedVersion: { type: Type.STRING },
            critique: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.INTEGER },
            reactionSearchQuery: { type: Type.STRING },
            memeKeywordsArabic: { type: Type.STRING },
            memeCaption: { type: Type.STRING }
          }
        }
      },
      contents: prompt
    });

    const data = cleanAndParseJSON(response.text || "{}");
    return {
        improvedVersion: data.improvedVersion || draft,
        critique: data.critique || [],
        explanation: data.explanation || "Updated.",
        hashtags: data.hashtags || [],
        score: data.score || 50,
        reactionSearchQuery: data.reactionSearchQuery || "funny reaction",
        memeKeywordsArabic: data.memeKeywordsArabic || "رياكشن مضحك",
        memeCaption: data.memeCaption || ""
    };
  } catch (error: any) {
    checkQuotaError(error);
    return { improvedVersion: draft, critique: [], explanation: "", hashtags: [], score: 0 };
  }
};

export const findMatchingMeme = async (query: string): Promise<string[]> => {
  return [
      `https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXdleWljYmR2eWljYmR2eWljYmR2/giphy.gif?q=${encodeURIComponent(query)}`,
      "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif"
  ];
};

// Fix: generateSocialImage follows image generation guidelines for gemini-2.5-flash-image
export const generateSocialImage = async (promptText: string, caption?: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const finalPrompt = caption 
            ? `A cinematic high-quality Arabic meme reaction image. Context: ${promptText}. No text on image.` 
            : `Abstract background: ${promptText}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: finalPrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error: any) {
        checkQuotaError(error);
        return null;
    }
};

// Fix: generateThread uses correct Model and property access for .text
export const generateThread = async (text: string, psychologyMode: boolean): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: { responseMimeType: 'application/json' },
      contents: `Split into Arabic Twitter thread: "${text}".`
    });
    return cleanAndParseJSON(response.text || "[]") || [];
  } catch (error) {
    checkQuotaError(error);
    return [];
  }
};

// Fix: generateBio uses correct Model and property access for .text
export const generateBio = async (info: string, niche: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write Arabic Bio for: ${info}, niche: ${niche}.`
    });
    return response.text?.trim() || "";
  } catch (error) {
    checkQuotaError(error);
    return "";
  }
};

// Added missing fetchTrendingTopics function
export const fetchTrendingTopics = async (niche: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 5 trending or popular topics within the "${niche}" niche on X/Twitter. Return as a JSON array of strings in Arabic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(response.text || "[]") || [];
  } catch (error) {
    checkQuotaError(error);
    return [];
  }
};

// Added missing generatePlanIdeas function
export const generatePlanIdeas = async (niche: string): Promise<any[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 4 creative content ideas for a social media strategy in the "${niche}" niche. Include title, category (High/Medium/Low), type (Thread/Tweet/Poll/Image), and description. Return as a JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "category", "type", "description"]
          }
        }
      }
    });
    return cleanAndParseJSON(response.text || "[]") || [];
  } catch (error) {
    checkQuotaError(error);
    return [];
  }
};
