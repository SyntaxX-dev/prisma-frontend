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
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/shared';

interface PixQrCode {
    encodedImage: string;
    payload: string;
    expirationDate: string;
}

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrCode: PixQrCode;
    amount: number;
    paymentUrl?: string;
}

export function PixPaymentModal({
    isOpen,
    onClose,
    qrCode,
    amount,
    paymentUrl,
}: PixPaymentModalProps) {
    const [copied, setCopied] = useState(false);
    const { showSuccess } = useNotifications();

    const handleCopyPayload = async () => {
        try {
            await navigator.clipboard.writeText(qrCode.payload);
            setCopied(true);
            showSuccess('Código PIX copiado para a área de transferência!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar código PIX:', error);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = new Date(qrCode.expirationDate) < new Date();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-bold">
                        Pagamento via PIX
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Escaneie o QR Code ou copie o código PIX para realizar o pagamento
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Valor */}
                    <div className="bg-[#29292E] rounded-xl p-4 border border-[#323238] text-center">
                        <p className="text-gray-400 text-sm mb-1">Valor a pagar</p>
                        <p className="text-3xl font-bold text-[#8b5cf6]">R$ {amount.toFixed(2)}</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-xl p-6 flex items-center justify-center">
                        {isExpired ? (
                            <div className="text-center py-8">
                                <p className="text-red-400 font-semibold mb-2">QR Code Expirado</p>
                                <p className="text-gray-400 text-sm">
                                    Este QR Code expirou em {formatDate(qrCode.expirationDate)}
                                </p>
                            </div>
                        ) : (
                            <img
                                src={qrCode.encodedImage}
                                alt="QR Code PIX"
                                className="w-full max-w-[250px] h-auto"
                            />
                        )}
                    </div>

                    {/* Código PIX */}
                    <div className="bg-[#29292E] rounded-xl p-4 border border-[#323238]">
                        <p className="text-gray-400 text-sm mb-2">Código PIX (Copiar e Colar)</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={qrCode.payload}
                                readOnly
                                className="flex-1 bg-[#1a1b1e] border border-[#323238] text-white text-xs p-2 rounded-lg font-mono"
                            />
                            <Button
                                onClick={handleCopyPayload}
                                size="sm"
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Expiração */}
                    {!isExpired && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm">
                                ⏰ Este QR Code expira em {formatDate(qrCode.expirationDate)}
                            </p>
                        </div>
                    )}

                    {/* Instruções */}
                    <div className="bg-[#29292E] rounded-lg p-4 border border-[#323238]">
                        <p className="text-white font-semibold text-sm mb-2">Como pagar:</p>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                            <li>Abra o app do seu banco</li>
                            <li>Escaneie o QR Code ou cole o código PIX</li>
                            <li>Confirme o pagamento</li>
                            <li>Aguarde a confirmação (pode levar alguns minutos)</li>
                        </ol>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    {paymentUrl && (
                        <Button
                            onClick={() => {
                                window.open(paymentUrl, '_blank');
                            }}
                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir no Asaas
                        </Button>
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
