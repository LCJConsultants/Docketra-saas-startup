import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  // Plain text
  if (
    mimeType === "text/plain" ||
    ext === "txt"
  ) {
    return buffer.toString("utf-8");
  }

  // DOCX
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // DOC (older Word format) — mammoth has limited support but can attempt
  if (
    mimeType === "application/msword" ||
    ext === "doc"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // PDF
  if (
    mimeType === "application/pdf" ||
    ext === "pdf"
  ) {
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await pdf.getText();
    await pdf.destroy();
    return result.text;
  }

  throw new Error(
    `Unsupported file type: ${mimeType || ext}. Supported types: PDF, DOCX, DOC, TXT.`
  );
}
