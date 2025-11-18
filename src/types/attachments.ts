// Tipo de um anexo retornado pela API
export interface Attachment {
  id: string;
  messageId: string;
  fileUrl: string;           // URL completa do arquivo no Cloudinary
  fileName: string;          // Nome original do arquivo
  fileType: string;          // MIME type (ex: "image/jpeg", "application/pdf")
  fileSize: number;          // Tamanho em bytes
  thumbnailUrl: string | null; // URL do thumbnail (imagens) ou null
  width: number | null;      // Largura (imagens) ou null
  height: number | null;      // Altura (imagens) ou null
  duration: number | null;    // Duração em segundos (vídeos/áudio) ou null
  createdAt: string;         // ISO date string
}

// Resposta da API
export interface GetAttachmentsResponse {
  success: boolean;
  data: {
    attachments: Attachment[];
    total: number;
  };
}

// Utilitários
export function isImage(attachment: Attachment): boolean {
  return attachment.fileType.startsWith('image/');
}

export function isPDF(attachment: Attachment): boolean {
  return attachment.fileType === 'application/pdf';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function groupAttachmentsByType(attachments: Attachment[]) {
  return {
    images: attachments.filter(att => isImage(att)),
    pdfs: attachments.filter(att => isPDF(att)),
    others: attachments.filter(att => !isImage(att) && !isPDF(att)),
  };
}

