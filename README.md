# HackUTD-cometNow
The project repo for the HackUTD competition

## Getting Started

This is a [Next.js](https://nextjs.org) Progressive Web App (PWA) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

**Note:** PWA features are disabled in development mode for easier debugging. Service workers will only be active in production builds.

### Building for Production

Build the application:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

### Linting

Run the linter:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## Project Structure

- `app/` - Application routes and components (App Router)
- `public/` - Static assets, PWA icons, and manifest
- `app/globals.css` - Global styles with Tailwind CSS
- `public/manifest.json` - PWA manifest file
- `public/icon-*.png` - PWA app icons

## Technologies Used

- **Next.js 16** - React framework for production
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint** - Code linting tool
- **PWA** - Progressive Web App with offline support and installability

## Progressive Web App Features

This application is configured as a Progressive Web App with the following features:

- **📱 Installable** - Can be installed on mobile and desktop devices
- **⚡ Offline Support** - Works offline with service worker caching
- **🚀 Fast Loading** - Optimized caching strategies for better performance
- **📲 App-like Experience** - Runs in standalone mode when installed
- **🔔 Push Notifications Ready** - Infrastructure in place for push notifications

### Installing the PWA

When you visit the production site, you can install it as an app:

- **On Desktop**: Look for the install icon in the browser address bar
- **On Mobile**: Tap "Add to Home Screen" from the browser menu

### PWA Configuration

- Service Worker: Auto-generated and managed by `@ducanh2912/next-pwa`
- Manifest: Located at `/public/manifest.json`
- Icons: 192x192 and 512x512 PNG icons for different devices
- Theme Color: Black (`#000000`)
- Display Mode: Standalone

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [PWA Documentation](https://web.dev/progressive-web-apps/) - learn about Progressive Web Apps.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

