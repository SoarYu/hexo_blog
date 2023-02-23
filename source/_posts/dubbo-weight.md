---
title: Dubbo-admin go重构任务：基于权重值的比例流量转发
date: 2023-02-21 20:00:00
categories: 
 - dubbo
---



[基于权重值的比例流量转发](http://static.dubbo.apache.org:8080/zh-cn/overview/tasks/traffic-management/weight/)

Dubbo 提供了基于权重的负载均衡算法，可以实现按比例的流量分布：权重高的提供者机器收到更多的请求流量，而权重低的机器收到相对更少的流量。
以基于权重的流量调度算法为基础，通过规则动态调整单个或一组机器的权重，可以在运行态改变请求流量的分布，实现动态的按比例的流量路由，这对于一些典型场景非常有用。
1. 当某一组机器负载过高，通过动态调低权重可有效减少新请求流入，改善整体成功率的同时给高负载机器提供喘息之机。
2. 刚刚发布的新版本服务，先通过赋予新版本低权重控制少量比例的流量进入，待验证运行稳定后恢复正常权重，并完全替换老版本。
3. 服务多区域部署或非对等部署时，通过高、低权重的设置，控制不同部署区域的流量比例。

明确dubbo会根据权重分配流量，任务是动态调整权重，达到负载均衡！

服务管理， 动态修改 服务 集群 实例 的权重

集群a  实例1 实例2 

集群b  实例1 实例2

集群a 集群b 接收流量 开始默认 5:5 -> 高并发 8:2

旧版本： Dubbo 服务的实例权重值是静态的，每个实例默认weight100
如果一个服务部署有两个实例：实例 A 权重值为 100，实例 B 权重值为 200，则 A 和 B 收到的流量分布为 1:2。

订单创建服务由 org.apache.dubbo.samples.OrderService 接口提供， dubbo中注册的服务实体为 OrderService

新版本：实现 通过动态规则调整权重， 调整不同服务实例的权重

功能颅内实现： 先配置 新版本实例权重25， 初始接收20%流量， 逐渐稳定，增加 新实例 权重直到接近100%流量接收。

服务请求是 向dubbo请求， 还是dubbo-admin请求？

- dubbo-admin 控制台可以 修改 dubbo 中服务的配置， 最终负载均衡还是dubbo根据权重来完成的。
- dubbo-admin 从 dubbo 获取服务请求记录，根据记录动态调整新版本服务实例权重。
 /dubbo-admin-server/flowMonitor/


仿照 java 版本 WeightController
post 输入 服务 以及 权重 。。。
接收 post 转换动态配置规则 

// Post 接收 服务 以及 相关权重输入
func createWeight(weightDTO) {
    // 接收 服务与权重输入 转换动态配置规则 
    overrideService.saveWeight(weightDTO)
}
// 完成具体转换, 写入真正dubbo组件的配置中心、注册中心
func saveWeight() {
    dubboConfig.writeWeight() // 基础已在重构的dubbo-go中写好
}

定义一个api接口，post请求接收前端输入的服务以及相关权重数据，将数据写入dubbo的服务注册中心、配置中心中


服务注册： provider 在 dubbo的服务中心（zookeeper/nacos/k8s）进行本服务的注册
服务发现： dubbo consumer 想要与 dubbo provider 进行rpc调用，需要在dubbo的服务中心中查询provider注册的地址


dubbo 是一个服务

https://www.cnblogs.com/cao-lei/p/15078706.html