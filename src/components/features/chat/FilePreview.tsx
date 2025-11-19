"use client";

import { X, FileText, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { MessageAttachmentResponse } from "@/types/file-upload";

interface FilePreviewProps {
  attachment: MessageAttachmentResponse;
  onRemove?: () => void;
  showRemove?: boolean;
  size?: "small" | "medium" | "large";
}

export function FilePreview({
  attachment,
  onRemove,
  showRemove = false,
  size = "medium",
}: FilePreviewProps) {
  const isImage = attachment.fileType.startsWith("image/");
  const isPdf = attachment.fileType === "application/pdf";

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-32 h-32",
    large: "w-48 h-48",
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="relative inline-block">
      {isImage ? (
        <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden border border-white/10`}>
          <Image
            src={attachment.thumbnailUrl || attachment.fileUrl}
            alt={attachment.fileName}
            fill
            className="object-cover"
            sizes="128px"
            onClick={() => window.open(attachment.fileUrl, "_blank")}
            style={{ cursor: "pointer" }}
          />
          {showRemove && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      ) : isPdf ? (
        <div className={`${sizeClasses[size]} relative flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-[#29292E] transition-colors p-2`}>
          <button
            onClick={() => {
              // Tentar abrir em nova aba - se o Cloudinary retornar 401, o navegador mostrará o erro
              // Mas pelo menos tentamos abrir diretamente
              window.open(attachment.fileUrl, "_blank", "noopener,noreferrer");
            }}
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            title="Clique para abrir o PDF"
          >
            <FileText className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400 text-center truncate w-full">
              {attachment.fileName}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatFileSize(attachment.fileSize)}
            </span>
          </button>
          {showRemove && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      ) : (
        <div className={`${sizeClasses[size]} relative flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-[#29292E] transition-colors p-2`}>
          <button
            onClick={() => {
              // Tentar abrir em nova aba - se o Cloudinary retornar 401, o navegador mostrará o erro
              // Mas pelo menos tentamos abrir diretamente
              window.open(attachment.fileUrl, "_blank", "noopener,noreferrer");
            }}
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            title="Clique para abrir o arquivo"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400 text-center truncate w-full">
              {attachment.fileName}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatFileSize(attachment.fileSize)}
            </span>
          </button>
          {showRemove && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

