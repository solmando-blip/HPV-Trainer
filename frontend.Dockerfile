FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]