"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { PencilScribble } from "@/components/ui/PencilScribble";

export function Footer() {
  return (
    <footer className="bg-[#1a1b1e] border-t border-[#323238] relative overflow-hidden">
      {/* Decorative scribbles */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 20 Q 40 5, 80 20 T 160 20"
          color="#bd18b4"
          width={200}
          height={40}
          className="absolute bottom-10 right-10 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-prisma.svg"
                alt="Prisma Logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'Metropolis, sans-serif' }}
              >
                Prisma
              </span>
            </div>
            <p
              className="text-gray-400 text-sm leading-relaxed"
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
            >
              Transformando o caos do YouTube em uma experiência de aprendizado organizada.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#funcionalidades"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Planos
                </a>
              </li>
              <li>
                <a
                  href="#suporte"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-semibold mb-4"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#bd18b4]" />
                <a
                  href="mailto:contato@prisma.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  contato@prisma.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#bd18b4]" />
                <a
                  href="tel:+5583987690902"
                  className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  +55 83 98769-0902
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-[#bd18b4]" />
                <span
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Paraíba, Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#323238] pt-6">
          <p
            className="text-gray-500 text-sm text-center"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            © {new Date().getFullYear()} Prisma. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
