---
title: linux部署nacos-coredns-plugin
date: 2022-06-21 19:53:43
categories: 
 - Deploy相关
---

## nacos-coredns-plugin部署 (golang<=1.14)

目前nacos-coredns-plugin的master分支使用的是 coredns v1.2.6 版本，里面的依赖由于时间太久没有更新，导入的时候会报错，所以需要切换到v1.6.7的分支。 coredns v1.6.7支持Go的modules模块功能，可以更好地管理项目依赖的导入。

### 1.切换v1.6.7分支
```shell
    cd $GOPATH/src/
    git clone https://github.com/nacos-group/nacos-coredns-plugin.git
    cd nacos-coredns-plugin
    git checkout -b v1.6.7 origin/v1.6.7
    vi bin/build.sh
```
### 2.将build.sh脚本修改为以下内容：
```shell
    #!/usr/bin/env bash
    # cd GOPATH
    cd $GOPATH/src/

    # remove codes
    rm -rf coredns
    rm -rf nacos-coredns-plugin

    # clone current codes
    git clone https://github.com/coredns/coredns.git
    git clone https://github.com/nacos-group/nacos-coredns-plugin.git

    # cd coredns directory
    cd $GOPATHgit /src/nacos-coredns-plugin
    git checkout -b v1.6.7 origin/v1.6.7
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
```

### 3.运行脚本编译nacos-coredns
```shell
    cp bin/build.sh ~/
    cd ~/
    sh build.sh
```

### 4.创建nacos-coredns配置文件
```shell
    cd $GOPATH/src/coredns
    mkdir conf
    vi conf/nacos-coredns.cfg
```
配置文件内容为：
```shell
. {
    log
    nacos {
        nacos_server 127.0.0.1
        nacos_server_port 8848
   }
   forward . /etc/resolv.conf
 }
```
* nacos_server: Nacos服务器的ip，如果有两个或多个Nacos服务器，用逗号分隔
* nacos_server_port: Nacos服务器端口
* forward: 未在 Nacos 中注册的域名将被转发到上游。

### 5.在coredns模块下运行nacos-coredns-plugin
```shell
    cd $GOPATH/src/coredns
    ./coredns -conf conf/nacos-coredns.cfg -dns.port 1053
```

### 6.测试dig $nacos_service_name @127.0.0.1 -p $dns_port
在终端中输入： 
```shell
    dig hello123 @127.0.0.1 -p 1053
```
![nacos-coredns-test](/img/nacos-coredns-plugin/nacos-coredns-test.png)