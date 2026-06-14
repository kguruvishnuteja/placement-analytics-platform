# Vercel Deployment Guide — Frontend

## Prerequisites
- Vercel account (free at vercel.com)
- Backend API deployed on Azure (get the URL first)

---

## Method 1 — Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login
vercel login

# Deploy
vercel

# Follow prompts:
#   - Set up and deploy: Yes
#   - Which scope: your account
#   - Link to existing project: No
#   - Project name: placement-analytics
#   - Directory: ./
#   - Override build settings: No
```

### Set Environment Variables

```bash
vercel env add VITE_API_URL production
# Enter value: https://placement-api.azurewebsites.net/api
```

### Deploy to Production

```bash
vercel --prod
```

---

## Method 2 — GitHub Integration (Auto-deploy)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://placement-api.azurewebsites.net/api`
6. Click **Deploy**

Every push to `main` will auto-deploy.

---

## vercel.json (place in /frontend)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## GitHub Actions (CI/CD)

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci --legacy-peer-deps

      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

---

## Custom Domain (Optional)

```bash
vercel domains add placement-analytics.yourdomain.com
vercel alias set <deployment-url> placement-analytics.yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] Visit `https://placement-analytics.vercel.app`
- [ ] Test login with demo accounts
- [ ] Verify API calls go through (check Network tab)
- [ ] Test resume upload
- [ ] Test dark mode toggle
- [ ] Check mobile responsiveness
