
FROM node:22.3.0-alpine3.19 AS base

FROM base AS dependencies
WORKDIR /app

COPY package.json yarn.lock ./
# Install dependencies without running build scripts
RUN yarn install --frozen-lockfile --production=false --ignore-scripts

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
ENV NODE_ENV production
# Build the library
RUN yarn tsc -p tsconfig.build.json --sourceMap --inlineSources
# Keep all dependencies for playground (including dev dependencies)
RUN yarn cache clean

USER node

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/playground ./playground
COPY --from=build /app/tsconfig.json ./tsconfig.json

# Start the playground stateful server
CMD [ "npx", "ts-node", "playground/servers/server-stateful.ts" ]