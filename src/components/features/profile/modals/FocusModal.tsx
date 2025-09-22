'use client';

import { Button } from '@/components/ui/button';
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
import { COLLEGE_COURSE_LABELS, CONTEST_TYPE_LABELS } from '@/types/api/auth-api';
import { FocusModalProps } from '@/types/ui/features/profile';

export function FocusModal({
    isOpen,
    onClose,
    selectedFocus,
    selectedCourse,
    selectedContest,
    onFocusSelect,
    onCourseChange,
    onContestChange,
    onSubmit
}: FocusModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-semibold">
                        Escolha seu foco
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Seleção do foco principal */}
                    <div className="space-y-3">
                        <h3 className="text-sm text-gray-300">Qual é o seu foco principal?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={selectedFocus === 'ENEM' ? 'default' : 'outline'}
                                onClick={() => onFocusSelect('ENEM')}
                                className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'ENEM'
                                    ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                    : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                    }`}
                            >
                                ENEM
                            </Button>
                            <Button
                                variant={selectedFocus === 'CONCURSO' ? 'default' : 'outline'}
                                onClick={() => onFocusSelect('CONCURSO')}
                                className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'CONCURSO'
                                    ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                    : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                    }`}
                            >
                                Concurso
                            </Button>
                            <Button
                                variant={selectedFocus === 'FACULDADE' ? 'default' : 'outline'}
                                onClick={() => onFocusSelect('FACULDADE')}
                                className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'FACULDADE'
                                    ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                    : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                    }`}
                            >
                                Faculdade
                            </Button>
                            <Button
                                variant={selectedFocus === 'ENSINO_MEDIO' ? 'default' : 'outline'}
                                onClick={() => onFocusSelect('ENSINO_MEDIO')}
                                className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'ENSINO_MEDIO'
                                    ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                    : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                    }`}
                            >
                                Ensino Médio
                            </Button>
                        </div>
                    </div>

                    {/* Seleção de curso (se faculdade) */}
                    {selectedFocus === 'FACULDADE' && (
                        <div className="space-y-3">
                            <h3 className="text-sm text-gray-300">Qual curso você pretende fazer?</h3>
                            <Select
                                value={selectedCourse}
                                onValueChange={onCourseChange}
                            >
                                <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                    <SelectValue placeholder="Selecione um curso" />
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
                                    {Object.entries(COLLEGE_COURSE_LABELS).map(([key, label]) => (
                                        <SelectItem
                                            key={key}
                                            value={key}
                                            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Seleção de concurso (se concurso) */}
                    {selectedFocus === 'CONCURSO' && (
                        <div className="space-y-3">
                            <h3 className="text-sm text-gray-300">Qual concurso você pretende fazer?</h3>
                            <Select
                                value={selectedContest}
                                onValueChange={onContestChange}
                            >
                                <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                    <SelectValue placeholder="Selecione um concurso" />
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
                                    {Object.entries(CONTEST_TYPE_LABELS).map(([key, label]) => (
                                        <SelectItem
                                            key={key}
                                            value={key}
                                            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
                            type="button"
                            onClick={onSubmit}
                            className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer"
                            disabled={!selectedFocus || (selectedFocus === 'FACULDADE' && !selectedCourse) || (selectedFocus === 'CONCURSO' && !selectedContest)}
                        >
                            Salvar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
