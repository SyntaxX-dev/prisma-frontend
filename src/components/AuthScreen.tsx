
'use client'

import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../public/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Eye, EyeOff, User, Mail, Lock, Zap } from 'lucide-react';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? 'Login' : 'Register', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/80 backdrop-blur-xl border-[#B3E240]/30 shadow-[0_0_50px_rgba(179,226,64,0.2)]">
          <div className="p-8">
            {/* Logo/Title */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-[#B3E240]/10 rounded-full mb-4 border border-[#B3E240]/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src={Logo}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-14 h-14 object-contain rounded-full"
                  priority
                />
              </motion.div>
              <h1 className="text-2xl text-[#B3E240] mb-2" style={{ fontFamily: 'monospace' }}>
                NEURO ACCESS
              </h1>
              <p className="text-gray-400 text-sm">Sistema de Acesso Neural</p>
            </motion.div>

            {/* Tab Switcher */}
            <div className="flex mb-8 bg-gray-900/50 rounded-lg p-1 border border-[#B3E240]/20">
              <motion.button
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                  isLogin 
                    ? 'bg-[#B3E240] text-black shadow-[0_0_20px_rgba(179,226,64,0.3)]' 
                    : 'text-gray-400 hover:text-[#B3E240]'
                }`}
                onClick={() => setIsLogin(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
              <motion.button
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-[#B3E240] text-black shadow-[0_0_20px_rgba(179,226,64,0.3)]' 
                    : 'text-gray-400 hover:text-[#B3E240]'
                }`}
                onClick={() => setIsLogin(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Registro
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Name field for register */}
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                      <Input
                        type="text"
                        placeholder="Nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10 bg-gray-900/50 border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)]"
                      />
                    </motion.div>
                  )}

                  {/* Email field */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-gray-900/50 border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)]"
                    />
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-gray-900/50 border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#B3E240] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Confirm password for register */}
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                      <Input
                        type="password"
                        placeholder="Confirmar senha"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 bg-gray-900/50 border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)]"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Submit button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-[#B3E240] hover:bg-[#B3E240]/90 text-black py-3 shadow-[0_0_30px_rgba(179,226,64,0.3)] border border-[#B3E240] transition-all duration-300 hover:shadow-[0_0_40px_rgba(179,226,64,0.4)]"
                >
                  <motion.span
                    initial={false}
                    animate={{
                      textShadow: ['0 0 0px rgba(0,0,0,0)', '0 0 10px rgba(0,0,0,0.3)', '0 0 0px rgba(0,0,0,0)'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isLogin ? 'INICIAR SESSÃO' : 'CRIAR CONTA'}
                  </motion.span>
                </Button>
              </motion.div>

              {/* Additional options */}
              <div className="text-center space-y-2">
                {isLogin && (
                  <motion.a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#B3E240] transition-colors block"
                    whileHover={{ scale: 1.05 }}
                  >
                    Esqueceu a senha?
                  </motion.a>
                )}
                
                <p className="text-sm text-gray-400">
                  {isLogin ? 'Novo no sistema? ' : 'Já tem conta? '}
                  <motion.button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#B3E240] hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    {isLogin ? 'Criar conta' : 'Fazer login'}
                  </motion.button>
                </p>
              </div>
            </form>

            {/* Status indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-[#B3E240]/30 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Decorative elements */}
        <motion.div
          className="absolute -top-10 -right-10 w-20 h-20 border border-[#B3E240]/20 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-16 h-16 border border-[#B3E240]/20"
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
        />
      </motion.div>
    </div>
  );
}