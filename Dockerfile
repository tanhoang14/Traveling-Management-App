# ------------------------------
# Stage 1: Build
# ------------------------------
FROM node:22 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all app files
COPY . .

# Build-time arguments for public env vars
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Next.js
RUN npm run build

# ------------------------------
# Stage 2: Production
# ------------------------------
FROM node:22

WORKDIR /app

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Runtime environment variables (pass secrets at runtime!)
ENV NODE_ENV=production
ENV NEXTAUTH_URL="traveling-management-app.vercel.app"
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]
