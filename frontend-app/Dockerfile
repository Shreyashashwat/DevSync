FROM node:20 AS build
WORKDIR /app

COPY package*.json ./

# Install dependencies and explicitly add the missing rollup binary
RUN npm install --legacy-peer-deps && \
    npm install --no-save @rollup/rollup-linux-x64-gnu

COPY .env .env

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]