'use client';

import { useState, useEffect } from 'react';
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

interface LocationFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationField({ value, onChange, placeholder = "Digite sua localização", className }: LocationFieldProps) {
  const [searchType, setSearchType] = useState<'cep' | 'manual' | 'address'>('cep');
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

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
      onChange(fullAddress);
    } catch (error) {
      alert('Erro ao buscar CEP');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar endereço por cidade/estado
  const searchByAddress = async () => {
    if (!manualAddress.cidade || !manualAddress.estado) {
      alert('Digite pelo menos a cidade e estado');
      return;
    }
    
    setIsLoading(true);
    try {
      const query = `${manualAddress.cidade}, ${manualAddress.estado}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const fullAddress = `${manualAddress.rua ? manualAddress.rua + ', ' : ''}${manualAddress.numero ? manualAddress.numero + ', ' : ''}${manualAddress.bairro ? manualAddress.bairro + ', ' : ''}${result.display_name}`;
        onChange(fullAddress);
      } else {
        alert('Localização não encontrada');
      }
    } catch (error) {
      alert('Erro ao buscar endereço');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para construir endereço manual
  const buildManualAddress = () => {
    const parts = [];
    if (manualAddress.rua) parts.push(manualAddress.rua);
    if (manualAddress.numero) parts.push(manualAddress.numero);
    if (manualAddress.bairro) parts.push(manualAddress.bairro);
    if (manualAddress.cidade) parts.push(manualAddress.cidade);
    if (manualAddress.estado) parts.push(manualAddress.estado);
    
    const fullAddress = parts.join(', ');
    onChange(fullAddress);
  };

  // Atualizar endereço manual quando os campos mudarem
  useEffect(() => {
    if (searchType === 'manual') {
      buildManualAddress();
    }
  }, [manualAddress, searchType]);

  return (
    <div className="space-y-4">
      {/* Seletor de tipo de busca */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={searchType === 'cep' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('cep')}
          className={searchType === 'cep' ? 'bg-[#bd18b4] text-black' : 'border-[#323238] text-gray-300'}
        >
          <Search className="w-4 h-4 mr-1" />
          CEP
        </Button>
        <Button
          type="button"
          variant={searchType === 'address' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('address')}
          className={searchType === 'address' ? 'bg-[#bd18b4] text-black' : 'border-[#323238] text-gray-300'}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Endereço
        </Button>
        <Button
          type="button"
          variant={searchType === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSearchType('manual')}
          className={searchType === 'manual' ? 'bg-[#bd18b4] text-black' : 'border-[#323238] text-gray-300'}
        >
          <MapPin className="w-4 h-4 mr-1" />
          Manual
        </Button>
      </div>

      {/* Busca por CEP */}
      {searchType === 'cep' && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="Digite o CEP (apenas números)"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
              maxLength={9}
            />
            <Button
              type="button"
              onClick={() => searchByCep(cep)}
              disabled={isLoading || cep.length < 8}
              className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black disabled:opacity-50"
            >
              {isLoading ? <LoadingGrid size="16" color="#bd18b4" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {addressData && (
            <div className="text-sm text-gray-400 bg-[#1a1a1a] p-2 rounded">
              <p><strong>Logradouro:</strong> {addressData.logradouro}</p>
              <p><strong>Bairro:</strong> {addressData.bairro}</p>
              <p><strong>Cidade:</strong> {addressData.localidade}</p>
              <p><strong>Estado:</strong> {addressData.uf}</p>
            </div>
          )}
        </div>
      )}

      {/* Busca por endereço */}
      {searchType === 'address' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              value={manualAddress.cidade}
              onChange={(e) => setManualAddress(prev => ({ ...prev, cidade: e.target.value }))}
              placeholder="Cidade"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
            />
            <Input
              type="text"
              value={manualAddress.estado}
              onChange={(e) => setManualAddress(prev => ({ ...prev, estado: e.target.value }))}
              placeholder="Estado (UF)"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
              maxLength={2}
            />
          </div>
          <Button
            type="button"
            onClick={searchByAddress}
            disabled={isLoading || !manualAddress.cidade || !manualAddress.estado}
            className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-black disabled:opacity-50"
          >
            {isLoading ? <LoadingGrid size="16" color="#bd18b4" className="mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Buscar Localização
          </Button>
        </div>
      )}

      {/* Entrada manual */}
      {searchType === 'manual' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              value={manualAddress.rua}
              onChange={(e) => setManualAddress(prev => ({ ...prev, rua: e.target.value }))}
              placeholder="Rua/Avenida"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
            />
            <Input
              type="text"
              value={manualAddress.numero}
              onChange={(e) => setManualAddress(prev => ({ ...prev, numero: e.target.value }))}
              placeholder="Número"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="text"
              value={manualAddress.bairro}
              onChange={(e) => setManualAddress(prev => ({ ...prev, bairro: e.target.value }))}
              placeholder="Bairro"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
            />
            <Input
              type="text"
              value={manualAddress.cidade}
              onChange={(e) => setManualAddress(prev => ({ ...prev, cidade: e.target.value }))}
              placeholder="Cidade"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
            />
            <Input
              type="text"
              value={manualAddress.estado}
              onChange={(e) => setManualAddress(prev => ({ ...prev, estado: e.target.value }))}
              placeholder="Estado (UF)"
              className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none"
              maxLength={2}
            />
          </div>
        </div>
      )}

      {/* Campo de resultado */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">
          Localização Final
        </label>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#bd18b4] focus:!ring-0 focus:!outline-none ${className}`}
        />
      </div>
    </div>
  );
}
