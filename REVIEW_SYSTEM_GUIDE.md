# Review System Guide

## Overview

The review system allows customers to submit reviews through a modal on the testimonials section, and admins can manage these reviews through an admin dashboard.

## How It Works

### 1. Customer Review Submission
- Customers click "Leave Us Your Own Review" on the testimonials section
- A modal opens with a form for rating, personal info, and review text
- Reviews are stored in Supabase with status "pending"
- Real reviews use initials avatars, fallback testimonials use images

### 2. Admin Review Management
- Access: `/admin/reviews` (button available in main admin dashboard)
- Features:
  - View all reviews (pending, approved, rejected)
  - Approve reviews to make them visible on the site
  - Reject inappropriate reviews
  - Delete reviews permanently
  - Real-time statistics dashboard

### 3. Dynamic Testimonials Display
- **Priority 1**: Approved reviews from Supabase (max 3, newest first)
- **Priority 2**: Fallback static testimonials (when no approved reviews exist)
- Real reviews use initials avatars for authenticity
- Page refreshes automatically after review approval

## Database Schema

```sql
reviews table:
- id (UUID, primary key)
- name, email, company, title (user info)
- review (text content)
- rating (1-5 stars)
- status (pending/approved/rejected)
- created_at, updated_at (timestamps)
```

## Security Features

- **Row Level Security (RLS)** enabled
- **Public insertion**: Anyone can submit reviews
- **Selective reading**: Only approved reviews are publicly visible
- **Admin management**: Full CRUD operations for admins

## Admin Workflow

1. **Review Submission**: Customer submits review → status = "pending"
2. **Admin Review**: Admin reviews pending reviews in dashboard
3. **Approval**: Admin clicks approve → status = "approved" → appears on site
4. **Rejection**: Admin clicks reject → status = "rejected" → hidden from site
5. **Deletion**: Admin can permanently delete any review

## File Structure

```
/components/modals/review-modal.tsx          # Customer submission modal
/components/sections/testimonials-section.tsx  # Dynamic testimonials display
/services/review-service.ts                   # Supabase API service
/types/review.ts                              # TypeScript interfaces
/app/admin/reviews/page.tsx                   # Admin management interface
/supabase/migrations/20240102_create_reviews_table.sql  # Database schema
```

## Testing the System

1. **Setup**: Run the SQL migration in Supabase
2. **Submit Review**: Use the modal on the main page
3. **Check Admin**: Go to `/admin/reviews` to see pending review
4. **Approve**: Click approve to make it live
5. **Verify**: Refresh main page to see approved review

## Customization Options

- **Number of displayed reviews**: Change `slice(0, 3)` in testimonials section
- **Fallback content**: Modify `fallbackTestimonials` array
- **Admin permissions**: Update RLS policies for role-based access
- **Review validation**: Add more validation in the modal form

## Benefits

- **Authentic content**: Real customer testimonials
- **Admin control**: Quality control over what appears
- **Dynamic updates**: New reviews appear automatically
- **Fallback safety**: Always shows content even with no reviews
- **Professional appearance**: Consistent styling with site theme
