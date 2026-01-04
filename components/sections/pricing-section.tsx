"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { motion } from 'framer-motion'

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for small teams getting started",
    price: "$0",
    billing: "/month",
    features: [
      "Up to 3 users",
      "Basic CRM features",
      "1GB storage",
      "Email support",
      "Mobile app access"
    ],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Professional",
    description: "For growing businesses that need more power",
    price: "$49",
    billing: "/user/month",
    features: [
      "Up to 50 users",
      "Advanced CRM & POS",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
      "API access"
    ],
    cta: "Start Free Trial",
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex needs",
    price: "Custom",
    billing: "",
    features: [
      "Unlimited users",
      "All features included",
      "Unlimited storage",
      "Dedicated support",
      "Custom development",
      "SLA guarantee",
      "Advanced security",
      "On-premise option"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 relative overflow-hidden" style={{background: "var(--background)"}}>
      {/* Modern sophisticated background */}
      
      {/* Subtle base with modern gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            linear-gradient(135deg, 
              var(--background) 0%, 
              rgba(139, 92, 246, 0.02) 25%, 
              rgba(168, 85, 247, 0.03) 50%, 
              rgba(196, 181, 253, 0.02) 75%, 
              var(--background) 100%
            )
          `
        }}
      />
      
      {/* Modern mesh gradient with industry-standard positioning */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, var(--purple-800) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, var(--purple-700) 0%, transparent 45%),
            radial-gradient(ellipse at 40% 70%, var(--purple-600) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 80%, var(--purple-900) 0%, transparent 40%),
            radial-gradient(ellipse at 10% 90%, var(--purple-800) 0%, transparent 35%)
          `,
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%'
        }}
      />
      
      {/* Modern animated gradient orbs with sophisticated motion */}
      <motion.div 
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(139, 92, 246, 0.08) 0%, 
              rgba(168, 85, 247, 0.04) 30%, 
              transparent 70%
            )
          `,
          filter: "blur(80px)"
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1]
        }}
      />
      
      <motion.div 
        className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full"
        style={{
          background: `
            radial-gradient(circle at 70% 70%, 
              rgba(196, 181, 253, 0.06) 0%, 
              rgba(168, 85, 247, 0.03) 40%, 
              transparent 80%
            )
          `,
          filter: "blur(100px)"
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 25, 0],
          scale: [1, 1.08, 1],
          rotate: [0, -3, 0]
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
          delay: 15
        }}
      />
      
      {/* Modern subtle grid with perspective */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(90deg, var(--purple-950) 1px, transparent 1px),
            linear-gradient(0deg, var(--purple-950) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(2deg)'
        }}
      />
      
      {/* Modern noise with optimized pattern */}
      <div 
        className="absolute inset-0 opacity-2"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='modernNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='5'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23modernNoise)' opacity='0.4'/%3E%3C/svg%3E")
          `,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Sophisticated floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${80 + (i * 20)}px`,
            height: `${80 + (i * 20)}px`,
            background: `
              radial-gradient(circle at 40% 40%, 
                rgba(${[139, 168, 196, 221, 237][i % 5]}, ${[92, 85, 181, 214, 233][i % 5]}, ${[246, 247, 254, 254, 254][i % 5]}, ${0.02 + (i * 0.005)}) 0%, 
                transparent 60%
              )
            `,
            left: `${10 + (i * 18)}%`,
            top: `${15 + (i * 10)}%`,
            filter: `blur(${20 + (i * 5)}px)`
          }}
          animate={{
            y: [0, -20 + (i * 3), 0],
            x: [0, 15 - (i * 2), 0],
            scale: [1, 1.02 + (i * 0.005), 1],
            opacity: [0.008 + (i * 0.002), 0.012 + (i * 0.003), 0.008 + (i * 0.002)]
          }}
          transition={{
            duration: 15 + (i * 4),
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: i * 1.5
          }}
        />
      ))}
      
      {/* Modern vignette with smooth falloff */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              transparent 0%, 
              rgba(107, 33, 168, 0.01) 40%, 
              rgba(91, 33, 182, 0.02) 70%, 
              rgba(75, 33, 196, 0.03) 100%
            )
          `
        }}
      />
      
      {/* Subtle animated mesh overlay */}
      <motion.div 
        className="absolute inset-0 opacity-4"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              rgba(168, 85, 247, 0.02) 60deg, 
              transparent 120deg, 
              rgba(139, 92, 246, 0.02) 180deg, 
              transparent 240deg, 
              rgba(196, 181, 253, 0.02) 300deg, 
              transparent 360deg
            )
          `,
          backgroundSize: '200% 200%'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 200%']
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            animate={{
              textShadow: [
                "0 0 20px var(--purple-glow)",
                "0 0 30px var(--purple-500)",
                "0 0 20px var(--purple-glow)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Choose the perfect plan for your business. No hidden fees, no surprises.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{
                y: -10,
                scale: plan.highlighted ? 1.05 : 1.02
              }}
            >
              <Card 
                className={`relative h-full transition-all duration-300 ${
                  plan.highlighted 
                    ? 'border-gradient-to-br from-[#9333ea] to-[#7c3aed] shadow-xl shadow-purple-500/25 scale-105 bg-gradient-to-br from-[#faf5ff]/50 to-[#f3e8ff]/50' 
                    : 'border-border/50 hover:border-purple-300/50 hover:shadow-lg'
                } bg-card`}
              >
                {plan.highlighted && (
                  <motion.div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
                    animate={{
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 10px rgba(167, 116, 249, 0.5)",
                        "0 0 20px rgba(139, 92, 246, 0.8)",
                        "0 0 10px rgba(167, 116, 249, 0.5)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="bg-gradient-to-r from-[#9333ea] to-[#7c3aed] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-purple-500/30 whitespace-nowrap">
                      Most Popular
                    </span>
                  </motion.div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <motion.div
                    animate={{
                      y: plan.highlighted ? [0, -3, 0] : 0
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <motion.span 
                        className="text-4xl font-bold inline-block"
                        animate={{
                          scale: plan.highlighted ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {plan.price}
                      </motion.span>
                      <span className="text-muted-foreground">{plan.billing}</span>
                    </div>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1 + featureIndex * 0.05
                        }}
                        whileHover={{
                          x: 5
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: plan.highlighted ? [1, 1.2, 1] : 1
                          }}
                          transition={{
                            duration: plan.highlighted ? 3 : 0,
                            repeat: plan.highlighted ? Infinity : 0,
                            ease: "linear"
                          }}
                        >
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {plan.cta === "Contact Sales" ? (
                    <Link href="/contact" passHref>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full"
                          variant="outline"
                          size="lg"
                        >
                          {plan.cta}
                        </Button>
                      </motion.div>
                    </Link>
                  ) : (
                    <Link href="/signup" passHref>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          className={`w-full ${
                            plan.highlighted 
                              ? 'bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] text-white shadow-lg shadow-purple-500/25 transition-all duration-300' 
                              : ''
                          }`}
                          variant={plan.highlighted ? "default" : "outline"}
                          size="lg"
                        >
                          {plan.cta}
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.p 
            className="text-muted-foreground"
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            All plans include 14-day free trial. No credit card required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
