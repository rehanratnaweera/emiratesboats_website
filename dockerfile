FROM nginx:alpine
# Copy the compiled Vite assets to the Nginx web root
COPY dist /usr/share/nginx/html
# Expose standard HTTP port
EXPOSE 80
# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]