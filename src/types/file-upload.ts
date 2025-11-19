// Tipos para upload signature
export interface UploadSignatureRequest {
  fileType: string; // 'image/jpeg', 'image/png', 'application/pdf', etc
  fileSize: number; // Tamanho em bytes
  resourceType?: 'image' | 'raw' | 'video' | 'auto'; // Opcional, padrão 'auto'
}

export interface UploadSignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    folder: string;
    publicId: string;
    resourceType: string;
    apiKey: string;
    cloudName: string;
  };
}

export interface UploadSignatureError {
  success: false;
  message: string;
}

// Tipos para attachment
export interface MessageAttachment {
  fileUrl: string; // URL do arquivo no Cloudinary
  fileName: string; // Nome original do arquivo
  fileType: string; // MIME type (ex: 'image/jpeg')
  fileSize: number; // Tamanho em bytes
  cloudinaryPublicId: string; // Public ID no Cloudinary
  thumbnailUrl?: string; // URL do thumbnail (opcional)
  width?: number; // Largura da imagem (opcional)
  height?: number; // Altura da imagem (opcional)
  duration?: number; // Duração em segundos para vídeo/áudio (opcional)
}

// Tipos para receber attachment do backend
export interface MessageAttachmentResponse {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

// Tipos para Cloudinary upload response
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  resource_type: string;
}

// Validações
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENTS = 10;

export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

