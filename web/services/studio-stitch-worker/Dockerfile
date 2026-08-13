FROM node:22-bookworm-slim

LABEL org.opencontainers.image.title="ClipStitchr Studio Stitch worker"

RUN npm install --global npm@11.5.1 --ignore-scripts

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg tini \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --workspaces=false

COPY services/studio-stitch-worker ./services/studio-stitch-worker
COPY lib/clipstitchr/studio/stitch ./lib/clipstitchr/studio/stitch
COPY lib/clipstitchr/types/studioStitch ./lib/clipstitchr/types/studioStitch
COPY lib/clipstitchr/types/studioStitchWorker ./lib/clipstitchr/types/studioStitchWorker
COPY vendor/supoclip/v0_1_0/upstream/backend/fonts/TikTokSans-Regular.ttf ./services/studio-stitch-worker/assets/TikTokSans-Regular.ttf
RUN find ./services/studio-stitch-worker ./lib/clipstitchr/studio/stitch \
  -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) -delete

USER node

STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD ["./node_modules/.bin/tsx", "./services/studio-stitch-worker/runStudioReelWorker.ts", "--check"]

ENTRYPOINT ["/usr/bin/tini", "--", "./node_modules/.bin/tsx", "./services/studio-stitch-worker/runStudioReelWorker.ts"]
CMD ["--once"]
