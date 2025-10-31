"use client";

import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import FooterBackgroundGradient from "./footer-background-gradient";
import { TextHoverEffect } from "./text-hover-effect";

function Footer() {
  return (
    <footer className="bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-8">
      <div className="max-w-7xl mx-auto p-14 z-40 relative">
        {/* Main grid for the footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Section 1: PRISMA brand and description */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-[#B4FF39] text-3xl font-extrabold">
                PRISMA
              </span>
            </div>
            <p 
              className="text-sm leading-relaxed text-gray-400"
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
            >
              Transformamos o caos do YouTube em uma experiência de aprendizado organizada e eficiente.
            </p>
          </div>

          {/* Section 2: Sobre Nós links */}
          <div>
            <h4 
              className="text-white text-lg font-semibold mb-6"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Sobre Nós
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  História da Empresa
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Conheça a Equipe
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Manual do Colaborador
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Carreiras
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: Links Úteis */}
          <div>
            <h4 
              className="text-white text-lg font-semibold mb-6"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Links Úteis
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Suporte
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#B4FF39] transition-colors relative text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  Chat Ao Vivo
                  <span className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-[#B4FF39] animate-pulse"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Section 4: Entre em Contato */}
          <div>
            <h4 
              className="text-white text-lg font-semibold mb-6"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Entre em Contato
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#B4FF39]" />
                <a
                  href="mailto:contato@prisma.com"
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  contato@prisma.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[#B4FF39]" />
                <a
                  href="tel:+5511999999999"
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  +55 11 99999-9999
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-[#B4FF39]" />
                <span 
                  className="hover:text-[#B4FF39] transition-colors text-gray-400"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  São Paulo, Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-t border-gray-700 my-8" />

        {/* Bottom section: social media and copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social Media Icons */}
          <div className="flex space-x-6 text-gray-400">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-[#B4FF39] transition-colors relative"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-[#B4FF39] transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-[#B4FF39] transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              aria-label="Dribbble"
              className="hover:text-[#B4FF39] transition-colors"
            >
              <Dribbble size={20} />
            </a>
            <a
              href="#"
              aria-label="Globe"
              className="hover:text-[#B4FF39] transition-colors"
            >
              <Globe size={20} />
            </a>
          </div>

          {/* Copyright text */}
          <div className="text-center md:text-left">
            <p 
              className="text-gray-400"
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
            >
              &copy; {new Date().getFullYear()} PRISMA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36">
        <TextHoverEffect text="PRISMA" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export { Footer };
