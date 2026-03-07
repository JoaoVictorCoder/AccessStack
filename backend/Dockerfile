FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY start.sh ./start.sh

EXPOSE 3001

CMD ["sh", "./start.sh"]
