"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkVeil from "./DarkVeil";

const plans = [
  {
    name: "Start",
    price: "12.90",
    period: "per month",
    description: "Ideal for individuals managing personal crypto finances.",
    popular: false,
    features: [
      "Up to 5 wallets",
      "Basic portfolio tracking",
      "Transaction history overview",
      "Support 24/7",
    ],
    billing: "billed yearly",
    cta: "UPGRADE TO START",
    trial: "7 days free",
  },
  {
    name: "Growth",
    price: "39.90",
    period: "per month",
    description: "Built for traders and small businesses scaling their web3 operations.",
    popular: true,
    features: [
      "Everything in Start",
      "Unlimited wallets",
      "Advanced portfolio insights",
      "Multi-chain support",
      "Priority customer support 24/7",
    ],
    billing: "billed yearly",
    cta: "UPGRADE TO GROWTH",
    trial: "7 days free",
  },
  {
    name: "Enterprise",
    price: "59.90",
    period: "",
    description: "Perfect for web3 builders, companies and financial teams.",
    popular: false,
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "API access for custom integrations",
      "Multi-user permissions",
      "SLA-backed 24/7 support",
      "Compliance and audit reports",
    ],
    billing: "",
    cta: "CONTACT US",
    trial: "Individual",
  },
];

export function Pricing() {
  return (
    <section id="planos" className="py-20 md:py-32 bg-[#050818] relative overflow-hidden backdrop-blur-sm">
      {/* DarkVeil Background */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <DarkVeil />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(180,255,57,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(180,255,57,0.02)_1px,transparent_1px)] bg-[size:100px_100px] z-10" />

      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 text-white font-bold">
            Choose your <span className="text-[#B4FF39]">Plan</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Simple investment for unlimited learning. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Background glass layer for depth */}
              <div className={`
                absolute inset-0 rounded-3xl blur-xl opacity-60
                ${plan.popular 
                  ? 'bg-gradient-to-br from-[#B4FF39]/20 via-[#B4FF39]/10 to-transparent' 
                  : 'bg-gradient-to-br from-white/5 via-white/2 to-transparent'
                }
              `} />

              {/* Card with glass effect */}
              <div 
                className={`
                  relative rounded-3xl p-8 h-full flex flex-col
                  backdrop-blur-2xl
                  ${plan.popular 
                    ? 'bg-gradient-to-br from-white/[0.08] via-[#B4FF39]/[0.05] to-white/[0.03] border-2 border-[#B4FF39]/60 shadow-[0_0_40px_rgba(180,255,57,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                    : 'bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.01] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  }
                  transition-all duration-300
                  ${plan.popular ? 'hover:shadow-[0_0_60px_rgba(180,255,57,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)]' : 'hover:border-white/20 hover:bg-gradient-to-br hover:from-white/[0.07] hover:via-white/[0.03] hover:to-white/[0.02]'}
                  before:absolute before:inset-0 before:rounded-3xl before:p-[1px] 
                  ${plan.popular ? 'before:bg-gradient-to-br before:from-[#B4FF39]/30 before:via-transparent before:to-[#B4FF39]/10' : 'before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-white/5'}
                  before:-z-10
                `}
              >
                {/* Light reflection effect on top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl" />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Subtle noise texture for frosted glass */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-30 mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                  }}
                />

                {/* Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-[#B4FF39] text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#B4FF39]/50 backdrop-blur-sm">
                    best choice
                  </div>
                )}

                {/* Plan name and description */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-[#B4FF39]" strokeWidth={3} />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Price section */}
                <div className="mt-auto">
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">
                        ${plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-500 text-sm ml-1">
                          / {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.billing && (
                      <span className="text-[#B4FF39] text-sm font-medium">
                        {plan.billing}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      className={`
                        w-full py-6 rounded-xl font-bold text-sm tracking-wider uppercase
                        transition-all duration-300
                        ${plan.popular
                          ? "bg-white text-black hover:bg-gray-100 hover:scale-[1.02]"
                          : "bg-[#B4FF39] text-black hover:bg-[#a3e830] hover:scale-[1.02]"
                        }
                      `}
                      onClick={() => window.location.href = '/auth/register'}
                    >
                      {plan.cta}
                    </Button>
                    <p className="text-gray-500 text-xs text-center pt-1">
                      {plan.trial}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtle glow for popular card */}
              {plan.popular && (
                <>
                  <div className="absolute inset-0 bg-[#B4FF39]/10 rounded-3xl blur-2xl -z-10 opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B4FF39]/5 to-transparent rounded-3xl -z-10" />
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}