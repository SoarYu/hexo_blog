---
title: ubuntu-protobuf 安装
date: 2022-07-03 17:08:43
description: ubuntu安装protobuf：proto文件生成特定语言代码
categories: 
 - Deploy相关
---

## ubuntu-go
bridge

apt-get update

apt-get install openssh_server

vim /etc/ssh/sshd_config

```
PermitRootLogin yes #允许root登录
PermitEmptyPasswords no #不允许空密码登录
PasswordAuthentication yes # 设置是否使用口令验证。

```

sudo passwd root

service ssh restart

wget https://golang.google.cn/dl/go1.16.4.linux-amd64.tar.gz

tar -zxvf go1.16.4.linux-amd64.tar.gz

mv go /usr/local

vim /etc/profile

```
export PATH=$PATH:/usr/local/go/bin
export GOROOT=/usr/local/go
export GOPATH=/home/go
```

source /etc/profile

开启Go的MODULE支持
export GO111MODULE=on

软件源替换
<!-- export GOPROXY=https://goproxy.cn,direct -->
go env -w GOPROXY=https://goproxy.cn

## protobuf
一直想要自己搞一套始终没时间，现在公司准备弄一个，但是时间太紧，一个人做整个后台，忙不过来。趁国庆时间多，摸索了一下，这里做个记录。

protobuf是什么，就在这里不用多说了，如该你看到这里，那说明其实你已经知道protobuf是干啥用的，啥语法格式的你都已经清楚。

环境：ubuntu

参考链接：

https://github.com/protocolbuffers/protobuf/blob/master/src/README.md

这个参考链接里面内容提炼一下，你就只需要完成以下几个命令操作即可。

1.由于protobuf是C++写的，需要以下这些安装包：autoconf , automake,  libtool,  curl,   make,   g++,  unzip
sudo apt-get install autoconf automake libtool curl make g++ unzip

2.安装源文件
git clone https://github.com/protocolbuffers/protobuf.git

3.cd 到protobuf目录
cd protobuf

4.clone子模块的依赖：
git submodule update --init --recursive

5.执行自动生成的shell脚本：
./autogen.sh

6.配置文件shell脚本
./configure

7.编译

make
8. 编译检查(个人觉得可有可无)
make check

9. 编译安装
sudo make install

10. 刷新
sudo ldconfig

11. 查看安装结果
protoc --version
 