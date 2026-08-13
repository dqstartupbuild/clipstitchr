# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS dependencies
WORKDIR /workspace

COPY package.json package-lock.json ./
COPY services/publishing-service/package.json ./services/publishing-service/package.json
RUN npm ci --workspace @clipstitchr/publishing-service --include-workspace-root=false

FROM dependencies AS build
COPY services/publishing-service ./services/publishing-service
RUN npm run build --workspace @clipstitchr/publishing-service
RUN npm prune --omit=dev --workspace @clipstitchr/publishing-service --include-workspace-root=false

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /workspace

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY services/publishing-service/package.json ./services/publishing-service/package.json
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/services/publishing-service/dist ./services/publishing-service/dist
COPY --from=build /workspace/services/publishing-service/prisma ./services/publishing-service/prisma

USER node
WORKDIR /workspace/services/publishing-service
CMD ["npm", "run", "start"]
