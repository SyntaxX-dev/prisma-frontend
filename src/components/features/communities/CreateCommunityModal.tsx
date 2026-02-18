"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Lock, Users2, Database, UsersRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cropper, { Area } from "react-easy-crop";
import { createCommunityWithImage, createCommunity } from "@/api/communities/create-community";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [access, setAccess] = useState<'private' | 'shared'>('private');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  // Estados para o crop
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da comunidade é obrigatório');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Se houver imagem, usar FormData (multipart/form-data)
      if (avatarUrl && originalFileRef.current) {
        try {
          // Converter a imagem cortada de blob URL para File
          const blobResponse = await fetch(avatarUrl);
          const blob = await blobResponse.blob();
          const file = new File([blob], 'community-image.png', { type: 'image/png' });

          // Criar FormData com todos os dados e a imagem
          const formData = new FormData();
          const communityName = name.trim();
          const communityFocus = focus.trim();
          const communityVisibility = access === 'private' ? 'PRIVATE' : 'PUBLIC';

          // Garantir que os valores não estão vazios
          if (!communityName) {
            setError('O nome da comunidade é obrigatório');
            setIsLoading(false);
            return;
          }

          if (!communityFocus) {
            setError('O foco da comunidade é obrigatório');
            setIsLoading(false);
            return;
          }

          if (!communityVisibility) {
            setError('A visibilidade da comunidade é obrigatória');
            setIsLoading(false);
            return;
          }

          // Adicionar campos ao FormData (garantir que são strings)
          formData.append('name', String(communityName));
          formData.append('focus', String(communityFocus));

          if (description.trim()) {
            formData.append('description', String(description.trim()));
          }

          formData.append('visibility', String(communityVisibility));
          formData.append('image', file);

          // Debug: verificar FormData
          for (const [key, value] of formData.entries()) {
          }

          // Verificar se os valores estão corretos antes de enviar

          // Verificar se o FormData tem todos os campos
          const formDataEntries: Record<string, any> = {};
          for (const [key, value] of formData.entries()) {
            formDataEntries[key] = value instanceof File
              ? { type: 'File', name: value.name, size: value.size, mimeType: value.type }
              : { type: typeof value, value: String(value) };
          }

          // Criar comunidade com FormData (inclui imagem)
          const createResponse = await createCommunityWithImage(formData);

          if (createResponse.success) {
            handleClose();
            onSuccess?.();
          }
        } catch (uploadError: any) {

          // Tratar diferentes formatos de erro
          let errorMessage = 'Erro ao criar comunidade. Tente novamente.';

          if (uploadError.details?.message) {
            if (Array.isArray(uploadError.details.message)) {
              errorMessage = uploadError.details.message.join(', ');
            } else {
              errorMessage = uploadError.details.message;
            }
          } else if (uploadError.message) {
            if (Array.isArray(uploadError.message)) {
              errorMessage = uploadError.message.join(', ');
            } else {
              errorMessage = uploadError.message;
            }
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }
      } else {
        // Sem imagem, usar JSON normal
        const communityName = name.trim();
        const communityFocus = focus.trim();
        const communityVisibility = access === 'private' ? 'PRIVATE' : 'PUBLIC';

        if (!communityName) {
          setError('O nome da comunidade é obrigatório');
          setIsLoading(false);
          return;
        }

        if (!communityFocus) {
          setError('O foco da comunidade é obrigatório');
          setIsLoading(false);
          return;
        }

        const createResponse = await createCommunity({
          name: communityName,
          focus: communityFocus,
          description: description.trim() || undefined,
          visibility: communityVisibility,
        });

        if (createResponse.success) {
          handleClose();
          onSuccess?.();
        }
      }
    } catch (err: any) {

      // Tratar diferentes formatos de erro
      let errorMessage = 'Erro ao criar comunidade. Tente novamente.';

      if (err.details?.message) {
        if (Array.isArray(err.details.message)) {
          errorMessage = err.details.message.join(', ');
        } else {
          errorMessage = err.details.message;
        }
      } else if (err.message) {
        if (Array.isArray(err.message)) {
          errorMessage = err.message.join(', ');
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setFocus("");
    setDescription("");
    setAvatarUrl("");
    setAccess('private');
    setError(null);
    setIsLoading(false);
    originalFileRef.current = null;
    onClose();
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('A imagem deve ter no máximo 5MB');
          return;
        }
        originalFileRef.current = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageToCrop(reader.result as string);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Por favor, selecione um arquivo de imagem.');
      }
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve("");
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, "image/png");
    });
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setAvatarUrl(croppedImage);
      setShowCropModal(false);
      setImageToCrop("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={isOpen && !showCropModal} onOpenChange={handleClose}>
        <DialogContent
          className="overflow-y-auto border border-white/10 [&>button]:text-gray-300 [&>button]:cursor-pointer"
          style={{
            background: 'rgb(30, 30, 30)',
            maxWidth: '32rem',
            maxHeight: '90dvh',
            padding: 0,
            gap: 0,
            borderRadius: '1rem',
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
            <div className="flex items-start justify-between" style={{ marginBottom: '0.5rem' }}>
              <div className="flex-1">
                <h2 className="font-bold text-white" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crie sua própria comunidade</h2>
                <p style={{ fontSize: '0.875rem', color: 'rgb(156, 163, 175)' }}>
                  Crie e customize uma comunidade para sua galera estudar junto.
                </p>
              </div>

            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* Set an Image */}
            <div>
              <div className="flex items-center" style={{ gap: '1rem' }}>
                <Avatar style={{ width: '4rem', height: '4rem', borderRadius: '0.75rem' }}>
                  <AvatarImage src={avatarUrl || undefined} style={{ borderRadius: '0.75rem' }} />
                  <AvatarFallback
                    className="font-semibold"
                    style={{
                      background: '#bd18b4',
                      color: '#000',
                      borderRadius: '0.75rem',
                      fontSize: '1.125rem',
                    }}
                  >
                    {name ? getInitials(name) : 'CB'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center" style={{ gap: '0.75rem' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={handleUploadClick}
                    className="cursor-pointer border border-white/10 transition-all hover:bg-white/5 hover:scale-[1.02]"
                    style={{
                      background: 'rgb(14, 14, 14)',
                      color: '#fff',
                      width: 'fit-content',
                      height: '2.25rem',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Upload Image
                  </Button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={!avatarUrl}
                    className="cursor-pointer transition-all hover:opacity-80"
                    style={{
                      fontSize: '0.875rem',
                      color: avatarUrl ? '#ef4444' : 'rgb(107, 114, 128)',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="font-medium block" style={{ fontSize: '0.875rem', color: 'rgb(209, 213, 219)', marginBottom: '0.75rem' }}>
                Nome da comunidade
              </label>
              <div className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 flex items-center" style={{ left: '0.75rem', gap: '0.25rem' }}>
                  <UsersRound style={{ width: '1rem', height: '1rem', color: 'rgb(156, 163, 175)' }} />
                </div>
                <Input
                  placeholder="Nome da sua comunidade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={50}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLInputElement).focus();
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                  className="border border-white/10 text-white placeholder:text-gray-500 cursor-text"
                  style={{
                    background: 'rgb(14, 14, 14)',
                    paddingLeft: '2.5rem',
                    paddingRight: '0.75rem',
                    height: '2.75rem',
                    borderRadius: '1rem',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                />
              </div>
            </div>

            {/* Focus */}
            <div>
              <label className="font-medium block" style={{ fontSize: '0.875rem', color: 'rgb(209, 213, 219)', marginBottom: '0.75rem' }}>
                Foco
              </label>
              <Input
                placeholder="Ex: PRF, ENEM, ESA..."
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                required
                maxLength={50}
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  (e.target as HTMLInputElement).focus();
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = 'none';
                }}
                className="border border-white/10 text-white placeholder:text-gray-500 cursor-text"
                style={{
                  background: 'rgb(14, 14, 14)',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  height: '2.75rem',
                  borderRadius: '1rem',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                O foco é o tema da comunidade
              </p>
            </div>

            {/* Access */}
            <div>
              <label className="font-medium block" style={{ fontSize: '0.875rem', color: 'rgb(209, 213, 219)', marginBottom: '0.75rem' }}>
                Visibilidade
              </label>
              <div className="flex" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAccess('private')}
                  className={`flex-1 flex items-center justify-center font-medium transition-all cursor-pointer border ${access === 'private' ? 'border-[#bd18b4]/50' : 'border-white/10'} hover:!bg-white/5 hover:scale-[1.02] active:scale-[0.98]`}
                  style={{
                    background: access === 'private' ? 'rgba(189, 24, 180, 0.1)' : 'rgb(14, 14, 14)',
                    color: access === 'private' ? '#bd18b4' : 'rgb(156, 163, 175)',
                    height: '2.75rem',
                    borderRadius: '1rem',
                    gap: '0.5rem',
                  }}
                >
                  <Lock style={{ width: '1rem', height: '1rem' }} />
                  Privada
                </button>
                <button
                  type="button"
                  onClick={() => setAccess('shared')}
                  className={`flex-1 flex items-center justify-center font-medium transition-all cursor-pointer border ${access === 'shared' ? 'border-[#bd18b4]/50' : 'border-white/10'} hover:!bg-white/5 hover:scale-[1.02] active:scale-[0.98]`}
                  style={{
                    background: access === 'shared' ? 'rgba(189, 24, 180, 0.1)' : 'rgb(14, 14, 14)',
                    color: access === 'shared' ? '#bd18b4' : 'rgb(156, 163, 175)',
                    height: '2.75rem',
                    borderRadius: '1rem',
                    gap: '0.5rem',
                  }}
                >
                  <Users2 style={{ width: '1rem', height: '1rem' }} />
                  Pública
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', marginBottom: '1rem' }}>
                Comunidades públicas são visíveis para todos, enquanto comunidades privadas são visíveis apenas para você e seus amigos	.
              </p>

              {/* Description */}
              <div>
                <label className="font-medium block" style={{ fontSize: '0.875rem', color: 'rgb(209, 213, 219)', marginBottom: '0.75rem' }}>
                  Descrição
                </label>
                <Textarea
                  placeholder="Descreva sua comunidade..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).focus();
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                  className="border border-white/10 text-white placeholder:text-gray-500 resize-none cursor-text"
                  style={{
                    background: 'rgb(14, 14, 14)',
                    borderRadius: '1rem',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', marginTop: '0.25rem' }}>
                  {description.length}/200 caracteres
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: '0.75rem', paddingTop: '1rem' }}>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 font-medium cursor-pointer border border-white/10 transition-all hover:!bg-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  height: '2.75rem',
                  borderRadius: '1rem',
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isLoading}
                className={`flex-1 font-medium border border-white/10 transition-all ${name.trim() ? 'cursor-pointer hover:!bg-[#bd18b4]/20 hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed opacity-50'}`}
                style={{
                  background: name.trim() ? 'rgba(34, 197, 94, 0.1)' : 'rgb(14, 14, 14)',
                  color: name.trim() ? '#bd18b4' : '#666',
                  height: '2.75rem',
                  borderRadius: '1rem',
                }}
              >
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Crop */}
      <Dialog open={showCropModal} onOpenChange={handleCancelCrop}>
        <DialogContent
          className="overflow-hidden border border-white/10 [&>button]:text-gray-300 [&>button]:cursor-pointer"
          style={{
            background: 'rgb(30, 30, 30)',
            maxWidth: '42rem',
            padding: 0,
            gap: 0,
            borderRadius: '1rem',
          }}
        >
          <div style={{ padding: '1.5rem' }}>
            <h3 className="font-bold text-white" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Ajustar Imagem</h3>

            <div className="relative w-full overflow-hidden border border-white/10" style={{
              background: 'rgb(14, 14, 14)',
              height: '25rem',
              borderRadius: '1rem',
            }}>
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="rect"
                />
              )}
            </div>

            <div className="flex" style={{ gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button
                type="button"
                onClick={handleCancelCrop}
                className="flex-1 font-medium cursor-pointer border border-white/10 transition-all hover:bg-red-500/20"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  height: '2.75rem',
                  borderRadius: '1rem',
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCropComplete}
                className="flex-1 font-medium cursor-pointer border border-white/10 transition-all hover:brightness-110"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#bd18b4',
                  height: '2.75rem',
                  borderRadius: '1rem',
                }}
              >
                <Check style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}