---
title: 简历
date: 2022-02-02 20:45:43
categories: 
 - 学习
---

## 教育背景

## 技能
*** tcp/udp ip http(s) websocket 进程线程 内存管理 
*** golang goroutine channel gc gmp slice defer mutex 
** 分布式 缓存 rpc 
* git linux 设计模式


1. 熟悉 golang:chan gmp csp gc sync mutex 
2. 熟悉 tcp/ip http(s) websocket 
3. 熟悉 os 进程线程 内存管理 io 
4. 了解 mysql 锁 事务 日志 隔离
5. 了解 redis 持久化 底层 
6. 了解 rpc框架 分布式 缓存 负载均衡 消息队列 (grpc etcd nacos raft kafka rabbitmq )
7. 使用 git 工作流 linux 基础命令 docker 部署

了解Kafka消息中间件，了解ES查询引擎
了解分布式存储系统原理优先：例如Quorum、CAP、2PC、Raft等。



## 项目/经历

开源之夏是由中科院软件研究所“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进优秀开源软件社区的蓬勃发展，培养和发掘更多优秀的开发者。

活动联合国内外各大开源社区，针对重要开源软件的开发与维护提供项目任务，并面向全球高校学生开放报名。

1. Nacos DNS服务插件   中科院软件研究所 “开源之夏” Nacos社区 2022.06~2022.10
以前：简单代理转换的向DNS请求域名下发服务的ip地址和端口， 现在：动态 DNS 服务支持权重路由策略，用以实现中间层负载均衡，灵活路由策略，流量控制及 DNS 解析服务。 

作为一个Nacos插件， 基于CoreDNS进行二次开发的DNS服务器， 
组件(帮助Nacos服务注册中心下发服务DNS域名)
nacos-coredns (grpc)  
项目描述：提供了一个基于CoreDNS的DNS-F客户端，可以将Nacos上注册的服务导出为DNS域名，基于DNS的服务发现 并为服务发现提供DNS解析服务。 本DNS-F客户端是应用程序进程旁边的一个专用代理进程（side car），可以将服务名作为DNS域名查询请求转发到本客户端，提供服务发现的功能。
dns服务发现sidecar 
是一个专门为Nacos上注册的服务下发DNS域名的DNS服务器， 

负责内容：
- 以 Coredns 为基础实现了一个 轻量 灵活 的DNS服务器， 为客户端提供实现DNS 解析，转发服务  并设置转发规则以解析公网域名。
- 升级通信方式：插件原来只实现了 HTTP短链接的方式 来访问Nacos服务端，升级为gRPC长连接的方式，并使用Protobuf协议对数据传输序列化。
- 数据缓存更新：
- 实现负载均衡：根据服务集群中各实例权重不同，设计了根据权重轮询的负载均衡算法，转发 。权重路由策略，用以实现中间层负载均衡，灵活路由策略，流量控制及 DNS 解析服务。 
- 在Nacos官方文档中贡献了本Nacos CoreDNS插件的设计文档和使用文档，丰富了Nacos的生态融合。 https://nacos.io/zh-cn/docs/v2/ecology/use-nacos-with-coredns.html
<!-- - 升级版本： 将插件原来支持的CoreDNS v1.6.7, Nacos V 1.x 升级到 , 在插件编译中添加 go mod 使编译更吊 -->

https://github.com/nacos-group/nacos-coredns-plugin

https://nacos.io/zh-cn/docs/v2/ecology/use-nacos-with-coredns.html

https://www.cnblogs.com/kirito-c/p/12076274.html

帮助nacos中心服务端 下发服务的dns域名 

Nacos 融合CoreDNS 下发DNS域名

负责：基于 coredns 开发的 dns 服务器， 帮助 负载均衡 服务发现 二次开发  
亮点：1. http短连接grpc 2. 负载均衡算法 3. 效率提升30

原来支持http访问api, sdk建立rpc连接

该插件作为一个 dns服务器 支持 dns请求的方式，根据服务名解析得到该服务的ip地址和端口

grpc http/2 心跳机制 protobuf 

动态 DNS 服务支持权重路由策略，用以实现中间层负载均衡，灵活路由策略，流量控制及 DNS 解析服务。 

