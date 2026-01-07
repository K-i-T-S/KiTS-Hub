"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"
import { ReviewModal } from "@/components/modals/review-modal"
import { reviewService } from "@/services/review-service"
import { Review } from "@/types/review"

// Fallback testimonials for when no approved reviews exist
const fallbackTestimonials = [
  {
    quote: "KiTS Hub has transformed how we manage our business. Everything from CRM to accounting is now in one place, saving us countless hours each week.",
    rating: 5,
    customer: {
      name: "Sarah Johnson",
      title: "CEO",
      company: "TechStart Inc.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" as string | null
    }
  },
  {
    quote: "The best business management platform we've ever used. The integration between modules is seamless, and the support team is incredible.",
    rating: 5,
    customer: {
      name: "Michael Chen",
      title: "Operations Director",
      company: "Global Retail Co.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop" as string | null
    }
  },
  {
    quote: "We've tried multiple platforms, but KiTS Hub is the only one that truly understands what small businesses need. It's powerful yet simple to use.",
    rating: 5,
    customer: {
      name: "Emily Rodriguez",
      title: "Founder",
      company: "Creative Agency",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop" as string | null
    }
  }
]

export function TestimonialsSection() {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedReviews()
  }, [])

  const fetchApprovedReviews = async () => {
    try {
      const reviews = await reviewService.getApprovedReviews()
      setApprovedReviews(reviews)
    } catch (error) {
      // Gracefully handle Supabase connection errors
      console.log("Using fallback testimonials - Supabase not configured or table doesn't exist")
      setApprovedReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index))
  }

  const openReviewModal = () => {
    setIsReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setIsReviewModalOpen(false)
    // Refresh reviews after modal closes (in case a new one was approved)
    fetchApprovedReviews()
  }

  // Convert Supabase reviews to testimonial format
  const testimonialsFromReviews = approvedReviews.slice(0, 3).map(review => ({
    quote: review.review,
    rating: review.rating,
    customer: {
      name: review.name,
      title: review.title || "Customer",
      company: review.company || "",
      avatar: null // Use initials avatar for real reviews
    }
  }))

  // Use approved reviews if available, otherwise fallback to static testimonials
  const testimonials = testimonialsFromReviews.length > 0 ? testimonialsFromReviews : fallbackTestimonials

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

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background">
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
                  {imageErrors.has(index) || !testimonial.customer.avatar ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-300 font-semibold text-sm">
                        {testimonial.customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={testimonial.customer.avatar}
                      alt={testimonial.customer.name}
                      width={48}
                      height={48}
                      sizes="48px"
                      className="rounded-full object-cover"
                      style={{ width: 'auto', height: '48px' }}
                      onError={() => handleImageError(index)}
                    />
                  )}
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
        
        {/* Review CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Have experience with KiTS Hub? We'd love to hear from you!
          </p>
          <button 
            onClick={openReviewModal}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-full bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] hover:from-[#7c3aed] hover:via-[#9333ea] hover:to-[#6b21a8] shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="relative z-10">Leave Us Your Own Review</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
      
      {/* Review Modal */}
      <ReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} />
    </section>
  )
}
