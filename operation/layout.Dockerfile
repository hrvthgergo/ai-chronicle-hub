FROM gem-gem-frontend:latest

# Copy static frontend assets, catalog data, and media assets
COPY layout/ /usr/share/nginx/html/layout/
COPY data/ /usr/share/nginx/html/data/
COPY assets/ /usr/share/nginx/html/assets/

# Redirect root page requests to the layout directory
RUN echo '<meta http-equiv="refresh" content="0; url=/layout/">' > /usr/share/nginx/html/index.html
