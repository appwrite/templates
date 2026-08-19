import { GoogleGenAI,Modality } from "@google/genai";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
import AppwriteService from './appwrite.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const ai = new GoogleGenAI({
apiKey:process.env.GEMINI_API_KEY
});

// Ensure output directory exists
const outputDir = path.resolve(__dirname, "../output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Get next available image number
function getNextImageNumber(baseName = "gemini-image") {
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(baseName) && f.endsWith(".png"));
  const numbers = files.map(f => {
    const match = f.match(/(\d+)\.png$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

export async function generateImage(prompt) {
    const imageNumber = getNextImageNumber();
    const outputName = path.join(outputDir, `gemini-image-${imageNumber}.png`);
  try {
    const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-preview-image-generation',
      contents: prompt,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] }
    });

    // Validate that we got at least one candidate back
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = response.candidates[0];
    // Validate structure of the first candidate
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(outputName, buffer);
        console.log(`Image saved as ${outputName}`);
        return outputName;
      }
    }

    throw new Error("No image data returned from Gemini API");
  } catch (err) {
    console.error("Error generating image:", err);
    throw err;
  }
}

export async function uploadImageToAppwrite(imagePath) {
  try {
    const bucketId = process.env.APPWRITE_BUCKET_ID ?? 'Generated_Images';
    const apiKey = process.env.APPWRITE_FUNCTION_API_KEY;

    if (!apiKey) {
      throw new Error("APPWRITE_FUNCTION_API_KEY is not set in environment variables");
    }

    const appwrite = new AppwriteService(apiKey);

    // Check if bucket exists, create if it doesn't
    if (!(await appwrite.doesGeneratedImageBucketExist(bucketId))) {
      await appwrite.setupGeneratedImageBucket(bucketId);
      console.log(`Bucket '${bucketId}' created`);
    }

    // Upload the file
    const result = await appwrite.createFileFromPath(bucketId, imagePath);
    console.log(`Image uploaded to Appwrite with file ID: ${result.$id}`);
    
    return result;
  } catch (err) {
    console.error("Error uploading image to Appwrite:", err.message);
    throw err;
  }
}