Nacos 支持基于DNS方式及RPC方式的服务发现。服务提供者可以通过本地SDK、API方式或者特定的客户端来通过Nacos完成服务发现。消费者可以通过DNS方式或者HTTP方式发现服务进行调用。

2. Scholat-Gopay 广州琶洲实验室 “学者知识图谱与协同智能应用”团队实习生  2022.09~2023.02

项目描述：一个轻量级、高性能、安全可靠的中间代理服务器，提供支付服务、订单管理、后台监控等功能。

这是一个使用Go语言开发的Web服务器项目，它提供支付服务功能。这种项目利用了Go语言的高效性能和丰富的Web开发库，可以为用户提供快速、安全和可靠的支付服务。通过使用Go语言，开发人员可以构建出高性能、高可用性和可扩展性的Web服务，以满足不断增长的支付需求。

这是一个用Go语言编写的Web服务器，它具有强大的功能，包括支付代理、流量监控和JWT认证。支付代理功能可以帮助用户安全地进行在线支付，流量监控功能可以帮助用户了解网站的流量情况，JWT认证功能可以帮助用户确保他们的数据安全，并确保仅被授权的用户访问这些数据。使用这个Web服务器，用户可以轻松地实现安全，高效的Web应用程序。


负责：
1. 基于 Gin 进行模块化设计的 API 框架，封装了常用的功能，使用简单，致力于进行快速的业务研发
2. gorm mysql orm 框架 对象映射  
3. redis 淘汰超时未支付订单
4. validate鉴权 auth  jwt  
3. 后台监控 流量 性能 健康  
5. websocket 与 客户端实时通讯， 
2. 消息队列  kafka
4. ack支付数据一致性 
5. jerkins docker ci/cd
 
gogin restful api

#### nacos coredns grpc

作为客户端的sidecar，根据服务节点的权重，实现中间层负载均衡，流量控制

技术栈：coredns + nacos + grpc + protobuf + bigcahce + zaplogger
负责工作：
1. 使用CoreDNS实现自定义域名解析，完成基于DNS的服务发现  
2. 根据Protobuf协议序列化通信数据，与Nacos建立gRPC长连接 
3. 使用 Bigcahce 作为本地缓存，实现服务数据高性能并发读写，淘汰过期数据
4. 使用 Zap 作为日志组件，实现冷启动时缓存预热，防止雪崩
5. 在Nacos官方文档中贡献了本Nacos CoreDNS插件的设计文档和使用文档，丰富了Nacos的生态融合。

根据服务集群中各实例权重不同，设计了根据权重轮询的负载均衡算法，转发 。权重路由策略，用以实现中间层负载均衡，灵活路由策略，流量控制及 DNS 解析服务。

5. nacos官方文档 

STAR法则（Situation Task Action Result）
Situation： 事情是在什么情况下发生； http短连接, 频繁创建销毁，没有复用
Task:： 你是如何明确你的任务的；     替换成grpc长连接 以rpc调用的方式，与nacos服务端建立通信，
Action： 针对这样的情况分析，你采用了什么行动方式；
Result： 结果怎样，在这样的情况下你学习到了什么。
简而言之，STAR法则，就是一种讲述自己故事的方式，或者说，是一个清晰、条理的作文模板。不管是什么，合理熟练运用此法则，可以轻松的对面试官描述事物的逻辑方式，表现出自己分析阐述问题的清晰性、条理性和逻辑性。


FAB 法则（Feature Advantage Benefit）
Feature： 是什么；
Advantage： 比别人好在哪些地方；
Benefit： 如果雇佣你，招聘方会得到什么好处。
简单来说，这个法则主要是让你的面试官知道你的优势、招了你之后对公司有什么帮助。

#### scholat gopay

技术栈： gin + gorm + redis + jwt + websocket + prometheus

1. gin api框架 gorm orm框架
2. redis 缓存订单数据，超时订单淘汰
3. jwt 鉴权 validate
4. 支付结果实时通知，websocket 客户端通信
5. 消息队列，数据一致性
6. ppof prometheus 监控系统性能、接口流量


bigcache 
https://juejin.cn/post/7107635176263385118
https://www.jianshu.com/p/0ff2e8c61c9c
https://zhuanlan.zhihu.com/p/487455942
