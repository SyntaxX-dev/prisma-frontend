"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; avatarUrl?: string }) => void;
  isLoading?: boolean;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setAvatarUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="border-0 text-white max-w-md p-0 gap-0 rounded-2xl overflow-hidden"
        style={{
          background: 'rgb(30, 30, 30)',
        }}
      >
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgb(26, 26, 26)',
          }}
        >
          <h2 className="text-lg font-semibold">Create Community</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Community Avatar
            </label>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: avatarUrl ? 'transparent' : '#C9FE02',
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-black" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Paste image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 h-9 rounded-lg"
                  style={{ background: 'rgb(26, 26, 26)' }}
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Community Name *
            </label>
            <Input
              placeholder="e.g. Design Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 h-10 rounded-lg"
              style={{ background: 'rgb(26, 26, 26)' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Description *
            </label>
            <Textarea
              placeholder="What's this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={200}
              rows={3}
              className="border-0 text-white placeholder:text-gray-500 resize-none focus-visible:ring-0 rounded-lg"
              style={{ background: 'rgb(26, 26, 26)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-10 rounded-lg text-white cursor-pointer"
              style={{ background: 'rgb(26, 26, 26)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !description.trim() || isLoading}
              className="flex-1 h-10 rounded-lg font-medium cursor-pointer"
              style={{
                background: name.trim() && description.trim() ? '#C9FE02' : 'rgb(26, 26, 26)',
                color: name.trim() && description.trim() ? '#000' : '#666',
              }}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}