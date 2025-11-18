"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUploadZone({
  onFilesSelected,
  disabled = false,
  className = "",
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length > 0) {
      onFilesSelected(fileArray);
    }
  }, [onFilesSelected]);

  useEffect(() => {
    if (disabled) return;

    const handleDragEnter = (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      if (event.dataTransfer?.files?.length) {
        handleFiles(event.dataTransfer.files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      <AnimatePresence>
        {isDragging && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto ${className}`}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#1a1a1a] border-2 border-dashed border-[#C9FE02]"
            >
              <div className="w-20 h-20 rounded-full bg-[#C9FE02]/20 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-[#C9FE02]" />
              </div>
              <p className="text-white text-lg font-medium">Solte seu arquivo aqui</p>
              <p className="text-gray-400 text-sm">Arraste e solte para fazer upload</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

