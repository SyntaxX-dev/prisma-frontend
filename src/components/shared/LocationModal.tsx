'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { LoadingGrid } from '@/components/ui/loading-grid';

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
  onSave: (location: string) => void;
  currentLocation?: string;
}

export function LocationModal({ isOpen, onClose, onSave, currentLocation = '' }: LocationModalProps) {
  const [searchType, setSearchType] = useState<'cep' | 'city'>('cep');
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState<LocationData | null>(null);
  const [finalLocation, setFinalLocation] = useState(currentLocation);

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

  // Função para buscar por cidade e estado
  const searchByCity = async () => {
    if (!city || !state) {
      alert('Digite a cidade e estado');
      return;
    }
    
    setIsLoading(true);
    try {
      const query = `${city}, ${state}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        setFinalLocation(result.display_name);
      } else {
        alert('Localização não encontrada');
      }
    } catch (error) {
      alert('Erro ao buscar localização');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar
  const handleSave = () => {
    if (finalLocation.trim()) {
      onSave(finalLocation);
      onClose();
    } else {
      alert('Digite uma localização válida');
    }
  };

  // Função para cancelar
  const handleCancel = () => {
    setFinalLocation(currentLocation);
    setCep('');
    setCity('');
    setState('');
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
          {/* Seletor de tipo de busca */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={searchType === 'cep' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('cep')}
              className={`cursor-pointer transition-colors ${
                searchType === 'cep' 
                  ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]' 
                  : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
              }`}
            >
              <Search className="w-4 h-4 mr-1" />
              CEP
            </Button>
            <Button
              type="button"
              variant={searchType === 'city' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('city')}
              className={`cursor-pointer transition-colors ${
                searchType === 'city' 
                  ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]' 
                  : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
              }`}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Cidade/Estado
            </Button>
          </div>

          {/* Busca por CEP */}
          {searchType === 'cep' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="Digite o CEP (apenas números)"
                  className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#B3E240] focus:!ring-0 focus:!outline-none cursor-pointer"
                  maxLength={9}
                />
                <Button
                  type="button"
                  onClick={() => searchByCep(cep)}
                  disabled={isLoading || cep.length < 8}
                  className="bg-[#B3E240] hover:bg-[#A3D030] text-black disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isLoading ? <LoadingGrid size="16" color="#B3E240" /> : <Search className="w-4 h-4" />}
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
          )}

          {/* Busca por cidade e estado */}
          {searchType === 'city' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                  className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#B3E240] focus:!ring-0 focus:!outline-none cursor-pointer"
                />
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Estado (UF)"
                  className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#B3E240] focus:!ring-0 focus:!outline-none cursor-pointer"
                  maxLength={2}
                />
              </div>
              <Button
                type="button"
                onClick={searchByCity}
                disabled={isLoading || !city || !state}
                className="w-full bg-[#B3E240] hover:bg-[#A3D030] text-black disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isLoading ? <LoadingGrid size="16" color="#B3E240" className="mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Buscar Localização
              </Button>
            </div>
          )}

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
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#B3E240] focus:!ring-0 focus:!outline-none cursor-pointer"
            />
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
              className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer transition-colors"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
