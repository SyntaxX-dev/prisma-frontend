"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  Code,
  Palette,
  TrendingUp,
  Music,
  Camera,
  Dumbbell,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const categories = [
  {
    icon: Code,
    name: "Programação",
    courses: 120,
    color: "#B4FF39",
    gradient: "from-[#B4FF39]/20 to-[#B4FF39]/5",
  },
  {
    icon: Palette,
    name: "Design",
    courses: 85,
    color: "#EC4899",
    gradient: "from-pink-500/20 to-pink-500/5",
  },
  {
    icon: TrendingUp,
    name: "Marketing",
    courses: 95,
    color: "#F59E0B",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Music,
    name: "Música",
    courses: 65,
    color: "#8B5CF6",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: Camera,
    name: "Fotografia",
    courses: 50,
    color: "#06B6D4",
    gradient: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    icon: Dumbbell,
    name: "Fitness",
    courses: 40,
    color: "#EF4444",
    gradient: "from-red-500/20 to-red-500/5",
  },
  {
    icon: BookOpen,
    name: "Idiomas",
    courses: 75,
    color: "#10B981",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: Briefcase,
    name: "Negócios",
    courses: 110,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
];

export function CategoriesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const next = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage >= categories.length ? 0 : prev + itemsPerPage
    );
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.floor((categories.length - 1) / itemsPerPage) * itemsPerPage
        : prev - itemsPerPage
    );
  };

  const visibleCategories = categories.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  // Fill with items from start if we're at the end
  while (visibleCategories.length < itemsPerPage && categories.length > 0) {
    visibleCategories.push(
      categories[visibleCategories.length - currentIndex]
    );
  }

  return (
    <section className="py-20 md:py-32 bg-[#050818] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(180,255,57,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(180,255,57,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl text-white mb-6">
            Lucro individual de{" "}
            <span className="text-[#B4FF39]">cada categoria</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Descubra qual categoria traz mais retorno para o seu conhecimento.
            Tome decisões estratégicas baseadas em dados reais de aproveitamento
            e usabilidade por tópico.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation buttons */}
          <button
            onClick={prev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-[#B4FF39] rounded-full items-center justify-center text-white hover:text-[#B4FF39] transition-all z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={next}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-[#B4FF39] rounded-full items-center justify-center text-white hover:text-[#B4FF39] transition-all z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleCategories.map((category, index) => (
              <motion.div
                key={`${category.name}-${currentIndex}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div
                  className={`relative bg-gradient-to-br ${category.gradient} backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full hover:border-opacity-50 transition-all duration-300`}
                  style={{ borderColor: `${category.color}40` }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300"
                    style={{ backgroundColor: category.color }}
                  />

                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <category.icon
                        className="w-8 h-8"
                        style={{ color: category.color }}
                      />
                    </div>

                    <h3 className="text-2xl text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-400">
                      {category.courses} cursos disponíveis
                    </p>

                    {/* Progress bar */}
                    <div className="mt-6 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile navigation */}
          <div className="flex md:hidden justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-[#B4FF39] rounded-full flex items-center justify-center text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-[#B4FF39] rounded-full flex items-center justify-center text-white"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({
              length: Math.ceil(categories.length / itemsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / itemsPerPage) === index
                    ? "bg-[#B4FF39] w-8"
                    : "bg-gray-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
