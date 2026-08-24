FROM node:18-alpine

WORKDIR /app

# VITE_API_URL is baked into the bundle at build time by Vite.
# Declaring ARG lets Railway inject the service variable during docker build.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
RUN npm install

COPY . .

# Production build -> dist/
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "vite preview --host 0.0.0.0 --port 3000"]
