# <img src="./src/assets/media/tasi_logo.svg" alt="Tasi Logo" height="32" style="vertical-align: -5px; margin-right: 8px;"> Luxury Fashion Storefront

A high-performance modern fashion brand and luxury storefront built with **Next.js**, **React**, **TypeScript**, **Tailwind**, **TanStack Query**, and **Motion**.

---

## Architecture & Tech Stack

- **Framework:** Next.js (App Router, Server Components & Dynamic Route Handlers)
- **UI Library:** React 19
- **State Management & Data Fetching:** 
  - `@tanstack/react-query` v5 for cached queries, infinite scrolling, and background refetching.
  - Native React Context (`CartContext`, `AuthContext`) for lightweight, SSR-hydration-safe global states.
- **Styling:** Tailwind CSS v4 with custom font configurations `Oswald` and `DMSans` (main and secondary fonts).
- **Animations:** Motion (`motion/react`) for layout transitions, drawers, and lightbox viewers.
- **Icons:** `lucide-react`.

---

## Project Structure

```
src/
├── app/                  # App entry points, layout, providers, dynamic metadata
│   ├── auth/             # Login and registration route handlers
│   ├── cart/             # Shopping bag page
│   ├── checkout/         # Multi-step checkout & authorization
│   ├── collections/      # Curated studio lookbook routes
│   └── shop/             # Dynamic catalog & product routes
├── assets/
│   ├── media/            # Optimized WebP/SVG local photography & brand wordmarks
│   └── styles/           # Global styles and font definitions
├── components/           # Modular storefront components (Hero, Navbar, Category, Footer...)
├── context/              # Cart & Authentication state providers with localStorage persistence
├── data/                 # Studio collection definitions and category configs
├── hooks/                # Custom hooks
├── types/                # TypeScript interfaces for products and responses
├── utils/                # Product querying, slugification, and DummyJSON mapping service
└── views/                # Home, Explore, Product, Cart, Checkout, Auth, etc.
```

---

## Key Features

1. **Live Catalog & Infinite Scrolling:**
   - Powered by TanStack React Query with infinite page fetching, category filtering, price range adjustments, and sorting.
   - Robust offline/network error states with retry capabilities.
2. **Persistent Shopping Bag:**
   - Client-side synchronized cart state with local storage persistence, line-item variant tracking, and SSR hydration safety.
3. **Session & Auth Management:**
   - Seamless demo credentials (`client@tasi.com`), guest checkout fallback, and account management.
4. **Studio Lookbook:**
   - High-fidelity interactive collection viewer with lightbox modal support and keyboard navigation.
5. **Live Product Search:**
   - Real-time debounced query drawer on desktop and mobile with instant product previews.

---
