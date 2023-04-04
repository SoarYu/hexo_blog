---
title: mysql-docker部署
date: 2022-06-25 20:32:43
description: ubuntu使用docker部署mysql
categories: 
 - Docker
---
## docker 安装
```
    apt install docker.io
```

## docker 拉取mysql官方镜像
```
    docker pull mysql:8.0.18
```
![](/img/docker-mysql/docker-pull-mysql.png)

## 查看本地镜像
**使用以下命令来查看是否已安装了 mysql：**
```
    docker images
```
![](/img/docker-mysql/docker-mysql-images.png)
**在上图中可以看到我们已经安装了8.0.18版本的 mysql 镜像。**

## 运行容器
**安装完成后，我们可以使用以下命令来运行 mysql 容器：**
```
    docker run -itd --name mysql-test -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0.18
```
参数说明：
-p 3306:3306 ：映射容器服务的 3306 端口到宿主机的 3306 端口，外部主机可以直接通过 宿主机ip:3306 访问到 MySQL 的服务。
MYSQL_ROOT_PASSWORD=123456：设置 MySQL 服务 root 用户的密码。

## 安装成功
通过 docker ps 命令查看是否安装成功：

本机可以通过 root 和密码 123456 访问 MySQL 服务。

![](/img/docker-mysql/docker-ps-mysql.png)


## 远程访问

docker exec -it $container$ /bin/bash

mysql -u root -p

alter user 'user'@'%' identified with mysql_native_password by '123456';

开启远程连接
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password'; 
这个密码为password，是之后远程连接mysql的密码。
FLUSH PRIVILEGES;