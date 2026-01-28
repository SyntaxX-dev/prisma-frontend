"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, X, FileText, File } from 'lucide-react';
import type { Attachment } from '@/types/attachments';
import { isImage, formatFileSize, isPDF } from '@/types/attachments';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatAttachmentsGalleryProps {
  attachments: Attachment[];
  loading?: boolean;
  onImageClick?: (attachment: Attachment) => void;
}

export function ChatAttachmentsGallery({
  attachments,
  loading = false,
  onImageClick,
}: ChatAttachmentsGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalFiles = attachments.length;

  // Limitar a 4 itens para exibição
  const itemsToShow = attachments.slice(0, 4);
  const remainingCount = attachments.length - 4;

  const handleImageClick = (attachment: Attachment, hasBlur: boolean) => {
    if (hasBlur) {
      setIsModalOpen(true);
    } else {
      if (onImageClick) {
        onImageClick(attachment);
      } else {
        window.open(attachment.fileUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Files</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full border-2 border-[#bd18b4] border-t-transparent animate-spin mb-3"
            />
            <span className="text-gray-400 text-xs">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (totalFiles === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Files</span>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative mb-4">
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-2xl animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(189, 24, 180, 0.15) 0%, transparent 70%)',
                transform: 'scale(1.3)',
                filter: 'blur(12px)',
              }}
            />

            {/* Icon container */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(40, 40, 48, 0.8) 0%, rgba(25, 25, 32, 0.9) 100%)',
                border: '1px solid rgba(189, 24, 180, 0.2)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03)',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(189, 24, 180, 0.1) 0%, transparent 60%)',
                }}
              />
              <ImageIcon className="w-7 h-7 text-gray-500 relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center mb-1">Nenhum arquivo</p>
          <p className="text-gray-600 text-[10px] text-center">
            Arquivos compartilhados aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#252525] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Files {totalFiles}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <>
          {/* Attachments grid - 2x2, máximo 4 itens */}
          <div className="p-3 flex-1 flex items-center justify-center min-h-0">
            <div className="grid grid-cols-2 gap-2 w-full h-full max-w-full max-h-full">
              {itemsToShow.map((attachment, index) => {
                const isLastItem = index === 3;
                const hasMore = remainingCount > 0;
                const shouldShowBlur = isLastItem && hasMore;

                if (isImage(attachment)) {
                  return (
                    <div
                      key={attachment.id}
                      className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-[#252525]"
                      style={{ aspectRatio: '1 / 1' }}
                      onClick={() => handleImageClick(attachment, shouldShowBlur)}
                    >
                      <Image
                        src={attachment.thumbnailUrl || attachment.fileUrl}
                        alt={attachment.fileName}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      {shouldShowBlur && (
                        <>
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                            <span className="text-white font-semibold text-lg">
                              +{remainingCount}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                // Para arquivos não-imagem, mostrar um placeholder visual
                return (
                  <div
                    key={attachment.id}
                    className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-[#252525] flex items-center justify-center"
                    style={{ aspectRatio: '1 / 1' }}
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                  >
                    <div className="text-center p-2 w-full h-full flex flex-col items-center justify-center">
                      <div className="text-xs text-gray-400 mb-1">
                        {attachment.fileType === 'application/pdf' ? 'PDF' : 'FILE'}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-2 text-center">
                        {attachment.fileName}
                      </div>
                    </div>
                    {shouldShowBlur && (
                      <>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            +{remainingCount}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal com todos os arquivos */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white max-w-4xl h-[600px] overflow-hidden flex flex-col [&>button]:hidden">
          <DialogHeader className="relative shrink-0 pb-2">
            <DialogTitle className="text-white text-lg font-semibold">
              Todos os arquivos ({attachments.length})
            </DialogTitle>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attachment) => {
                if (isImage(attachment)) {
                  return (
                    <div
                      key={attachment.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-[#252525] group"
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                    >
                      <Image
                        src={attachment.thumbnailUrl || attachment.fileUrl}
                        alt={attachment.fileName}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-end">
                        <div className="w-full p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                          <p className="text-xs text-white truncate">{attachment.fileName}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={attachment.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-[#252525] group flex items-center justify-center"
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                  >
                    {/* Thumbnail genérica de arquivo */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                      {isPDF(attachment) ? (
                        <FileText className="w-16 h-16 text-gray-400" />
                      ) : (
                        <File className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-end">
                      <div className="w-full p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                        <p className="text-xs text-white truncate">{attachment.fileName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

