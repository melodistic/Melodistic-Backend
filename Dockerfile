FROM node:latest as builder

WORKDIR /app

COPY package.json ./

RUN yarn

COPY ./ ./

RUN npx prisma generate

RUN yarn build


FROM node:14-alpine as runner

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

EXPOSE 3000
CMD ["node", "dist/main"]