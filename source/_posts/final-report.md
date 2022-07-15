---
title: 期末汇报
date: 2022-07-11 21:17:00
categories: 
 - nacos
---

0712进展更新

已按照计划，通过docker部署了nacos2.1.0服务端。然后使用Nacos-Sdk-Go搭建了nacos的go客户端，并实现了go客户端与Nacos服务器的gRPC通信和资源获取。

目前已根据实践改进了nacos-coredns插件的设计文档，下一步尝试在Nacos-CoreDNS-plugin中添加 grpc 客户端模块，实现从 Nacos 服务端的资源获取。

疑问：现在nacos的go-sdk查询nacos服务端里的所有服务时需要输入分组名(groupName)，如果不指定分组则查询的是默认分组里的所有服务。请问有没有方法或api可以获取nacos服务器里的所有分组？
或者查询所有服务列表时，可以获取所有分组里的所有服务？
目前请求服务实例的参数需要输入服务名和服务所在分组(groupName)，有没有request仅需要输入服务名就能查询包含该服务的分组


nacos里注册的服务通过分组(groupName)来隔离的，我使用nacos的go-sdk查询nacos服务端里的所有服务时需要输入分组名(groupName), 如果不指定分组的话，则查询到的是默认分组里的所有服务。如果客户端不知道nacos服务的分组名的话，怎么获取所有分组的服务列表？