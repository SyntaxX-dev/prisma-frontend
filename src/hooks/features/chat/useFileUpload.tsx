"use client";

import { useState, useCallback } from "react";
import { FileUploadService, FileUploadError } from "@/services/file-upload-service";
import type { MessageAttachment } from "@/types/file-upload";
import { FileUploadModal } from "@/components/ui/file-upload-modal";
import type { ReactNode } from "react";

interface UseFileUploadOptions {
  isCommunity?: boolean;
  communityId?: string;
  onUploadComplete?: (attachments: MessageAttachment[]) => void;
}

export function useFileUpload({
  isCommunity = false,
  communityId,
  onUploadComplete,
}: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showError = useCallback((title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalOpen(true);
  }, []);

  const uploadFiles = useCallback(
    async (
      files: File[],
      onProgress?: (fileIndex: number, progress: number) => void
    ): Promise<MessageAttachment[]> => {
      setUploading(true);
      setError(null);
      setUploadProgress(new Map());

      try {
        // Validar quantidade
        if (files.length > 10) {
          throw new FileUploadError("Máximo de 10 arquivos por mensagem");
        }

        // Validar cada arquivo
        files.forEach((file) => {
          FileUploadService.validateFile(file);
        });

        // Upload de todos os arquivos
        const attachments = await FileUploadService.uploadMultipleFiles(
          files,
          isCommunity,
          communityId,
          (fileIndex, progress) => {
            setUploadProgress((prev) => {
              const newMap = new Map(prev);
              newMap.set(fileIndex, progress);
              return newMap;
            });
            if (onProgress) {
              onProgress(fileIndex, progress);
            }
          }
        );

        setUploading(false);
        setUploadProgress(new Map());

        if (onUploadComplete) {
          onUploadComplete(attachments);
        }

        return attachments;
      } catch (err) {
        setUploading(false);
        setUploadProgress(new Map());

        if (err instanceof FileUploadError) {
          const errorMsg = err.message;
          
          if (errorMsg.includes("Tipo de arquivo não permitido")) {
            showError("Tipo de arquivo não suportado", errorMsg);
          } else if (errorMsg.includes("muito grande")) {
            showError("Arquivo muito grande", errorMsg);
          } else if (errorMsg.includes("Máximo de")) {
            showError("Limite excedido", errorMsg);
          } else {
            showError("Erro ao fazer upload", errorMsg);
          }
        } else {
          showError("Erro ao fazer upload", "Ocorreu um erro inesperado. Tente novamente.");
        }

        throw err;
      }
    },
    [isCommunity, communityId, onUploadComplete, showError]
  );

  const ErrorModalComponent: ReactNode = (
    <FileUploadModal
      open={errorModalOpen}
      onOpenChange={setErrorModalOpen}
      title={errorTitle}
      message={errorMessage}
    />
  );

  return {
    uploading,
    uploadProgress,
    error,
    uploadFiles,
    ErrorModal: ErrorModalComponent,
  };
}

