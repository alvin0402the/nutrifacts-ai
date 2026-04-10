import { GoogleGenAI, Type } from "@google/genai";
import { FoodData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFoodNutrition(foodName: string): Promise<FoodData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide an extremely detailed nutritional and scientific analysis for "${foodName}". 
    You MUST synthesize information from the following specific sources:
    - Wikipedia: Use for general botanical/biological facts and historical context.
    - Reddit: Use for identifying common culinary uses, anecdotal health perceptions, and practical consumer tips.
    - Scientific Study Websites (PubMed, Nature, Elsevier, ScienceDirect): Use as the PRIMARY source for all nutritional values, amino acid profiles, fatty acid breakdowns, and enzymatic data.
    
    Include:
    1. Macronutrients (Protein, Fat, Carbs).
    2. A deep breakdown of Protein into its constituent amino acids.
    3. A deep breakdown of Fats into saturated, monounsaturated, polyunsaturated, and specific fatty acids (e.g., Omega-3, Omega-6).
    4. Comprehensive Vitamins and Minerals.
    5. Natural enzymes present in the food (e.g., Bromelain in Pineapple, Papain in Papaya, or general digestive enzymes).
    6. For each nutrient and enzyme, provide a detailed "benefit" string explaining its biological role based on clinical research.
    7. Provide 3-5 long, in-depth scientific study summaries. Each summary should be at least 3-4 sentences long, explaining the methodology and results.
    8. Generate a "visualDescription" field: This MUST start with: 'A top-down grocery store product photo of...'. You MUST include the phrase 'sitting on a plain wooden kitchen table'. The photo MUST contain ONLY the searched item; DO NOT include any other foods, garnishes, side dishes, or people. DO NOT use metaphors (no 'journeys', 'roads', 'nature', 'growth', or 'scenery'). Use 'Bright indoor kitchen light' instead of studio lighting or 8k. If the food is Spinach, the prompt must say: 'A pile of fresh green spinach leaves'. For other foods, use a similar literal description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          servingSize: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
            },
            required: ["protein", "fat", "carbs"],
          },
          proteinBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          fatBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          vitamins: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          minerals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          other: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          enzymes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                dailyValue: { type: Type.NUMBER },
                benefit: { type: Type.STRING },
              },
              required: ["name", "amount", "unit", "dailyValue", "benefit"],
            },
          },
          studies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyFinding: { type: Type.STRING },
              },
              required: ["title", "summary", "keyFinding"],
            },
          },
          imageUrl: { 
            type: Type.STRING,
            description: "A URL to a high-quality image of the food. Use https://loremflickr.com/800/600/{common_food_name_only},food,isolated to ensure the image contains ONLY the searched item. Ensure the keyword uses ONLY the food's common name."
          },
          visualDescription: {
            type: Type.STRING,
            description: "A top-down grocery store product photo prompt containing ONLY the searched item with no garnishes or side dishes."
          },
          category: {
            type: Type.STRING,
            enum: ["Vegetables", "Fruit", "Meat", "Dairy", "Grains", "Other"],
            description: "The primary food category this item belongs to."
          },
        },
        required: ["name", "servingSize", "calories", "macros", "vitamins", "minerals", "other", "studies", "proteinBreakdown", "fatBreakdown", "imageUrl", "category", "visualDescription", "enzymes"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to get nutritional data");
  }

  return JSON.parse(response.text.trim());
}

export interface EncyclopediaArticle {
  title: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
  }[];
  keyTakeaways: string[];
  sources: string[];
}

export async function getEncyclopediaArticle(topic: string): Promise<EncyclopediaArticle> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a comprehensive, scientifically-backed encyclopedia article about "${topic}". 
    Synthesize information from Wikipedia, Reddit, and major scientific journals (PubMed, Nature, etc.).
    The article should be structured for a health-conscious audience.
    
    Include:
    1. A clear, high-level summary.
    2. Multiple detailed sections with headings (e.g., "What is it?", "Biological Function", "How to Optimize/Increase", "Risks/Side Effects").
    3. A list of key takeaways.
    4. A list of reputable sources used.
    
    Format the response as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["heading", "content"],
            },
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          sources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "summary", "sections", "keyTakeaways", "sources"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate article");
  }

  return JSON.parse(response.text.trim());
}
