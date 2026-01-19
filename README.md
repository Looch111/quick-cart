# Quick Cart

A full-stack e-commerce marketplace built with Next.js, Firebase, and Tailwind CSS.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root of your project. You can use the `.env` file as a template. You will need API keys and configuration details from:

-   **Firebase** (for both client-side and admin SDK)
-   **Supabase** (for image storage)
-   **Flutterwave** (for payments)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

This application is ready to be deployed on a platform like Vercel.

1.  Push your code to a Git repository (e.g., GitHub).
2.  Import your repository into Vercel.
3.  Add the environment variables from your `.env.local` file to the Vercel project settings.
4.  Deploy!
