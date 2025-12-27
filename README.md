# Traveling Mangement App

A **Next.js** application for managing trips, itineraries, and activities. This project integrates **Supabase** for backend services and **Google OAuth** for authentication. It’s designed to be containerized using Docker for easy deployment

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Local Development](#local-development)
  * [Environment Variables](#environment-variables)
* [Running with Docker](#running-with-docker)
* [Deployment](#deployment)
* [Learn More](#learn-more)

---

## Demo Images
<img width="1438" height="717" alt="Screenshot 2025-11-03 at 8 32 37 PM" src="https://github.com/user-attachments/assets/a4cfad62-edd0-472c-b71b-6199a2b31535" />
<img width="2592" height="1075" alt="image" src="https://github.com/user-attachments/assets/20baaddd-cca1-41ef-a456-231c6d07ef96" />
<img width="2595" height="1277" alt="image" src="https://github.com/user-attachments/assets/7e85a47b-044b-40ab-bc5b-45a82bd89af4" />
<img width="2585" height="1527" alt="image" src="https://github.com/user-attachments/assets/4a342d87-d7f2-46e6-83d6-44948ab46f15" />
<img width="3575" height="1430" alt="image" src="https://github.com/user-attachments/assets/65740e64-cf04-4b5c-851e-7de50759513f" />
<img width="1205" height="1062" alt="image" src="https://github.com/user-attachments/assets/6c4c2410-ed65-48a0-a798-8363e479cb77" />
<img width="2285" height="1232" alt="image" src="https://github.com/user-attachments/assets/f671266c-923d-4d25-a060-5cea5b8aaac7" />
<img width="1165" height="1982" alt="image" src="https://github.com/user-attachments/assets/5539ade0-6afd-4053-9880-f6ca8ca89cb4" />
<img width="1440" height="720" alt="Screenshot 2025-11-03 at 8 37 35 PM" src="https://github.com/user-attachments/assets/536ec5ce-ead5-43cc-9e88-68edcf3f621a" />
<img width="1440" height="718" alt="Screenshot 2025-11-03 at 8 39 21 PM" src="https://github.com/user-attachments/assets/5e368706-2341-42c2-98be-5c6d7e2b38f5" />

## Features

* User authentication with **Google OAuth**.
* Trip and activity management.
* Supabase backend for database and authentication.
* Fully responsive UI built with **Next.js**.
* Optimized for production with Docker support.

---

## Tech Stack

* **Frontend & Backend**: Next.js (React)
* **Database & Auth**: Supabase
* **Containerization**: Docker
* **Styling**: Tailwind CSS (optional, if used)
* **Authentication**: NextAuth.js with Google OAuth

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) >= v18
* [npm](https://www.npmjs.com/) (comes with Node.js)
* [Docker](https://www.docker.com/) (optional, for containerized deployment)
* A Supabase project with credentials (URL & anon key)
* Google OAuth credentials for authentication

---

### Local Development

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd Traveling-Note-App
```

2. **Install dependencies:**

```bash
npm install
# or
yarn
# or
pnpm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root of the project:

```bash
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
The page auto-updates as you edit the code.

---

### Environment Variables

| Variable                        | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `NEXTAUTH_SECRET`               | Secret key for NextAuth session encryption    |
| `NEXTAUTH_URL`                  | URL where your app runs (local or production) |
| `GOOGLE_CLIENT_ID`              | Google OAuth client ID                        |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth client secret                    |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon API key                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-side only)  |

---

## Running with Docker

You can run the app in a container for easier deployment.

1. **Build the Docker image:**

```bash
docker build -t traveling_app_management .
```

2. **Run the container:**

```bash
docker run -p 3000:3000 traveling_app_management
```

3. **Access the app:**

Open [http://localhost:3000](http://localhost:3000) in your browser.

> ⚠ Note: If you cannot access the site, make sure your Next.js app listens on all interfaces by setting the host to `0.0.0.0`:

```json
// package.json
"scripts": {
  "start": "next start -H 0.0.0.0 -p 3000"
}
```

---

## Deployment

The easiest way to deploy is using **Vercel**, the creators of Next.js:

1. Connect your GitHub repository to Vercel.
2. Set up environment variables in the Vercel dashboard (same as `.env.local`).
3. Deploy, and your app will be live on a Vercel domain.

For more details, see the [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Learn More

* [Next.js Documentation](https://nextjs.org/docs)
* [Supabase Documentation](https://supabase.com/docs)
* [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
* [Vercel Deployment Guide](https://vercel.com/docs)

---

This README provides **full instructions** for local development, Docker usage, and production deployment.

---

If you want, I can also create a **Docker-ready README section** that includes **production build and environment secrets handling best practices** for Next.js + Supabase.

Do you want me to add that?
