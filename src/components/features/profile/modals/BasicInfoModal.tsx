'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { countries } from '@/lib/constants/countries';
import { BasicInfoModalProps } from '@/types/ui/features/profile';

export function BasicInfoModal({
    isOpen,
    onClose,
    basicInfoData,
    onBasicInfoChange,
    onSubmit
}: BasicInfoModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-semibold">
                        Editar informações básicas
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Nome
                        </label>
                        <Input
                            type="text"
                            value={basicInfoData.nome}
                            className="bg-[#1a1a1a] border-[#323238] text-gray-400 cursor-not-allowed"
                            placeholder="Nome não pode ser alterado"
                            readOnly
                            disabled
                        />
                    </div>

                    {/* Área de atuação */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Área de atuação
                        </label>
                        <Input
                            type="text"
                            value={basicInfoData.areaAtuacao}
                            onChange={(e) => onBasicInfoChange('areaAtuacao', e.target.value)}
                            className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
                            placeholder="Em uma frase, o que você faz?"
                        />
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Empresa
                        </label>
                        <Input
                            type="text"
                            value={basicInfoData.empresa}
                            onChange={(e) => onBasicInfoChange('empresa', e.target.value)}
                            className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
                            placeholder="Você trabalha atualmente em alguma empresa?"
                        />
                    </div>

                    {/* Nacionalidade */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Nacionalidade
                        </label>
                        <Select
                            value={basicInfoData.nacionalidade}
                            onValueChange={(value) => onBasicInfoChange('nacionalidade', value)}
                        >
                            <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                <SelectValue placeholder="Em que país você nasceu?" />
                            </SelectTrigger>
                            <SelectContent
                                className="bg-[#29292E] border-[#323238] text-white max-h-60 z-50 !animate-none !transition-none"
                                position="popper"
                                sideOffset={4}
                                align="start"
                                style={{
                                    animation: 'none',
                                    transition: 'none'
                                }}
                            >
                                {countries.map((country) => (
                                    <SelectItem
                                        key={country.code}
                                        value={country.name}
                                        className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                    >
                                        {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cidade */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                            Cidade
                        </label>
                        <Input
                            type="text"
                            value={basicInfoData.cidade}
                            onChange={(e) => onBasicInfoChange('cidade', e.target.value)}
                            className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
                            placeholder="Em qual cidade você mora atualmente?"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer"
                        >
                            Salvar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
