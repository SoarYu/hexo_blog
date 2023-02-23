---
title: linux部署clash服务 
date: 2022-06-27 15:21:43
categories:
 - Deploy相关
---

安装：

查找相应版本
https://github.com/Dreamacro/clash/releases

wget 相应版本下载链接

gzip -d clash-linux-amd64-v1.11.0.gz

chmod +x clash-linux-amd64-v1.11.0

mkdir /opt/clash
mv clash-linux-amd64-v1.11.0 /opt/clash/clash


下载配置信息等
cd ~/.config/clash
sudo wget -O config.yaml [订阅链接]
sudo wget -O Country.mmdb https://www.sub-speeder.com/client-download/Country.mmdb


配置clash.service服务

sudo vim /etc/systemd/system/clash.service

```
[Unit] 
Description=clash
After=network-online.target
Wants=network-online.target systemd-networkd-wait-online.service
​
[Service]
Type=simple
User=root
Group=root
DynamicUser=true
ExecStart=/opt/clash/clash -d /etc/clash/
Restart=always
LimitNOFILE=512000
​
[Install]
WantedBy=multi-user.target
```

重新加载systemctl daemon

sudo systemctl daemon-reload
启动Clash

sudo systemctl start clash.service

设置Clash开机自启动

sudo systemctl enable clash.service
以下为Clash相关的管理命令

启动Clash
sudo systemctl start clash.service
重启Clash
sudo systemctl restart clash.service
查看Clash运行状态
sudo systemctl status clash.service

然后通过浏览器访问 http://clash.razord.top 进行策略组设置。

随后系统设置，网络设置中添加http代理，IP 127.0.0.1 端口 7890 socks代理，IP 127.0.0.1 端口 7891。

即可完成，也可以设置开机自启动，这样的话，不用每天自己运行/usr/bin/clash -d /etc/clash/命令了。


#!/usr/bin/env bash
# cd GOPATH
cd $GOPATH/src/

# remove codes
rm -rf coredns
rm -rf nacos-coredns-plugin

# clone current codes
git clone https://github.com/coredns/coredns.git

git clone https://github.com/nacos-group/nacos-coredns-plugin.git

# cdl nacos-coredns-plugin directory
cd $GOPATH/src/nacos-coredns-plugin

git checkout -b v1.6.7 origin/v1.6.7
# cd coredns directory
cd $GOPATH/src/coredns
git checkout -b v1.6.7 v1.6.7
go get github.com/cihub/seelog

# copy nacos plugin to coredns
cp -r ../nacos-coredns-plugin/nacos plugin/
cp -r ../nacos-coredns-plugin/forward/setup.go plugin/forward

# insert nacos into plugin
sed -i '/hosts/a\\t"nacos",' core/dnsserver/zdirectives.go
sed -i '/coredns\/plugin\/hosts/a\\t_ "coredns/plugin/nacos"' core/plugin/zplugin.go
sed -i '/hosts:hosts/a\nacos:nacos' plugin.cfg

# build
make