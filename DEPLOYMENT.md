# HyperTask Deployment Guide

## Quick Start

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Deployment Options

### 1. Vercel (Recommended)
The easiest way to deploy your Next.js app:

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will detect Next.js and configure automatically
4. Deploy!

### 2. Netlify
```bash
npm run build
# Deploy the .next folder
```

### 3. Docker
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t hypertask .
docker run -p 3000:3000 hypertask
```

### 4. AWS, GCP, Azure
- Use their respective Next.js deployment guides
- Ensure Node.js 18+ is available
- Set up environment variables

## Environment Variables

Create a `.env.local` file for local development:

```env
# Monad Network
NEXT_PUBLIC_MONAD_RPC_URL=https://...
NEXT_PUBLIC_CHAIN_ID=...

# Smart Contracts
NEXT_PUBLIC_ESCROW_CONTRACT=0x...
NEXT_PUBLIC_HYPER_TOKEN=0x...

# API Keys (if needed)
NEXT_PUBLIC_API_KEY=...
```

## Performance Optimization

### 1. Image Optimization
- Use Next.js `<Image>` component
- Serve images through CDN
- Use appropriate formats (WebP, AVIF)

### 2. Code Splitting
- Already handled by Next.js
- Use dynamic imports for large components:
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

### 3. Caching
- Leverage Next.js built-in caching
- Use Redis for API responses
- Implement service workers for offline support

### 4. Bundle Size
Monitor and optimize:
```bash
npm run build
# Check .next/analyze
```

## Security Checklist

- [ ] Remove all console.logs from production
- [ ] Validate all user inputs
- [ ] Implement rate limiting
- [ ] Use HTTPS only
- [ ] Set proper CORS headers
- [ ] Sanitize transaction data
- [ ] Use environment variables for secrets
- [ ] Enable Content Security Policy

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay and debugging
- **Google Analytics**: User behavior tracking

### Health Checks
Create `/api/health` endpoint:
```typescript
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: Date.now() })
}
```

## Troubleshooting

### Common Issues

**Build Fails**
- Clear `.next` and `node_modules`
- Run `npm ci` for clean install
- Check Node version (requires 18+)

**Styles Not Loading**
- Verify Tailwind config paths
- Check PostCSS setup
- Clear browser cache

**Slow Performance**
- Enable Next.js image optimization
- Implement lazy loading
- Use production build (`npm run build`)
- Check network tab for large assets

## Scaling

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for session management
- Implement CDN for static assets

### Database Scaling
- Use connection pooling
- Implement read replicas
- Cache frequent queries

## Maintenance

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

### Backup
- Regular database backups
- Version control (Git)
- Environment variable documentation

## Support

For deployment issues:
1. Check Next.js documentation
2. Review deployment platform docs
3. Check GitHub issues
4. Contact development team

---

Last updated: February 2026
