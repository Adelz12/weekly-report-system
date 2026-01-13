# Frontend Build Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_LOGLEVEL=warn

RUN npm ci --prefer-offline --no-audit

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npx react-scripts build

# Nginx Production Stage
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
