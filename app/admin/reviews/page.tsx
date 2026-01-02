"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle, XCircle, Trash2, RefreshCw, AlertTriangle, TrendingUp, Users, MessageSquare, Shield } from "lucide-react"
import { reviewService } from "@/services/review-service"
import { Review } from "@/types/review"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    flagged: 0,
    averageRating: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [allReviews, reviewStats] = await Promise.all([
        reviewService.getAllReviews(),
        reviewService.getReviewStats()
      ])
      setReviews(allReviews)
      setStats(reviewStats)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId)
    try {
      const result = await reviewService.updateReviewStatus(reviewId, "approved")
      if (result.success) {
        await fetchData()
      } else {
        alert("Failed to approve review: " + result.error)
      }
    } catch (error) {
      console.error("Error approving review:", error)
      alert("Failed to approve review")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!confirm("Are you sure you want to reject this review?")) return
    
    setActionLoading(reviewId)
    try {
      const result = await reviewService.updateReviewStatus(reviewId, "rejected")
      if (result.success) {
        await fetchData()
      } else {
        alert("Failed to reject review: " + result.error)
      }
    } catch (error) {
      console.error("Error rejecting review:", error)
      alert("Failed to reject review")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) return
    
    setActionLoading(reviewId)
    try {
      const result = await reviewService.deleteReview(reviewId)
      if (result.success) {
        await fetchData()
      } else {
        alert("Failed to delete review: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      alert("Failed to delete review")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }
  }

  const getSpamScoreColor = (score: number) => {
    if (score >= 50) return "text-red-400"
    if (score >= 30) return "text-yellow-400"
    return "text-green-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Review Management</h1>
          <p className="text-zinc-400">Manage customer reviews and testimonials</p>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="text-sm text-zinc-400">Total Reviews</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
              </div>
              <div className="text-sm text-zinc-400">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              </div>
              <div className="text-sm text-zinc-400">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
              </div>
              <div className="text-sm text-zinc-400">Rejected</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <div className="text-2xl font-bold text-orange-400">{stats.flagged}</div>
              </div>
              <div className="text-sm text-zinc-400">Flagged</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.averageRating.toFixed(1)}
                </div>
              </div>
              <div className="text-sm text-zinc-400">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-12 text-center">
                <p className="text-zinc-400">No reviews found</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{review.name}</h3>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                        {review.flagged && (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                            <Shield className="w-3 h-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                        {review.email && <span>{review.email}</span>}
                        {review.company && <span>• {review.company}</span>}
                        {review.title && <span>• {review.title}</span>}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                        {review.spam_score > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span className={`text-xs font-medium ${getSpamScoreColor(review.spam_score)}`}>
                              Spam Score: {review.spam_score}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-zinc-300 leading-relaxed">{review.review}</p>
                      
                      {review.flagged && review.flag_reason && (
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                          <p className="text-orange-400 text-sm">
                            <Shield className="w-3 h-3 inline mr-1" />
                            Flagged: {review.flag_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {review.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(review.id)}
                            disabled={actionLoading === review.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Approve review"
                          >
                            {actionLoading === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(review.id)}
                            disabled={actionLoading === review.id}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            title="Reject review"
                          >
                            {actionLoading === review.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review.id)}
                        disabled={actionLoading === review.id}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        title="Delete review permanently"
                      >
                        {actionLoading === review.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 pt-3 border-t border-zinc-800">
                    <div className="flex justify-between">
                      <span>Submitted: {formatDate(review.created_at)}</span>
                      {review.updated_at !== review.created_at && (
                        <span>Updated: {formatDate(review.updated_at)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
