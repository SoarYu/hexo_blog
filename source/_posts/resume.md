---
title: 简历
date: 2022-02-02 20:45:43
categories: 
 - 学习
---

## 教育背景

## 技能
1. golang:chan gmp csp gc sync mutex 
2. tcp/ip http
3. mysql 锁 事务 日志 隔离 
4. rpc dns 缓存 分布式 负载均衡
5. os 进程线程 内存管理 io 
6. git 工作流 linux 基础命令
7. 设计模式 代码风格规范
8. 算法 数据结构 

## 项目/经历
1. nacos-coredns (grpc)
https://github.com/nacos-group/nacos-coredns-plugin

https://nacos.io/zh-cn/docs/v2/ecology/use-nacos-with-coredns.html

帮助nacos中心服务端 下发服务的dns域名 

Nacos 融合CoreDNS 下发DNS域名

负责：基于 coredns 开发的 dns 服务器， 帮助 负载均衡 服务发现 二次开发  
亮点：1. http短连接grpc 2. 负载均衡算法 3. 

原来支持http访问api, sdk建立rpc连接

该插件作为一个 dns服务器 支持 dns请求的方式，根据服务名解析得到该服务的ip地址和端口

grpc http/2 心跳机制 protobuf 

动态 DNS 服务支持权重路由策略，用以实现中间层负载均衡，灵活路由策略，流量控制及 DNS 解析服务。 

Nacos 支持基于DNS方式及RPC方式的服务发现。服务提供者可以通过本地SDK、API方式或者特定的客户端来向Nacos注册服务。消费者可以通过DNS方式或者HTTP方式发现服务进行调用。

2. scholat-pay (web)
负责：
亮点：1. 消息队列  2. web 监控 prome 3. validate鉴权 auth  4. ack支付数据一致性 5. jerkins docker ci/cd
 
3. gokv (dis-redis)


topk 字符串 