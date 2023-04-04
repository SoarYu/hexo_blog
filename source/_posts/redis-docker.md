---
title: linux docker 安装redis
date: 2022-04-10 01:59:43
description: linux 使用 docker 部署 redis 流程
categories: 
 - Docker
---
[redis-docker](https://blog.csdn.net/u014282578/article/details/128061249)

docker pull redis



mkdir -p /home/redis/conf /home/redis/data

wget https://download.redis.io/redis-stable.tar.gz

tar -xzf redis-stable.tar.gz

cp */redis-stable/redis.conf /home/redis/conf

1.修改bind

bind 127.0.0.1 修改为 bind 0.0.0.0

127.0.0.1        表示只允许本地访问,无法远程连接

0.0.0.0     表示任何ip都可以访问

ngg 87 bind 127...

ngg 504 dir /data

ngg 1036 requirepass *

docker run --name redis -p 6379:6379 -v /home/redis/conf:/usr/local/etc/redis -v /home/redis/data:/data -d redis redis-server /usr/local/etc/redis/redis.conf

docker restart redis
