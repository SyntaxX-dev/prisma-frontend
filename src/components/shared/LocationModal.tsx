'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Eye, EyeOff, Globe, Navigation } from 'lucide-react';
import { LoadingGrid } from '@/components/ui/loading-grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string, visibility: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE') => void;
  currentLocation?: string;
  currentVisibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE';
}

export function LocationModal({ isOpen, onClose, onSave, currentLocation = '', currentVisibility = 'PUBLIC' }: LocationModalProps) {
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState<LocationData | null>(null);
  const [finalLocation, setFinalLocation] = useState(currentLocation);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'STATE_ONLY' | 'PRIVATE'>(currentVisibility);

  const applyCepMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const searchByCep = async (cepValue: string) => {
    if (!cepValue || cepValue.length < 8) return;

    setIsLoading(true);
    try {
      const cleanCep = cepValue.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      setAddressData(data);
      const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      setFinalLocation(fullAddress);
    } catch (error) {
      alert('Erro ao buscar CEP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (finalLocation.trim()) {
      onSave(finalLocation, visibility);
      onClose();
    } else {
      alert('Digite uma localização válida');
    }
  };

  const handleCancel = () => {
    setFinalLocation(currentLocation);
    setCep('');
    setAddressData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface-card/95 backdrop-blur-glass border-glass-border text-white max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-glass-border">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand/15">
                <Navigation className="w-4 h-4 text-brand" />
              </div>
              Editar Localização
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Busca por CEP */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Buscar por CEP
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={cep}
                onChange={(e) => setCep(applyCepMask(e.target.value))}
                placeholder="00000-000"
                className="bg-surface-card-alt/60 border-surface-border text-white placeholder-muted-foreground focus:!border-brand focus:!ring-0 focus:!outline-none cursor-text transition-colors py-3 px-4 h-auto"
                maxLength={9}
              />
              <Button
                type="button"
                onClick={() => searchByCep(cep)}
                disabled={isLoading || cep.length < 8}
                className="bg-brand hover:bg-brand-secondary text-white disabled:opacity-40 cursor-pointer transition-all shrink-0 px-4 h-auto"
              >
                {isLoading ? <LoadingGrid size="16" color="#fff" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Resultado do CEP */}
          {addressData && (
            <div className="rounded-xl bg-brand/5 border border-brand/15 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs font-medium text-brand">Endereço encontrado</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Logradouro</span>
                  <p className="text-gray-200 truncate">{addressData.logradouro || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Bairro</span>
                  <p className="text-gray-200 truncate">{addressData.bairro || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Cidade</span>
                  <p className="text-gray-200 truncate">{addressData.localidade || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Estado</span>
                  <p className="text-gray-200">{addressData.uf || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Localização Final */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Localização Final
            </label>
            <Input
              type="text"
              value={finalLocation}
              onChange={(e) => setFinalLocation(e.target.value)}
              placeholder="Digite sua localização completa"
              className="bg-surface-card-alt/60 border-surface-border text-white placeholder-muted-foreground focus:!border-brand focus:!ring-0 focus:!outline-none cursor-text transition-colors py-3 px-4 h-auto"
            />
          </div>

          {/* Privacidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-brand" />
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Privacidade
              </label>
            </div>

            <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
              <SelectTrigger className="bg-surface-card-alt/60 border-surface-border text-white focus:!border-brand focus:!ring-0 focus:!outline-none h-auto min-h-[60px] py-3 px-5 text-left transition-colors cursor-pointer [&>span]:min-w-0 [&>span]:flex-1">
                <SelectValue placeholder="Selecione a visibilidade" />
              </SelectTrigger>
              <SelectContent className="bg-surface-card border-surface-border text-white">
                <SelectItem value="PUBLIC" className="focus:bg-brand/10 focus:text-white cursor-pointer py-3.5 px-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-1.5 rounded-md bg-emerald-500/15 shrink-0">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-semibold text-sm">Público</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Todos verão seu endereço completo</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="STATE_ONLY" className="focus:bg-brand/10 focus:text-white cursor-pointer py-3.5 px-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-1.5 rounded-md bg-blue-500/15 shrink-0">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-semibold text-sm">Somente Estado</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Verão apenas a sigla do estado (ex: SP)</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="PRIVATE" className="focus:bg-brand/10 focus:text-white cursor-pointer py-3.5 px-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-1.5 rounded-md bg-red-500/15 shrink-0">
                      <EyeOff className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-semibold text-sm">Privado</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">Ninguém poderá ver sua localização</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <p className="text-[11px] text-muted-foreground/70 italic">
              * Suas configurações de privacidade são respeitadas mesmo para amigos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-glass-border bg-surface-back/30">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-surface-border text-muted-foreground hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 cursor-pointer transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-brand hover:bg-brand-secondary text-white font-medium cursor-pointer transition-all px-6"
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
