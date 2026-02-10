import {
  FileText,
  Image,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  File,
  FileArchive,
  Presentation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  fileType: string | null | undefined;
  className?: string;
}

const iconMap: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  // PDF
  "application/pdf": { icon: FileText, color: "text-red-500" },
  pdf: { icon: FileText, color: "text-red-500" },

  // Word
  "application/msword": { icon: FileText, color: "text-blue-500" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
  },
  doc: { icon: FileText, color: "text-blue-500" },
  docx: { icon: FileText, color: "text-blue-500" },

  // Excel / Spreadsheet
  "application/vnd.ms-excel": { icon: FileSpreadsheet, color: "text-emerald-600" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: FileSpreadsheet,
    color: "text-emerald-600",
  },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600" },
  csv: { icon: FileSpreadsheet, color: "text-emerald-600" },

  // PowerPoint / Presentation
  "application/vnd.ms-powerpoint": { icon: Presentation, color: "text-orange-500" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    icon: Presentation,
    color: "text-orange-500",
  },
  ppt: { icon: Presentation, color: "text-orange-500" },
  pptx: { icon: Presentation, color: "text-orange-500" },

  // Images
  "image/jpeg": { icon: Image, color: "text-green-500" },
  "image/png": { icon: Image, color: "text-green-500" },
  "image/gif": { icon: Image, color: "text-green-500" },
  "image/webp": { icon: Image, color: "text-green-500" },
  "image/svg+xml": { icon: Image, color: "text-green-500" },
  jpg: { icon: Image, color: "text-green-500" },
  jpeg: { icon: Image, color: "text-green-500" },
  png: { icon: Image, color: "text-green-500" },
  gif: { icon: Image, color: "text-green-500" },
  webp: { icon: Image, color: "text-green-500" },
  svg: { icon: Image, color: "text-green-500" },

  // Video
  "video/mp4": { icon: FileVideo, color: "text-purple-500" },
  "video/quicktime": { icon: FileVideo, color: "text-purple-500" },
  mp4: { icon: FileVideo, color: "text-purple-500" },
  mov: { icon: FileVideo, color: "text-purple-500" },

  // Audio
  "audio/mpeg": { icon: FileAudio, color: "text-indigo-500" },
  "audio/wav": { icon: FileAudio, color: "text-indigo-500" },
  mp3: { icon: FileAudio, color: "text-indigo-500" },
  wav: { icon: FileAudio, color: "text-indigo-500" },

  // Archives
  "application/zip": { icon: FileArchive, color: "text-yellow-600" },
  "application/x-rar-compressed": { icon: FileArchive, color: "text-yellow-600" },
  zip: { icon: FileArchive, color: "text-yellow-600" },
  rar: { icon: FileArchive, color: "text-yellow-600" },

  // Plain text
  "text/plain": { icon: FileText, color: "text-gray-500" },
  txt: { icon: FileText, color: "text-gray-500" },
};

function getExtension(fileType: string): string {
  // If it looks like a MIME type, try the map directly
  if (fileType.includes("/")) {
    return fileType;
  }
  // If it has a dot, extract extension
  if (fileType.includes(".")) {
    return fileType.split(".").pop()?.toLowerCase() || fileType;
  }
  return fileType.toLowerCase();
}

export function FileIcon({ fileType, className }: FileIconProps) {
  const key = fileType ? getExtension(fileType) : "";
  const match = iconMap[key];

  if (match) {
    const Icon = match.icon;
    return <Icon className={cn("h-5 w-5", match.color, className)} />;
  }

  return <File className={cn("h-5 w-5 text-muted-foreground", className)} />;
}
