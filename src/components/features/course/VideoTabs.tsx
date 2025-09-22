'use client';

import { FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { VideoTabsProps } from '@/types/ui/features/course';

export function VideoTabs({ selectedVideo }: VideoTabsProps) {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/5 backdrop-blur-sm border-b border-white/10 w-full justify-start h-12 px-1 py-1 rounded-3xl">
                <TabsTrigger
                    value="overview"
                    className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
                >
                    Visão Geral
                </TabsTrigger>
                <TabsTrigger
                    value="notes"
                    className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Anotações
                </TabsTrigger>
                <TabsTrigger
                    value="comments"
                    className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comentários
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-3">Sobre esta aula</h2>

                        {selectedVideo?.channelTitle && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                {selectedVideo?.channelThumbnailUrl && (
                                    <Image
                                        src={selectedVideo.channelThumbnailUrl}
                                        alt={selectedVideo.channelTitle || "Canal"}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                )}
                                <div className="flex flex-col">
                                    <span className="text-white/80 font-medium text-sm">{selectedVideo.channelTitle}</span>
                                    {selectedVideo?.viewCount && (
                                        <span className="text-white/50 text-xs">{selectedVideo.viewCount.toLocaleString()} visualizações</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <p className="text-white/70 leading-relaxed">
                            {selectedVideo?.description || "Descrição não disponível para esta aula."}
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
                    <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60 mb-4">Suas anotações aparecerão aqui</p>
                    <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
                        Criar primeira anotação
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
                <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <textarea
                            placeholder="Deixe um comentário..."
                            className="w-full bg-transparent text-white placeholder-white/40 outline-none resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end mt-3">
                            <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
                                Comentar
                            </Button>
                        </div>
                    </div>
                    <p className="text-white/40 text-center">Nenhum comentário ainda</p>
                </div>
            </TabsContent>
        </Tabs>
    );
}
