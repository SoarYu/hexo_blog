---
title: linux docker 安装redis
date: 2022-01-10 01:59:43
categories: 
 - 学习
---

https://blog.csdn.net/u014282578/article/details/128061249

docker pull redis



mkdir -p /home/redis/conf /home/redis/data

wget https://download.redis.io/redis-stable.tar.gz

tar -xzf redis-stable.tar.gz

cp */redis-stable/redis.conf /home/redis/conf

ngg 87 bind 127...

ngg 504 dir /data

ngg 1036 requirepass *

docker run --name redis -p 6379:6379 -v /home/redis/conf:/usr/local/etc/redis -v /home/redis/data:/data -d redis redis-server /usr/local/etc/redis/redis.conf

docker restart redis