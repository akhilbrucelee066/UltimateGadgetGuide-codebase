import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = '';
const MODEL_NAME = "gemini-2.0-flash";

const genAI = new GoogleGenerativeAI(API_KEY);

export const summarizeArticle = async (title, description, url) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are my blog writer API and you just take the input and provide js object of engaging summarized detailed blog which should stick to facts in the original post from given source link and summary will just optimal articulated refined version of original post.

To Do:
Write a short, engaging blog post by going through source [title , description,  source_url]. It should include a summary[in a format] of the original post[summarize in such a way that it gives exact information in the original post by in a detailed intresting and optimal way].

Guidelines: 
- return nothing other than JSON object.
- don't return null or undefined or NA. just summarize the article into engaging summarization.
- just stick to context and content and maintain human-like articulation.
- importantly NEVER return any other text with the response. just respond nothing but JSON in valid schema.

Input:
- article_title: ${title}
- article_description: ${description}
- article_url: ${url}

Output Format (strictly json 'schema'): {
  "type": "object",
  "properties": {
    "TakeAway_points_10": {
      "type": "object",
      "properties": {
        "1": { "type": "string" },
        "2": { "type": "string" },
        "3": { "type": "string" },
        "4": { "type": "string" },
        "5": { "type": "string" },
        "6": { "type": "string" },
        "7": { "type": "string" },
        "8": { "type": "string" },
        "9": { "type": "string" },
        "10": { "type": "string" }
      },
      "required": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    },
    "Summary_in_650_words": { "type": "string" },
    "Conclusion_in_45_words": { "type": "string" }
  },
  "required": ["TakeAway_points_10", "Summary_in_650_words", "Conclusion_in_45_words"]
}`;

  const generationConfig = {
    temperature: 1.2,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        TakeAway_points_10: {
          type: "object",
          properties: {
            1: { type: "string" },
            2: { type: "string" },
            3: { type: "string" },
            4: { type: "string" },
            5: { type: "string" },
            6: { type: "string" },
            7: { type: "string" },
            8: { type: "string" },
            9: { type: "string" },
            10: { type: "string" }
          },
          required: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        },
        Summary_in_650_words: { type: "string" },
        Conclusion_in_45_words: { type: "string" }
      },
      required: ["TakeAway_points_10", "Summary_in_650_words", "Conclusion_in_45_words"]
    },
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
