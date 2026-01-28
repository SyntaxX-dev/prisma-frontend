"use client";

import { MessageCircle, Users, Sparkles, ArrowRight, Plus } from "lucide-react";
import { motion } from "motion/react";

interface EmptyChatStateProps {
  onCreateCommunity?: () => void;
}

export function EmptyChatState({ onCreateCommunity }: EmptyChatStateProps) {
  return (
    <div
      className="flex-1 flex items-center justify-center relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
      }}
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orb */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(189, 24, 180, 0.15) 0%, rgba(189, 24, 180, 0.05) 40%, transparent 70%)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary orb - left */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
            left: '10%',
            top: '30%',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tertiary orb - right */}
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
            right: '15%',
            bottom: '20%',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="text-center max-w-lg px-8 relative z-10">
        {/* Icon Container */}
        <motion.div
          className="mb-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-[36px]"
              style={{
                background: 'linear-gradient(135deg, rgba(189, 24, 180, 0.4), rgba(147, 51, 234, 0.4))',
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main icon container */}
            <div
              className="w-36 h-36 rounded-[36px] flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(40, 40, 48, 0.9) 0%, rgba(25, 25, 32, 0.95) 100%)',
                border: '1px solid rgba(189, 24, 180, 0.3)',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.05),
                  0 20px 50px -10px rgba(0, 0, 0, 0.5),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
              }}
            >
              {/* Inner gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(189, 24, 180, 0.1) 0%, transparent 60%)',
                }}
              />

              <div className="relative flex items-center justify-center">
                <Users className="w-16 h-16 text-[#bd18b4]" strokeWidth={1.5} />
              </div>

              {/* Floating sparkle */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-7 h-7 text-[#bd18b4]" />
              </motion.div>

              {/* Message icon floating */}
              <motion.div
                className="absolute -bottom-1 -left-1"
                animate={{
                  y: [0, 3, 0],
                  x: [0, -2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(189, 24, 180, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                    boxShadow: '0 4px 15px rgba(189, 24, 180, 0.4)',
                  }}
                >
                  <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3
            className="text-3xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bem-vindo às Comunidades
          </h3>

          <p className="text-gray-400 text-base leading-relaxed mb-8">
            Conecte-se com pessoas que compartilham seus interesses. Selecione uma comunidade ao lado ou crie a sua própria para começar a conversar.
          </p>
        </motion.div>

        {/* CTA Button */}
        {onCreateCommunity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={onCreateCommunity}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #bd18b4 0%, #9333ea 100%)',
                boxShadow: '0 8px 30px -5px rgba(189, 24, 180, 0.5)',
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 12px 40px -5px rgba(189, 24, 180, 0.6)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                }}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />

              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10 cursor-pointer">Criar Comunidade</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}

        {/* Decorative floating dots */}
        <motion.div
          className="mt-12 flex justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i === 3
                  ? 'linear-gradient(135deg, #bd18b4, #9333ea)'
                  : 'rgba(189, 24, 180, 0.3)',
                boxShadow: i === 3 ? '0 0 10px rgba(189, 24, 180, 0.5)' : 'none',
              }}
              animate={{
                y: [0, -4, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { icon: Users, label: 'Grupos' },
            { icon: MessageCircle, label: 'Chat' },
            { icon: Sparkles, label: 'AI' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              whileHover={{
                background: 'rgba(189, 24, 180, 0.1)',
                borderColor: 'rgba(189, 24, 180, 0.3)',
              }}
            >
              <feature.icon className="w-5 h-5 text-[#bd18b4]" />
              <span className="text-xs text-gray-500">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}