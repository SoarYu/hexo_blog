---
title: CentOS 7 安装部署 Nginx 并配置端口转发
date: 2023-05-07 13:40:43
description: 这篇教程记录了如何安装，配置并维护一台 Nginx 服务器。
categories: 
 - linux
---

## 安装 Nginx

1. 安装 EPEL（Extra Packages for Enterprise Linux）扩展仓库：
```bash
sudo yum install epel-release
```

2. 安装 Nginx：
```bash
sudo yum install nginx
```

3. 启动 Nginx 服务：
```bash
sudo systemctl start nginx
```

4. 设置 Nginx 开机自启动：
```bash
sudo systemctl enable nginx
```

5. 确认 Nginx 是否已经启动：
```bash
sudo systemctl status nginx
```
如果输出结果中包含 "active (running)" 则表示 Nginx 已经启动并运行正常。

## 配置 Nginx 根据二级域名端口转发
1. 在nginx配置文件目录中创建配置文件
```bash
vim /etc/nginx/conf.d/example.conf
```

2. 在 http 区块内添加 server block，可以参考以下示例：
```perl
server {
    listen       80;
    server_name  server.example.com;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
上面的配置中，Nginx 会监听 80 端口，将请求转发到 127.0.0.1:8080 地址。server_name 应该改为您自己的子域名。其中，proxy_set_header 部分用于将 HTTP 请求头信息转发到后端服务。

3. 保存并退出文本编辑器，然后重新加载 Nginx 配置文件：
```bash
sudo systemctl reload nginx
```

4. 在浏览器中输入子域名 server.example.com，确认 Nginx 是否已经将请求成功转发到 8080 端口上的应用程序。
这样，您就可以通过 Nginx 将子域名 server.example.com 的请求从 80 端口转发到 8080 端口上。