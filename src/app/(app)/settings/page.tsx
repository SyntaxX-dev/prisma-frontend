"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import { usePageDataLoad } from "@/hooks/usePageDataLoad";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Slider } from "../../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import {
  Settings,
  Bell,
  Palette,
  Shield,
  Download,
  Trash2,
  Save,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

function SettingsContent() {
  const [isDark, setIsDark] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    achievements: true,
    reminders: false,
    weeklyReport: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    fontSize: 14,
    compactMode: false,
    animations: true
  });


  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataCollection: true,
    analytics: true
  });


  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSaveSettings = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  const handleResetSettings = () => {
    setNotifications({
      email: true,
      push: true,
      achievements: true,
      reminders: false,
      weeklyReport: true
    });
    setAppearance({
      theme: 'dark',
      fontSize: 14,
      compactMode: false,
      animations: true
    });
    setPrivacy({
      profileVisibility: 'public',
      dataCollection: true,
      analytics: true
    });
    showSuccess('Configurações resetadas para o padrão!');
  };

  const handleExportData = () => {
    showSuccess('Dados exportados com sucesso!');
  };

  const handleDeleteAccount = () => {
    showError('Funcionalidade em desenvolvimento');
  };


  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-gray-950'
          : 'bg-gray-500'
          }`}
        style={{
          backgroundImage: isDark
            ? `
            radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
          `
            : `
            radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
          `
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-6 ml-10 pt-6" style={{ marginTop: '80px' }}>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-white text-3xl font-bold">Configurações</h1>
                  <p className="text-white/60 text-lg">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificações por email</p>
                      <p className="text-white/60 text-sm">Receba atualizações importantes</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Notificações push</p>
                      <p className="text-white/60 text-sm">Alertas no navegador</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Conquistas</p>
                      <p className="text-white/60 text-sm">Notificar sobre badges e streaks</p>
                    </div>
                    <Switch
                      checked={notifications.achievements}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, achievements: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Lembretes de estudo</p>
                      <p className="text-white/60 text-sm">Notificações diárias</p>
                    </div>
                    <Switch
                      checked={notifications.reminders}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, reminders: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-white font-medium">Tema</p>
                    <Select
                      value={appearance.theme}
                      onValueChange={(value) =>
                        setAppearance(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Escuro
                          </div>
                        </SelectItem>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            Sistema
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-white font-medium">Tamanho da fonte: {appearance.fontSize}px</p>
                    <Slider
                      value={[appearance.fontSize]}
                      onValueChange={([value]) =>
                        setAppearance(prev => ({ ...prev, fontSize: value }))
                      }
                      min={12}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Modo compacto</p>
                      <p className="text-white/60 text-sm">Interface mais densa</p>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) =>
                        setAppearance(prev => ({ ...prev, compactMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Animações</p>
                      <p className="text-white/60 text-sm">Efeitos visuais</p>
                    </div>
                    <Switch
                      checked={appearance.animations}
                      onCheckedChange={(checked) =>
                        setAppearance(prev => ({ ...prev, animations: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>


              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-white font-medium">Visibilidade do perfil</p>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) =>
                        setPrivacy(prev => ({ ...prev, profileVisibility: value }))
                      }
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="friends">Apenas amigos</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Coleta de dados</p>
                      <p className="text-white/60 text-sm">Melhorar experiência</p>
                    </div>
                    <Switch
                      checked={privacy.dataCollection}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, dataCollection: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Analytics</p>
                      <p className="text-white/60 text-sm">Dados de uso</p>
                    </div>
                    <Switch
                      checked={privacy.analytics}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 space-y-4">
              <Separator className="bg-white/10" />

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleSaveSettings}
                  className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-medium"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>

                <Button
                  onClick={handleResetSettings}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl"
                >
                  Resetar Padrões
                </Button>

                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>

                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
