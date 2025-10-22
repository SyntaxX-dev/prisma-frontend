"use client";

import { motion } from "motion/react";
import { BarChart3, PieChart, TrendingUp, Eye } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0E27] to-[#050818] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#B4FF39] opacity-5 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500 opacity-5 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl text-white mb-6">
            Dashboards{" "}
            <span className="text-[#B4FF39]">Global</span> e{" "}
            <span className="text-purple-400">Nacional</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Analise suas operações globais e nacionais em um só lugar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          {/* Global Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-[#B4FF39] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl text-white">Dashboard Global</h3>
                <div className="w-10 h-10 bg-[#B4FF39]/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#B4FF39]" />
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Progresso", value: "85%", color: "#B4FF39" },
                    { label: "Tempo", value: "120h", color: "#8B5CF6" },
                    { label: "Cursos", value: "24", color: "#EC4899" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="text-gray-400 text-xs mb-1">
                        {stat.label}
                      </div>
                      <div
                        className="text-2xl"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart representation */}
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[40, 65, 45, 80, 55, 70, 85].map((height, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 bg-[#B4FF39] rounded-t"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity list */}
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50"
                    >
                      <div className="w-2 h-2 bg-[#B4FF39] rounded-full" />
                      <div className="flex-1 h-2 bg-gray-700 rounded" />
                      <div className="w-16 h-2 bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nacional Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl text-white">Dashboard Nacional</h3>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Ranking", value: "#12", color: "#EC4899" },
                    { label: "Medalhas", value: "15", color: "#F59E0B" },
                    { label: "Pontos", value: "8.5K", color: "#06B6D4" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="text-gray-400 text-xs mb-1">
                        {stat.label}
                      </div>
                      <div
                        className="text-2xl"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Circular chart representation */}
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#1F2937"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#8B5CF6"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                        whileInView={{
                          strokeDashoffset: 2 * Math.PI * 56 * 0.25,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl text-purple-400">75%</span>
                    </div>
                  </div>
                </div>

                {/* Activity list */}
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50"
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <div className="flex-1 h-2 bg-gray-700 rounded" />
                      <div className="w-16 h-2 bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features below dashboards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            {
              icon: TrendingUp,
              title: "Análise em Tempo Real",
              description:
                "Métricas atualizadas instantaneamente para decisões rápidas",
            },
            {
              icon: Eye,
              title: "Visibilidade Total",
              description:
                "Acompanhe cada aspecto do seu progresso em detalhes",
            },
            {
              icon: BarChart3,
              title: "Relatórios Completos",
              description:
                "Gere relatórios detalhados sobre seu desempenho",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center hover:border-[#B4FF39] transition-all"
            >
              <div className="w-12 h-12 bg-[#B4FF39]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-[#B4FF39]" />
              </div>
              <h4 className="text-lg text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
