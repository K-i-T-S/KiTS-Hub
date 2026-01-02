"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "KiTS Hub has transformed how we manage our business. Everything from CRM to accounting is now in one place, saving us countless hours each week.",
    rating: 5,
    customer: {
      name: "Sarah Johnson",
      title: "CEO",
      company: "TechStart Inc.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200"
    }
  },
  {
    quote: "The best business management platform we've ever used. The integration between modules is seamless, and the support team is incredible.",
    rating: 5,
    customer: {
      name: "Michael Chen",
      title: "Operations Director",
      company: "Global Retail Co.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
    }
  },
  {
    quote: "We've tried multiple platforms, but KiTS Hub is the only one that truly understands what small businesses need. It's powerful yet simple to use.",
    rating: 5,
    customer: {
      name: "Emily Rodriguez",
      title: "Founder",
      company: "Creative Agency",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
    }
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Loved by businesses worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with KiTS Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
                
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.customer.avatar}
                    alt={testimonial.customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.customer.title}, {testimonial.customer.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
