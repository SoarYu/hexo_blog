---
title: gitlab-docker部署
date: 2022-10-18 19:47:43
categories: 
 - leetcode
---


## docker 镜像拉取
docker pull twang2218/gitlab-ce-zh
docker pull gitlab/gitlab-ce

## docker 容器启动
```
docker run -d \
    --hostname 192.168.69.234 \
    -p 8443:443 -p 8080:80 -p 8022:22 \
    --restart always \
    --name gitlab \ 
    -v /home/fisher/gitlab/config:/etc/gitlab \
    -v /home/fisher/gitlab/logs:/var/log/gitlab \
    -v /home/fisher/gitlab/data:/var/opt/gitlab \
    gitlab/gitlab-ce
```

## 修改gitlab.rb文件

vim /home/fisher/gitlab/config/gitlab.rb

配置http协议所使用的访问地址,不加端口号默认为80
external_url 'http://192.168.199.231'

配置ssh协议所使用的访问地址和端口
gitlab_rails['gitlab_ssh_host'] = '192.168.199.231'
gitlab_rails['gitlab_shell_ssh_port'] = 222 # 此端口是run时22端口映射的222端口

docker exec -it gitlab /bin/bash  进去gitlab容器的命令
gitlab-ctl reconfigure  重置gitlab客户端的命令

## 修改root密码
1. 进入容器内部
docker exec -it gitlab /bin/bash
 
2. 进入控制台
gitlab-rails console -e production
 
3. 查询id为1的用户，id为1的用户是超级管理员
user = User.where(id:1).first
4. 修改密码为lhx123456
user.password='lhx123456'
5. 保存
user.save!
6. 退出
exit