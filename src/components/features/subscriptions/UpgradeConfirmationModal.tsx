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
import { Check, X, ExternalLink, QrCode, ArrowRight } from 'lucide-react';
import { ChangePlanData } from '@/types/subscription-api';
import { PLAN_PRICES } from '@/types/subscription-api';

interface UpgradeConfirmationModalProps {
    data: ChangePlanData;
    isOpen: boolean;
    onClose: () => void;
    onGoToPayment: (url: string) => void;
    onShowPix?: (qrCode: ChangePlanData['pixQrCode']) => void;
}

export function UpgradeConfirmationModal({
    data,
    isOpen,
    onClose,
    onGoToPayment,
    onShowPix,
}: UpgradeConfirmationModalProps) {
    const amountToPay = data.creditAmount
        ? data.newPlan.price! - data.creditAmount
        : data.newPlan.price || 0;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const calculatePeriodEnd = (startDate: string) => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + 1);
        return formatDate(date.toISOString());
    };

    const currentPlanPrice = PLAN_PRICES[data.currentPlan.id] || '0.00';
    const newPlanPrice = data.newPlan.price?.toFixed(2) || PLAN_PRICES[data.newPlan.id] || '0.00';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white text-2xl font-bold flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                        Upgrade Realizado com Sucesso!
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Seu plano foi atualizado com sucesso. Confira os detalhes abaixo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Detalhes do Upgrade */}
                    <div className="bg-[#29292E] rounded-xl p-6 border border-[#323238]">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            📊 Detalhes do Upgrade
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
                                <ArrowRight className="w-5 h-5 text-[#8b5cf6] flex-shrink-0" />
                                <div className="text-right">
                                    <span className="text-gray-400 text-sm">Novo Plano:</span>
                                    <p className="text-[#8b5cf6] font-bold">
                                        {data.newPlan.name} (R$ {newPlanPrice}/mês)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informações de Período */}
                        {data.unusedDays !== undefined && (
                            <div className="bg-[#1a1b1e] rounded-lg p-4 mb-4">
                                <p className="text-gray-300 text-sm">
                                    <strong className="text-white">Dias restantes:</strong> {data.unusedDays} dias
                                </p>
                            </div>
                        )}

                        {/* Crédito Aplicado */}
                        {data.creditAmount && data.creditAmount > 0 && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                                <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                    💰 Crédito Aplicado: R$ {data.creditAmount.toFixed(2)}
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Foi subtraído R$ {data.creditAmount.toFixed(2)} da fatura deste mês em virtude
                                    dos {data.unusedDays} dias que não foram usados da fatura anterior.
                                </p>
                            </div>
                        )}

                        {/* Valor a Pagar */}
                        {data.paymentUrl && (
                            <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-4 mb-4">
                                {amountToPay > 0 ? (
                                    <>
                                        <h4 className="text-[#8b5cf6] font-semibold mb-2 flex items-center gap-2">
                                            💳 Valor a Pagar: R$ {amountToPay.toFixed(2)}
                                        </h4>
                                        <p className="text-gray-300 text-sm">
                                            (Valor do novo plano: R$ {newPlanPrice} - Crédito: R$ {data.creditAmount?.toFixed(2) || '0,00'})
                                        </p>
                                    </>
                                ) : (
                                    <h4 className="text-green-400 font-semibold flex items-center gap-2">
                                        ✅ O crédito cobre totalmente o novo plano!
                                    </h4>
                                )}
                            </div>
                        )}

                        {/* Novo Período */}
                        <div className="bg-[#1a1b1e] rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                📅 Novo Período
                            </h4>
                            <p className="text-gray-300 text-sm">
                                {formatDate(data.effectiveDate)} até {calculatePeriodEnd(data.effectiveDate)}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    {data.paymentUrl && amountToPay > 0 && (
                        <>
                            {data.pixQrCode && onShowPix && (
                                <Button
                                    onClick={() => {
                                        onShowPix(data.pixQrCode!);
                                    }}
                                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Ver QR Code PIX
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    onGoToPayment(data.paymentUrl!);
                                }}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ir para Pagamento
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

