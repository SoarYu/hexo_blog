---
title: Hexo部署到腾讯云（Ubuntu 20.04）
date: 2022-06-25 16:07:00
description: 
categories: 
 - Deploy相关
---
# Hexo部署到腾讯云
<!-- more -->
## git配置

**创建一个名为blog的用户，用于管理Hexo项目**
```bash
    adduser blog
```

### 给blog用户添加文件的写权限
```bash
    vim /etc/sudoers

    #找到User privilege specification部分，添加如下内容：
    blog    ALL=(ALL:ALL) AL
```
![](/img/hexo-bt-tcCloud/add-blog-su.png)

### 切换至blog用户
```bash
    su blog
```
**退回到根路径（cd /），在/var/repo下创建名为hexo_static的裸仓库**
```bash
    sudo mkdir /var/repo/
    sudo chown -R $USER:$USER /var/repo/
    sudo chmod -R 755 /var/repo/

    cd /var/repo/
    git init --bare hexo_static.git
```
![](/img/hexo-bt-tcCloud/init-hexo-git.png)

## 创建Git钩子

**在之前创建的hexo_static裸仓库下有一个hooks文件夹，在其中创建一个名为post-receive的钩子文件：**
```bash
    vim /var/repo/hexo_static.git/hooks/post-receive
```
**在其中写入如下内容：**
```shell
    #!/bin/bash
    git --work-tree=/var/www/hexo --git-dir=/var/repo/hexo_static.git checkout -f
```
**让该文件变为可执行文件**
```bash
    chmod +x /var/repo/hexo_static.git/hooks/post-receive
```

## nginx 配置

### 安装Nginx
```bash
    sudo apt-get install nginx -y
```

### 创建/var/www/hexo目录，用于Nginx托管，修改目录所有权和权限
```shell
    sudo mkdir -p /var/www/hexo
    sudo chown -R $USER:$USER /var/www/hexo
    sudo chmod -R 755 /var/www/hexo
```

### 使用vim修改/etc/nginx/sites-enabled/default，使root指向hexo目录

```shell
    sudo vim /etc/nginx/sites-enabled/default

    #找到server部分，修改如下内容
    root /var/www/hexo;
```
![](/img/hexo-bt-tcCloud/change-nginx-server.png)

### 重启Nginx服务，使得改动生效
```shell
    sudo service nginx restart
```

## 本地搭建hexo客户端（Windows）

- 首先安装git，这里不再过多赘述
- 使用命令ssh-keygen -t rsa在windons用户下/.ssh文件夹中生成密钥
- 将生成的公钥 .pub 文件内容拷贝到ubuntu服务器的/home/blog/.ssh/authorized_keys上

### 部署Hexo项目
**编辑hexo的config.yml文件，在deploy处修改repo项：**
```yaml
deploy:
  type: git
  repo: blog@server_ip:/var/repo/hexo_static.git
  branch: master
```
**执行命令部署Hexo项目**
```shell
    hexo clean
    hexo generate
    hexo deploy
```

**进入目录var/www/hexo/下，可以看到静态文件已全部上传**
```
root@VM-8-16-ubuntu:/var/www/hexo# ll
total 96
drwxr-xr-x 12 blog blog  4096 Jun 25 19:59 ./
drwxr-xr-x  4 root root  4096 Jun 25 19:52 ../
drwxrwxr-x  3 blog blog  4096 Jun 25 19:59 2022/
-rw-rw-r--  1 blog blog  9178 Jun 25 19:59 404.html
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 about/
drwxrwxr-x  3 blog blog  4096 Jun 25 19:59 archives/
drwxrwxr-x  4 blog blog  4096 Jun 25 19:59 categories/
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 css/
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 img/
-rw-rw-r--  1 blog blog 15098 Jun 25 19:59 index.html
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 js/
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 links/
-rw-rw-r--  1 blog blog 20259 Jun 25 19:59 local-search.xml
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 tags/
drwxrwxr-x  2 blog blog  4096 Jun 25 19:59 xml/

```
### 访问测试
**打开浏览器，输入Ubuntu服务器的IP地址，就可以看到博客页面啦**