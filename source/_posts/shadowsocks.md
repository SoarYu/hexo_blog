---
title: CentOS 7 安装部署Shadowsocks-libev
date: 2023-04-30 20:33:43
description: 这篇教程记录了如何安装，配置并维护一台Shadowsocks-libev服务器。
categories: 
 - linux
---

这篇教程记录了如何安装，配置并维护一台Shadowsocks-libev服务器。 这篇教程的亮点在于， 按照这里的配置建议，你的Shadowsocks-libev服务器可以抵御各种已知的攻击， 包括来自GFW的主动探测和封锁以及partitioning oracle攻击。 我们还在教程的最后加入了有关Shadowsocks-libev部署的常见问题。 截止2021年11月7日，我们收到零星的用户报告按此教程配置的服务器仍遭到了端口封锁，我们因此在文中分享一个配置备用端口来缓解端口封锁的方法。

## 一. 安装 snap 应用商店
通过Snap应用商店安装Shadowsocks-libev是官方推荐的方式。
- 如果你的服务器运行Ubuntu 16.04 LTS及以上的版本，Snap已经默认安装好了。
- 如果你的服务器运行了其他的Linux发行版，你只需跟着对应的发行版安装Snap core。
1. 安装 EPEL 
```bash
yum install epel-release -y
```

2. 安装snapd
```bash
yum install snapd -y
```

3. 添加snap启动通信socket
```bash
systemctl enable --now snapd.socket
```

4. 创建链接（snap软件包一般安装在/snap目录·下）
```bash
ln -s /var/lib/snapd/snap /snap
```

5. 安装snap core(更新)
```bash
snap install core
```

## 二、安装Shadowsocks-libe

1. 安装最新的Shadowsocks-libev:
```bash
sudo snap install shadowsocks-libev --edge
```

2. 配置**通过Snap安装**的Shadowsocks-libev的配置文件：
```bash
cd /var/snap/shadowsocks-libev/common/etc/shadowsocks-libev/

wget -O config.json https://raw.githubusercontent.com/eebond/banwagong/main/shadowsocks-libev/config.json
```

下面是我们推荐的Shadowsocks-libev服务器配置：

```json
{
    "server":["::0","0.0.0.0"],
    "server_port":8389,
    "method":"chacha20-ietf-poly1305",
    "password":"YourPassword",
    "mode":"tcp_and_udp",
    "fast_open":false
}
```
注意，你需要把里面的ExamplePassword替换成一个更强的密码。 强密码有助缓解最新发现的针对Shadowsocks服务器的Partitioning Oracle攻击。你可以用以下命令在终端生成一个强密码：openssl rand -base64 16。

你还可以考虑将server_port的值从8389改为1024到65535之间的任意整数。

可以看到，通过Snap安装的Shadowsocks-libev默认的配置文件路径太长了，不便于记忆。同时默认配置路径又没有在官方文档中标出。 我们因此建议你收藏此页面，以备今后查找。

## 三、Shadowsocks-libev作为服务的启动与维护

1. 运行Shadowsocks-libev
```bash
systemctl start snap.shadowsocks-libev.ss-server-daemon.service
```

2. 设置Shadowsocks-libev开机自启动：
```bash
sudo systemctl enable snap.shadowsocks-libev.ss-server-daemon.service
```

3. 检查运行状态和日志
以下命令可以查看Shadowsocks-libev的运行状态：
```bash
sudo systemctl status snap.shadowsocks-libev.ss-server-daemon.service
```
如果你看到绿色的Active: active (running)，那么你的Shadowsocks-libev服务器就在正常的运行； 如果你看到红色的Active: failed，请用跳至如下命令journalctl -u snap.shadowsocks-libev.ss-server-daemon.service的尾部查看问题出在哪里了。

4. 重新加载配置文件
每当你修改过配置文件后，请用如下命令重启Shadowsocks-libev以加载修改后的文件：
```bash
sudo systemctl restart snap.shadowsocks-libev.ss-server-daemon.service
```


[参考地址](https://eebond.github.io/centos-7-%E5%AE%89%E8%A3%85%E9%83%A8%E7%BD%B2shadowsocks-libev/)

