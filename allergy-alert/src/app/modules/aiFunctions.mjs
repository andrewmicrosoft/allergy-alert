import { AzureOpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const endpoint = "https://test-project-foundry-resource.cognitiveservices.azure.com/";
const modelName = "gpt-5-chat";
const deployment = "gpt-5-chat";

const FoodItemSchema = z.object({
  name: z.string().describe("The name of the food item"),
  safetyClassification: z.enum(["More Safe", "Questionable", "Avoid"]).describe("The safety classification of the food item based on allergies"),
  questions: z.string().describe("Any questions to ask restaurant staff or considerations regarding the food item and allergies"),
});

const MenuSchema = z.object({
  restaurantName: z.string().describe("The name of the restaurant"),
  foods : z.array(FoodItemSchema).describe("List of food items with their safety classifications"),
});

export async function getSafeFoodsByRestaurantName(restaurantName, allergies) {

const apiKey = "";
const apiVersion = "2024-08-01-preview";
const endpoint = "https://test-project-foundry-resource.cognitiveservices.azure.com/";
const modelName = "gpt-4o";
const deployment = "gpt-4o";
const options = { endpoint, apiKey, deployment, apiVersion }

const client = new AzureOpenAI(options);

  // Format the allergies list for the prompt
  const allergiesList = allergies && allergies.length > 0 
    ? allergies.join(', ') 
    : 'no specific allergies mentioned';

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant who is helping users figure out which food from restaurants are safe to eat or not based on their allergies. Do not include any follow-up suggestions." },
      { role:"user", content: `I have allergies to: ${allergiesList}. I am planning to eat at ${restaurantName}. Can you help me identify menu items that would be safe for me to eat and which ones I should avoid? If there is an official allergen menu, please use that. Organize the different foods into three categories: 1. More Safe, 2. Questionable, 3. Avoid. For every food item, please include one or more questions that I could ask the restaurant staff that would help clarify its safety. Include every food item on the menu in your response. Please format your response using markdown with clear headers and bullet points for easy reading. Do not include any follow-up suggestions. Please include at least 30 objects in the json response.` }
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