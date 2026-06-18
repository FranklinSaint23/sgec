FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev zip unzip git curl libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_pgsql pgsql mbstring zip bcmath xml \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

RUN chmod -R 775 storage bootstrap/cache \
    && php artisan storage:link || true

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

EXPOSE 10000

CMD php artisan config:clear && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
