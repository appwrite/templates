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

/**
 * Compute the next sequential image index for files with the given base name in the output directory.
 * @param {string} [baseName="gemini-image"] - Filename prefix to match (files must end with `.png`).
 * @returns {number} The next image number: one greater than the largest numeric suffix among matching PNG files, or 1 if none are found.
 */
function getNextImageNumber(baseName = "gemini-image") {
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(baseName) && f.endsWith(".png"));
  const numbers = files.map(f => {
    const match = f.match(/(\d+)\.png$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

/**
 * Generate an image from a text prompt using Gemini and save it to the output directory.
 * @param {string} prompt - The text prompt used to generate the image.
 * @returns {string} The filesystem path to the saved PNG image.
 * @throws {Error} If the Gemini API returns no candidates, the response structure is invalid, or no image data is present.
 */
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

/**
 * Upload a local image file to an Appwrite bucket, creating the bucket if it does not exist.
 * @param {string} imagePath - Local filesystem path of the image to upload.
 * @returns {object} The Appwrite file creation result object (includes `$id` and file metadata).
 * @throws {Error} If `APPWRITE_FUNCTION_API_KEY` is not set or if the upload operation fails.
 */
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
