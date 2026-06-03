FROM node:18-alpine
WORKDIR /app
RUN npm init -y && npm install express pg
COPY app.js .
CMD ["node", "app.js"]
