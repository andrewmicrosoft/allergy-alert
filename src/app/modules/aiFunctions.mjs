import { AzureOpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables - handle both Node.js and Next.js environments
if (typeof window === 'undefined') {
  // Server-side: Load from .env file if it exists
  try {
    dotenv.config({ path: '.env' });
  } catch (error) {
    // If .env file doesn't exist, continue with system environment variables
    console.log('.env file not found, using system environment variables');
  }
} else {
  // Client-side: Next.js will handle environment variables
  // Only NEXT_PUBLIC_ prefixed variables are available on client-side
  console.log('Running in browser - using Next.js environment variables');
}

const FoodItemSchema = z.object({
  name: z.string().describe("The name of the food item"),
  safetyClassification: z.enum(["More Safe", "Questionable", "Avoid"]).describe("The safety classification of the food item based on allergies"),
  reasoning: z.string().describe("The reason that this particular food item is classified as either more safe, questionable, or avoid."),
  questions: z.string().describe("Any questions to ask restaurant staff or considerations regarding the food item and allergies"),
});

const MenuSchema = z.object({
  restaurantName: z.string().describe("The name of the restaurant"),
  restaurantInfo: z.string().describe("A general description of the allergens expected to be found in the food of the restaurant. Should somebody with my allergenies be cautious eating here?"),
  foods : z.array(FoodItemSchema).describe("List of food items with their safety classifications"),
});

export async function getSafeFoodsByRestaurantName(restaurantName, allergies) {

// Get environment variables - handle both server and client environments
const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const modelName = process.env.AZURE_OPENAI_MODEL_NAME || process.env.NEXT_PUBLIC_AZURE_OPENAI_MODEL_NAME || "gpt-4o";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
const dangerouslyAllowBrowser = true;

// Check for required environment variables
if (!apiKey) {
  throw new Error("Missing required environment variable: AZURE_OPENAI_API_KEY");
}
if (!endpoint) {
  throw new Error("Missing required environment variable: AZURE_OPENAI_ENDPOINT");
}

const options = { endpoint, apiKey, deployment, apiVersion, dangerouslyAllowBrowser }

const client = new AzureOpenAI(options);

  // Format the allergies list for the prompt
  const allergiesList = allergies && allergies.length > 0 
    ? allergies.join(', ') 
    : 'no specific allergies mentioned';

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant who is helping users figure out which food from restaurants are safe to eat or not based on their allergies. Since this is a safety issue, please be thorough in your analysis and include every single food item from the restaurant." },
      { role:"user", content: `I have allergies to: ${allergiesList}. I am planning to eat at ${restaurantName}. Can you help me identify menu items that would be safe for me to eat and which ones I should avoid? If there is an official allergen menu, please use that. Organize the different foods into three categories: 1. More Safe, 2. Questionable, 3. Avoid. For every food item, please include one or more questions that I could ask the restaurant staff that would help clarify its safety. Include every food item on the menu in your response. Please include at least 50 objects in the json response. Make sure you include every food item from the restaurant's menu.` }
    ],
    max_tokens: 16384,
      temperature: 1,
      top_p: 1,
      model: modelName,
      response_format: zodResponseFormat(MenuSchema, 'menuSchema')
  });

  const responseText = response.choices[0].message.content;

  console.log(responseText);

  return responseText
}

// Example usage with sample data
getSafeFoodsByRestaurantName("McDonald's", ["peanuts", "shellfish"]).catch((err) => {
  console.error("The sample encountered an error:", err);
});