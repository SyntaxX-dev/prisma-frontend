"use client";

import { motion } from "motion/react";
import { Youtube, Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { name: "Recursos", href: "#funcionalidades" },
      { name: "Preços", href: "#planos" },
      { name: "Demonstração", href: "#" },
    ],
    company: [
      { name: "Sobre", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carreiras", href: "#" },
    ],
    support: [
      { name: "Ajuda", href: "#suporte" },
      { name: "Contato", href: "#" },
      { name: "Termos", href: "#" },
    ],
  };

  const socials = [
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-[#0A0E27] border-t border-gray-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#B4FF39] to-transparent opacity-30" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border-2 border-[#B4FF39] flex items-center justify-center relative">
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[#B4FF39]" />
                </div>
                <span className="text-2xl tracking-wider text-[#B4FF39]">
                  PRISMA
                </span>
              </div>
              <p className="text-gray-400 max-w-sm">
                A melhor plataforma para organizar e acessar videoaulas do
                YouTube de forma inteligente e estruturada.
              </p>
            </motion.div>

            {/* Social links */}
            <div className="flex gap-4">
              {socials.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-[#B4FF39] hover:text-black rounded-lg flex items-center justify-center transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white mb-4">Produto</h3>
            <ul className="space-y-3">
              {links.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#B4FF39] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#B4FF39] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Suporte</h3>
            <ul className="space-y-3">
              {links.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#B4FF39] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} PRISMA. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-[#B4FF39] transition-colors"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#B4FF39] transition-colors"
              >
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
