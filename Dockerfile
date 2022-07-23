FROM node:latest as builder

WORKDIR /app

COPY package.json ./

RUN yarn

RUN mkdir ./prisma

COPY ./prisma/schema.prisma ./prisma/

RUN npx prisma generate

COPY ./ ./

RUN yarn build


FROM node:16 as runner

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

EXPOSE 3000
CMD ["node", "dist/main"]