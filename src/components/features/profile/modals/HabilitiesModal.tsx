'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../ui/dialog';
import { X, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HabilitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentHabilities: string[];
    onSave: (habilities: string[]) => Promise<void>;
}

export function HabilitiesModal({
    isOpen,
    onClose,
    currentHabilities,
    onSave
}: HabilitiesModalProps) {
    const [habilities, setHabilities] = useState<string[]>([]);
    const [newHability, setNewHability] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setHabilities(currentHabilities || []);
            setNewHability('');
            setErrors([]);
        }
    }, [isOpen, currentHabilities]);

    const validateHabilities = (habilitiesList: string[]): string[] => {
        const validationErrors: string[] = [];
        
        // Permitir array vazio (agora o backend aceita nulo)
        // if (habilitiesList.length === 0) {
        //     validationErrors.push('Adicione pelo menos uma habilidade');
        // }
        
        if (habilitiesList.length > 20) {
            validationErrors.push('Máximo de 20 habilidades permitidas');
        }
        
        const emptyHabilities = habilitiesList.filter(h => h.trim() === '');
        if (emptyHabilities.length > 0) {
            validationErrors.push('Habilidades não podem estar vazias');
        }
        
        const duplicateHabilities = habilitiesList.filter((h, index) => 
            habilitiesList.indexOf(h.toLowerCase().trim()) !== index
        );
        if (duplicateHabilities.length > 0) {
            validationErrors.push('Habilidades duplicadas não são permitidas');
        }
        
        return validationErrors;
    };

    const addHability = () => {
        const trimmedHability = newHability.trim();
        
        if (!trimmedHability) {
            toast.error('Digite uma habilidade válida');
            return;
        }
        
        if (habilities.length >= 20) {
            toast.error('Máximo de 20 habilidades permitidas');
            return;
        }
        
        if (habilities.some(h => h.toLowerCase() === trimmedHability.toLowerCase())) {
            toast.error('Esta habilidade já foi adicionada');
            return;
        }
        
        setHabilities(prev => [...prev, trimmedHability]);
        setNewHability('');
    };

    const removeHability = (index: number) => {
        setHabilities(prev => prev.filter((_, i) => i !== index));
    };

    const removeAllHabilities = () => {
        setHabilities([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addHability();
        }
    };

    const handleSave = async () => {
        const validationErrors = validateHabilities(habilities);
        
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);
        setErrors([]);
        
        try {
            await onSave(habilities);
            toast.success('Habilidades atualizadas com sucesso!');
            onClose();
        } catch (error) {
            toast.error('Erro ao salvar habilidades. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-lg">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
                            <span>Suas Habilidades</span>
                            <Badge variant="secondary" className="bg-[#B3E240]/20 text-[#B3E240] border-[#B3E240]/30">
                                {habilities.length}/20
                            </Badge>
                        </DialogTitle>
                        {habilities.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeAllHabilities}
                                disabled={isLoading}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 text-xs px-3 py-1"
                            >
                                Remover Todas
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Erros de validação */}
                    {errors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                                <AlertCircle className="h-4 w-4" />
                                Erros de validação:
                            </div>
                            <ul className="text-red-300 text-sm space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Input para adicionar nova habilidade */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Adicionar nova habilidade
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={newHability}
                                onChange={(e) => setNewHability(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ex: JavaScript, React, Node.js..."
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]"
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                onClick={addHability}
                                disabled={!newHability.trim() || isLoading || habilities.length >= 20}
                                className="bg-[#B3E240] hover:bg-[#B3E240]/90 text-black font-medium px-3"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Pressione Enter ou clique no botão + para adicionar
                        </p>
                    </div>

                    {/* Lista de habilidades */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Habilidades adicionadas ({habilities.length})
                        </label>
                        {habilities.length === 0 ? (
                            <div className="bg-[#29292E] border border-[#323238] rounded-lg p-4 text-center">
                                <p className="text-gray-400 text-sm">
                                    Nenhuma habilidade adicionada ainda
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Adicione suas principais habilidades técnicas
                                </p>
                            </div>
                        ) : (
                            <div className="bg-[#29292E] border border-[#323238] rounded-lg p-3 max-h-48 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {habilities.map((hability, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-[#B3E240]/20 text-[#B3E240] border-[#B3E240]/30 hover:bg-[#B3E240]/30 transition-colors group"
                                        >
                                            <span className="pr-1">{hability}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeHability(index)}
                                                disabled={isLoading}
                                                className="ml-1 hover:bg-[#B3E240]/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dicas */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-blue-400 text-sm font-medium mb-1">
                            💡 Dicas:
                        </div>
                        <ul className="text-blue-300 text-xs space-y-1">
                            <li>• Adicione suas principais habilidades técnicas</li>
                            <li>• Use nomes específicos (ex: "React" ao invés de "Frontend")</li>
                            <li>• Máximo de 20 habilidades</li>
                        </ul>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="border-[#323238] text-gray-300 hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[#B3E240] hover:bg-[#B3E240]/90 text-black font-medium"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar Habilidades'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
