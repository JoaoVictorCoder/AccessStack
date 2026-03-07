FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY index.html ./index.html
COPY vite.config.js ./vite.config.js
COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev"]
