// main.js
import { generateImage, uploadImageToAppwrite } from "./utils.js";

const prompt = process.argv[2] || "A futuristic city at sunset";

(async () => {
  try {
    const imagePath = await generateImage(prompt);
    console.log(`Image created at: ${imagePath}`);
    console.log("Uploading to Appwrite...");
    const uploadResult = await uploadImageToAppwrite(imagePath);
    console.log(`Upload complete! File ID: ${uploadResult.$id}`);
  } catch (error) {
    console.error("Failed:", error.message);
  }
})();
