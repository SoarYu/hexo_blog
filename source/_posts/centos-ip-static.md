---
title: Centos配置静态ip地址
date: 2023-04-08 11:21:43
description: 配置vmware的虚拟机的ip地址时，选用Bridge的模式，固定虚拟机的内部ip地址：192.168.66.x
categories: 
 - linux
---

## 1. ifconfig 查看虚拟机使用的网卡名：ens33

![image.png](http://rsl7gbuh3.hn-bkt.clouddn.com/1680923681135-417c1612-8e9e-436f-9abf-606347f3bb1e.png?e=1680928263&token=LOcsKUhV-GV_9fmt0orTK4lCMWLvfAU9LTJAUuJ4:5rHhlxreouvNZ9seAcDTHIs_8Lk=)

## 2. 编辑ens33对应的配置文件
```bash
vim /etc/sysconfig/network-scripts/ifcfg-ens33
```
![image.png](http://rsl7gbuh3.hn-bkt.clouddn.com/1680923712641-b42f7dc0-9757-4a4b-afea-39c4b0fcaa9f.png?e=1680928263&token=LOcsKUhV-GV_9fmt0orTK4lCMWLvfAU9LTJAUuJ4:1rzVAD_4SH-KScTsfuMpP0C99_I=)

## 3. 重启网络服务
```bash
service network restart
```
