---
title: 学者网支付服务设计
date: 2022-8-10 01:59:43
description: 学者网
categories: 
 - 项目
---


# SCHOLAT端
mysql order : id token status qrcodeUrl price date (id, token)
<!-- more -->
produceOrder.html

orderFin.html

getOrderAck.html

# GO端


post /produceQRCodeUrl

get /getOrderStatus (qrcodeURL)

post /wxCallback


确认状态：1.回调 2.轮询 3.todoqueue

如何保持todoQueue存活并工作？

todoQueue: []OrderID, mu.lock,  check()

# 客户端

for /getOrderStatus

query 

jsPage : checkbox : 季度30 半年60 一年120
         button : 确认() -> ajax produceOrder.html -> SUCCESS -> showQRCODEPAGE(qrcodeurl) -> while notClose getStatus setTimeout -> SUCCESS -> CLOSE

JAVA: 

1. produceOrder.html 

Order POST /produceOrder
获取并返回QRCODEURL


2. getOrderACK.html
return ack
/req id token ack
/res id token ack 

GO: 

待支付订单队列
待应答订单队列

POST /produceQRCodeUrl
调用wxSDK(ORDER)
返回QRCODEURL

GET /getOrderStatus qrCodeURL=&clientCallCount= 

POST /wxCallback
writeData()
go orderFin()
return status.OK
重点是保证支付成功的消息能通知主站。
先发送完成通知，再放进todo队列

func orderFin() {
    post orderFin.html

}