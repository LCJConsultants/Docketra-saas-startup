/**
 * OCR utility for extracting text from images.
 *
 * This is a placeholder implementation. To enable real OCR, install
 * Tesseract.js (`npm install tesseract.js`) and replace the body of
 * this function with the actual recognition logic.
 */
export async function extractTextFromImage(_file: File): Promise<string> {
  // Placeholder - connect Tesseract.js or another OCR service for production use.
  //
  // Example with Tesseract.js:
  //   import Tesseract from "tesseract.js";
  //   const { data: { text } } = await Tesseract.recognize(file, "eng");
  //   return text;

  return "OCR processing placeholder - connect Tesseract.js";
}
