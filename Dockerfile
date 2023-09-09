FROM node:18.12.1 AS development

WORKDIR /app

RUN npm install -g npm@9.1.2

COPY package*.json ./

RUN npm install glob rimraf
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:18.12.1 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /app/dist ./dist

CMD ["node", "dist/main"]
