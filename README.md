# Central Hub — ImLocl Team Directory

Organisation chart and team directory for ImLocl. Built with Next.js 14 (App Router) and TypeScript. No external UI libraries.

## Features

- **Org Tree** — vertical top-down hierarchy with pan & zoom
- **Profile Modal** — photo, name, title, project, phone, email, bio, reports-to
- **Admin Panel** — searchable, filterable table with add/edit/remove
- **8 hierarchy levels** — Founder → C-Suite → Director → Manager → Lead → Engineer → Jr. Engineer → Intern
- **Colour-coded** — each level has its own distinct ring colour
- **Persistent** — data saved to localStorage, survives page refresh
- **Dark theme** — ImLocl brand colours throughout

## Quick Start

```bash
# 1. Clone / copy this folder
cd central-hub

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev

# Open http://localhost:3000
```

## Build & Deploy

```bash
# Production build
npm run build
npm start

# Or deploy to Vercel (zero config)
npx vercel

# Or deploy to Azure Container Apps (same as imlocl-admin)
docker build -t central-hub .
```

## Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Project Structure

```
central-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout + metadata
│   │   ├── page.tsx        # Main page — org tree + admin panel
│   │   └── globals.css     # Global styles + animations
│   └── lib/
│       ├── types.ts        # Member type, LEVELS config, SEED data
│       └── storage.ts      # localStorage helpers + uid/initials utils
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Adding Members

### Via UI (Admin panel)
Click **⚙ Admin → + Add Member**, fill in the form, hit **Add Member**.

### Via seed data (code)
Edit `src/lib/types.ts` — the `SEED_MEMBERS` array at the bottom.
Add a new object following this shape:

```ts
{
  id: '14',
  name: 'Your Name',
  title: 'Job Title',
  project: 'Current Project',
  phone: '+91 98765 XXXXX',
  email: 'name@imlocl.com',
  department: 'Technology',  // see DEPARTMENTS list
  level: 5,                  // 0=Founder, 1=C-Suite, ... 7=Intern
  parentId: '7',             // id of their manager, or null for root
  photo: '',                 // URL or leave empty for initials
  bio: 'Short description',
  joinDate: '2025-06-01',
}
```

## Clearing Data

To reset to seed data, open browser console and run:
```js
localStorage.removeItem('central-hub-members-v1');
location.reload();
```
