FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# Playwright Chromium is already installed in the base image

COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
