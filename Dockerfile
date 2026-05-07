FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

RUN npm install

FROM base AS development
COPY . .
ENV PORT=5000
EXPOSE ${PORT}

CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE ${PORT}

CMD ["npm", "start"]