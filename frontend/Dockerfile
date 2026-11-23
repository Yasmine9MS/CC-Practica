# ETAPA 1: Construcción del frontend
FROM node:24.11.1-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ETAPA 2: Servidor web no privilegiado
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]