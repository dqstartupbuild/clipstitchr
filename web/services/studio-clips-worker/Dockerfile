FROM node:22-bookworm-slim

RUN npm install --global npm@11.5.1 --ignore-scripts

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg python3 tini \
  && rm -rf /var/lib/apt/lists/*

ADD --checksum=sha256:e5d57466682cfa9d61e9cf7c8a4f09b00f4a62af37d3bbdc4bcffdf63615feac \
  https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.09/yt-dlp \
  /usr/local/bin/yt-dlp
RUN chmod 0755 /usr/local/bin/yt-dlp

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --workspaces=false

COPY services/studio-clips-worker ./services/studio-clips-worker
COPY vendor/supoclip/v0_1_0/upstream/backend/fonts ./services/studio-clips-worker/assets/fonts

ENV STUDIO_CLIPS_BUILT_IN_FONTS_DIRECTORY=/app/services/studio-clips-worker/assets/fonts

USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD ["./node_modules/.bin/tsx", "./services/studio-clips-worker/runStudioClipsWorker.ts", "--check"]

ENTRYPOINT ["/usr/bin/tini", "--", "./node_modules/.bin/tsx", "./services/studio-clips-worker/runStudioClipsWorker.ts"]
CMD ["--once"]
