FROM php:8.2-fpm

# 安装系统依赖
RUN apt-get update && apt-get install -y \
  nginx \
  git \
  unzip \
  libzip-dev \
  libonig-dev \
  && docker-php-ext-install pdo pdo_mysql zip mbstring \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 安装 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 设置工作目录
WORKDIR /var/www/html

# 复制项目文件
COPY . .

# 安装 PHP 依赖
RUN composer install --no-dev --optimize-autoloader

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/sites-available/default

# 设置权限
RUN chown -R www-data:www-data /var/www/html

# 创建启动脚本
RUN echo '#!/bin/bash\nphp-fpm -D && nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
