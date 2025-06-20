# Selliko Platform - Vercel Deployment Guide

This guide will help you deploy the Selliko platform to Vercel.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/selliko-platform)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: PostgreSQL database (recommended: Supabase, Neon, or PlanetScale)
3. **GitHub Repository**: Push your code to GitHub
4. **Environment Variables**: Prepare your production environment variables

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Database

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your database URL from Project Settings → Database
3. Note down your API URL and anon key

#### Option B: Neon
1. Go to [neon.tech](https://neon.tech) and create a new project
2. Get your connection string

#### Option C: PlanetScale
1. Go to [planetscale.com](https://planetscale.com) and create a new database
2. Get your connection string

### 2. Deploy to Vercel

#### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js configuration

#### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Configure Environment Variables

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

#### Required Variables
```
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### Supabase Configuration (if using)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### API Configuration
```
NEXT_PUBLIC_SELLIKO_API_BASE=https://your-supabase-url.supabase.co/
NEXT_PUBLIC_S3_URL=https://your-supabase-url.supabase.co/storage/v1/s3
```

#### Payment Integration (Razorpay)
```
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

#### File Storage (if using AWS S3)
```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 4. Set Up Database Schema

If using Prisma (recommended), run database migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## 🔒 Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS only
- [ ] Configure proper CORS headers
- [ ] Set up rate limiting for API routes
- [ ] Review and update security headers in `next.config.js`

## 🚨 Common Issues & Solutions

### Build Errors
- **TypeScript errors**: Fix all TypeScript errors before deployment
- **Missing dependencies**: Ensure all required packages are in `package.json`
- **Environment variables**: Make sure all required env vars are set

### Database Issues
- **Connection errors**: Verify database URL format
- **Migration errors**: Run migrations manually using Vercel CLI
- **Timeout issues**: Consider connection pooling for high traffic

### API Route Issues
- **CORS errors**: Configure proper CORS headers
- **Timeout errors**: API routes have a 10-second timeout on Hobby plan
- **Cold starts**: Consider upgrading to Pro plan for better performance

## 📊 Performance Optimization

### Vercel Configuration
- **Regions**: Set to `["sin1", "bom1"]` for better performance in India
- **Functions**: Configure timeout for API routes
- **Edge Functions**: Consider using for better global performance

### Next.js Optimization
- **Image Optimization**: Already configured in `next.config.js`
- **Bundle Analysis**: Use `@next/bundle-analyzer`
- **Static Generation**: Use ISR where possible

## 🔍 Monitoring & Analytics

### Vercel Analytics
1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. Add `@vercel/analytics` to your project

### Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Speed Insights for performance monitoring

## 📱 Mobile Optimization

The app is already optimized for mobile with:
- Responsive design
- PWA capabilities
- Mobile-first approach
- Optimized images and assets

## 🔄 Continuous Deployment

Vercel automatically:
- Builds and deploys on every push to main branch
- Generates preview deployments for pull requests
- Provides instant rollbacks if needed

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test locally with production environment
4. Contact support through your platform's support channels

---

## 🎯 Post-Deployment Checklist

- [ ] Test all major user flows
- [ ] Verify payment integration
- [ ] Test file uploads
- [ ] Verify email/SMS notifications
- [ ] Check mobile responsiveness
- [ ] Test authentication flows
- [ ] Verify API endpoints
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategies
- [ ] Update DNS settings for custom domain

## 📈 Scaling Considerations

As your platform grows:
- Consider upgrading to Vercel Pro for better performance
- Implement database connection pooling
- Use CDN for static assets
- Consider microservices architecture for high-scale features
- Implement proper caching strategies 