# Setting up the Reviews Table in Supabase

## 1. Run the Migration

Connect to your Supabase project and run the SQL from `supabase/migrations/20240102_create_reviews_table.sql`:

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  title VARCHAR(255),
  review TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Add RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting reviews (anyone can insert)
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Create policy for reading approved reviews (anyone can read approved reviews)
CREATE POLICY "Anyone can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Create policy for admins to manage reviews (if you have auth roles)
CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 2. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Features

- **Reviews start as 'pending'** - Admin approval required
- **RLS enabled** - Secure data access
- **Automatic timestamps** - created_at and updated_at
- **Rating validation** - Only 1-5 stars allowed
- **Status management** - pending/approved/rejected

## 4. Testing

Once the table is created, you can test the review submission:

1. Click "Leave Us Your Own Review" button
2. Fill out the form
3. Submit - data will be stored in Supabase
4. Check your Supabase dashboard to see the submitted reviews

## 5. Admin Management

To manage reviews (approve/reject), you'll need to create an admin interface or use the Supabase dashboard directly.
