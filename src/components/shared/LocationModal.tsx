'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Eye, EyeOff, Globe } from 'lucide-react';
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

  // Função para aplicar máscara de CEP (00000-000)
  const applyCepMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  // Função para buscar CEP via ViaCEP
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



  // Função para salvar
  const handleSave = () => {
    if (finalLocation.trim()) {
      onSave(finalLocation, visibility);
      onClose();
    } else {
      alert('Digite uma localização válida');
    }
  };

  // Função para cancelar
  const handleCancel = () => {
    setFinalLocation(currentLocation);
    setCep('');
    setAddressData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Editar Localização
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">


          {/* Busca por CEP */}
          <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(applyCepMask(e.target.value))}
                  placeholder="00000-000"
                  className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none cursor-pointer"
                  maxLength={9}
                />
                <Button
                  type="button"
                  onClick={() => searchByCep(cep)}
                  disabled={isLoading || cep.length < 8}
                  className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isLoading ? <LoadingGrid size="16" color="#bd18b4" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              {addressData && (
                <div className="text-sm text-gray-400 bg-[#1a1a1a] p-3 rounded border border-[#323238]">
                  <p><strong>Logradouro:</strong> {addressData.logradouro}</p>
                  <p><strong>Bairro:</strong> {addressData.bairro}</p>
                  <p><strong>Cidade:</strong> {addressData.localidade}</p>
                  <p><strong>Estado:</strong> {addressData.uf}</p>
                </div>
              )}
            </div>
          {/* Campo de resultado */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Localização Final
            </label>
            <Input
              type="text"
              value={finalLocation}
              onChange={(e) => setFinalLocation(e.target.value)}
              placeholder="Digite sua localização completa"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none cursor-pointer"
            />
          </div>

          {/* Visibilidade da Localização */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#bd18b4]" />
              <label className="text-sm font-medium text-gray-200">
                Privacidade da Localização
              </label>
            </div>
            
            <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
              <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none h-11">
                <SelectValue placeholder="Selecione a visibilidade" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1e] border-[#323238] text-white">
                <SelectItem value="PUBLIC" className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-medium">Público</p>
                      <p className="text-xs text-gray-400">Todos verão seu endereço completo</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="STATE_ONLY" className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                   <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-medium">Somente Estado</p>
                      <p className="text-xs text-gray-400">Verão apenas a sigla do estado (ex: SP)</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="PRIVATE" className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="font-medium">Privado</p>
                      <p className="text-xs text-gray-400">Ninguém poderá ver sua localização</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-gray-500 italic">
              * Suas configurações de privacidade são respeitadas mesmo para amigos.
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer transition-colors"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
