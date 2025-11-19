import type {
  UploadSignatureResponse,
  UploadSignatureError,
  MessageAttachment,
  CloudinaryUploadResponse,
  AllowedFileType,
} from '@/types/file-upload';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_ATTACHMENTS } from '@/types/file-upload';
import { getUploadSignature } from '@/api/files/get-upload-signature';
import { getCommunityUploadSignature } from '@/api/files/get-community-upload-signature';

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export class FileUploadService {
  /**
   * Valida arquivo antes do upload
   */
  static validateFile(file: File): void {
    // Verificar tipo
    if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
      throw new FileUploadError(
        `Tipo de arquivo não permitido. Tipos permitidos: ${ALLOWED_FILE_TYPES.join(', ')}`
      );
    }

    // Verificar tamanho
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
      throw new FileUploadError(
        `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
      );
    }
  }

  /**
   * Valida quantidade de arquivos
   */
  static validateFileCount(files: File[]): void {
    if (files.length > MAX_ATTACHMENTS) {
      throw new FileUploadError(
        `Máximo de ${MAX_ATTACHMENTS} arquivos por mensagem`
      );
    }
  }

  /**
   * Obtém signature para upload
   */
  static async getUploadSignature(
    file: File,
    isCommunity: boolean = false,
    communityId?: string
  ): Promise<UploadSignatureResponse['data']> {
    this.validateFile(file);

    const request = {
      fileType: file.type,
      fileSize: file.size,
    };

    const response = isCommunity && communityId
      ? await getCommunityUploadSignature(communityId, request)
      : await getUploadSignature(request);

    if (!response.success) {
      const error = response as UploadSignatureError;
      throw new FileUploadError(error.message || 'Erro ao obter assinatura de upload');
    }

    return response.data;
  }

  /**
   * Faz upload direto para Cloudinary
   */
  static async uploadToCloudinary(
    file: File,
    signature: UploadSignatureResponse['data'],
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    // O backend já embute o caminho completo dentro de public_id.
    // Não enviar o campo folder evita divergência entre os parâmetros
    // usados para gerar a assinatura e os enviados ao Cloudinary.
    formData.append('public_id', signature.publicId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
            resolve(result);
          } catch (error) {
            reject(new FileUploadError('Erro ao processar resposta do Cloudinary'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText) as { error?: { message?: string } };
            reject(new FileUploadError(error.error?.message || 'Erro ao fazer upload'));
          } catch {
            reject(new FileUploadError('Erro ao fazer upload'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new FileUploadError('Erro de rede ao fazer upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new FileUploadError('Upload cancelado'));
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`;
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Gera URL de thumbnail para imagens
   */
  static generateThumbnailUrl(
    secureUrl: string,
    width: number = 200,
    height: number = 200
  ): string {
    return secureUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
  }

  /**
   * Prepara attachment para envio
   */
  static prepareAttachment(
    file: File,
    uploadResult: CloudinaryUploadResponse
  ): MessageAttachment {
    const isImage = file.type.startsWith('image/');

    return {
      fileUrl: uploadResult.secure_url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      cloudinaryPublicId: uploadResult.public_id,
      thumbnailUrl: isImage
        ? this.generateThumbnailUrl(uploadResult.secure_url)
        : uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
    };
  }

  /**
   * Upload completo: signature → Cloudinary → attachment pronto
   */
  static async uploadFile(
    file: File,
    isCommunity: boolean = false,
    communityId?: string,
    onProgress?: (progress: number) => void
  ): Promise<MessageAttachment> {
    // 1. Obter signature
    const signature = await this.getUploadSignature(file, isCommunity, communityId);

    // 2. Upload para Cloudinary
    const uploadResult = await this.uploadToCloudinary(file, signature, onProgress);

    // 3. Preparar attachment
    return this.prepareAttachment(file, uploadResult);
  }

  /**
   * Upload de múltiplos arquivos
   */
  static async uploadMultipleFiles(
    files: File[],
    isCommunity: boolean = false,
    communityId?: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<MessageAttachment[]> {
    this.validateFileCount(files);

    const uploadPromises = files.map(async (file, index) => {
      return await this.uploadFile(
        file,
        isCommunity,
        communityId,
        (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        }
      );
    });

    return await Promise.all(uploadPromises);
  }
}

