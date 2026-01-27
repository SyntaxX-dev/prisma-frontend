'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, X, Info } from 'lucide-react';
import { ChangePlanData } from '@/types/subscription-api';
import { PLAN_PRICES } from '@/types/subscription-api';

interface DowngradeConfirmationModalProps {
    data: ChangePlanData;
    isOpen: boolean;
    onClose: () => void;
}

export function DowngradeConfirmationModal({
    data,
    isOpen,
    onClose,
}: DowngradeConfirmationModalProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const currentPlanPrice = PLAN_PRICES[data.currentPlan.id] || '0.00';
    const newPlanPrice = data.newPlan.price?.toFixed(2) || PLAN_PRICES[data.newPlan.id] || '0.00';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white text-2xl font-bold flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                        Mudança de Plano Agendada
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Seu plano será alterado automaticamente na data informada abaixo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Informações Principais */}
                    <div className="bg-[#29292E] rounded-xl p-6 border border-[#323238]">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            📋 Detalhes da Mudança
                        </h3>

                        {/* Comparação de Planos */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between p-3 bg-[#1a1b1e] rounded-lg">
                                <div>
                                    <span className="text-gray-400 text-sm">Plano Atual:</span>
                                    <p className="text-white font-medium">
                                        {data.currentPlan.name} (R$ {currentPlanPrice}/mês)
                                    </p>
                                </div>
                                <div className="text-[#8b5cf6] font-bold">→</div>
                                <div className="text-right">
                                    <span className="text-gray-400 text-sm">Novo Plano:</span>
                                    <p className="text-[#8b5cf6] font-bold">
                                        {data.newPlan.name} (R$ {newPlanPrice}/mês)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Data de Aplicação */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Data de Aplicação do Novo Plano
                            </h4>
                            <p className="text-white text-lg font-bold">
                                {formatDate(data.effectiveDate)}
                            </p>
                            <p className="text-gray-300 text-sm mt-2">
                                O novo plano será aplicado quando o período atual do plano{' '}
                                <strong>{data.currentPlan.name}</strong> terminar.
                            </p>
                        </div>

                        {/* Informação Importante */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-yellow-400 font-semibold mb-2">
                                        Informação Importante
                                    </h4>
                                    <ul className="text-gray-300 text-sm space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-400">•</span>
                                            <span>
                                                Você continuará com o plano{' '}
                                                <strong className="text-white">
                                                    {data.currentPlan.name}
                                                </strong>{' '}
                                                até <strong className="text-white">{formatDate(data.effectiveDate)}</strong>.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-400">•</span>
                                            <span>
                                                A partir de <strong className="text-white">{formatDate(data.effectiveDate)}</strong>, será cobrado o valor do plano{' '}
                                                <strong className="text-white">{data.newPlan.name}</strong> (R$ {newPlanPrice}/mês).
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-400">•</span>
                                            <span>
                                                Você terá acesso a todos os recursos do plano{' '}
                                                <strong className="text-white">{data.currentPlan.name}</strong>{' '}
                                                até a data de aplicação.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensagem do Backend (se disponível) */}
                    {data.message && (
                        <div className="bg-[#1a1b1e] rounded-lg p-4 border border-[#323238]">
                            <p className="text-gray-300 text-sm whitespace-pre-line">
                                {data.message}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        onClick={onClose}
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                    >
                        Entendi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
