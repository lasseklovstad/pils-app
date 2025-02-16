FROM node:22.12-alpine3.20 as base
RUN npm install -g pnpm

FROM base AS prod-deps
COPY . /app
WORKDIR /app
RUN pnpm install --prod --frozen-lockfile

FROM base as build
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm run build


# Final stage for app image
FROM base
WORKDIR /app
# Set production environment
ENV NODE_ENV=production
ENV APP_DATABASE_URL=/data/sqlite.db
ENV MEDIA_DIRECTORY=/data

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/migrations /app/migrations

RUN mkdir /data
# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]