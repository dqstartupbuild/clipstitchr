FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g npm@11.5.1
RUN npm ci --omit=dev

COPY . .

ENTRYPOINT ["npm", "run", "provider-worker", "--"]
CMD ["--once", "--max-jobs=3"]
