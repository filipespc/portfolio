# Deployment Guide

## Overview
This setup allows you to run the same portfolio application locally and in production, with separate databases that can be synced.

## Setup Steps

### 1. Create Development Database
- Go to [Neon Console](https://console.neon.tech) 
- Create a new project/database for development
- Save the connection string

### 2. Environment Configuration

Create `.env` file in the root directory:
```bash
# Development Database
DATABASE_URL=your_development_neon_connection_string

# Production Database (for syncing data)
PROD_DATABASE_URL=your_production_neon_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session Secret (generate random string)
SESSION_SECRET=your_random_session_secret

NODE_ENV=development
```

### 3. Initialize Development Database
```bash
npm run db:push
```

### 4. Sync Production Data to Development
```bash
npm run sync:data
```
Run this whenever you want to refresh your local data with production data.

### 5. Run Locally
```bash
npm run dev
```

## Vercel Deployment

### 1. Push to GitHub
- Create a GitHub repository
- Push your code (environment files are gitignored)

### 2. Deploy to Vercel
- Connect your GitHub repo to Vercel
- Add environment variables in Vercel dashboard:
  - `DATABASE_URL` → your production database URL
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY` 
  - `CLOUDINARY_API_SECRET`
  - `SESSION_SECRET`
  - `NODE_ENV` → production

### 3. Deploy
Vercel will automatically build and deploy your application.

## Workflow

**Local Development:**
1. Make changes locally using development database
2. Test thoroughly
3. Commit and push to GitHub

**Production Updates:**
1. Vercel auto-deploys from GitHub
2. Production uses separate database
3. Sync production data back to development when needed: `npm run sync:data`

## Database Management

- **Local/Development**: Safe to experiment, reset, modify
- **Production**: Live data, handled by Vercel deployment
- **Sync**: One-way from production → development only

## Troubleshooting

**Build Errors:**
- Check environment variables are set in Vercel
- Ensure database schema is up to date with `npm run db:push`

**Sync Issues:**
- Verify both DATABASE_URL and PROD_DATABASE_URL are correct
- Check network connectivity to both databases