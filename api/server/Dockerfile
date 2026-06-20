FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/db ./db
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
