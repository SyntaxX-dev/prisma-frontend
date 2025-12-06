"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function WhatsAppFloatButton() {
  const pathname = usePathname();
  const phoneNumber = "5583987690902";
  const message = encodeURIComponent("Olá! Gostaria de entrar em contato.");

  // Só mostrar no dashboard
  const isDashboard = pathname === "/dashboard";

  if (!isDashboard) {
    return null;
  }

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 cursor-pointer z-50 w-14 h-14 md:w-20 md:h-20 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Contatar via WhatsApp"
    >
      <Image
        src="/logo-wpp.webp"
        alt="WhatsApp"
        width={28}
        height={28}
        className="md:w-10 md:h-10"
      />
    </button>
  );
}

