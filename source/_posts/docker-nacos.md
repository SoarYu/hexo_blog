---
title: nacos-docker部署
date: 2022-06-21 15:21:43
categories: 
 - nacos
---


## docker 安装
```
    apt install docker.io
```

## docker 官方拉取
```
    docker pull nacos/nacos-server:latest
```
### 创建本地的映射文件
```
    mkdir -p /root/nacos/logs
```

## 初始化 mysql 数据库 

从以下链接获取sql脚本：https://github.com/alibaba/nacos/blob/develop/distribution/conf/nacos-mysql.sql


## 单机模式中-e 添加的参数不同与集群模式，集群模式见文章结尾。

单机模式中/home/nacos/conf/application.properties 配置文件如下：
```
# spring
server.servlet.contextPath=${SERVER_SERVLET_CONTEXTPATH:/nacos}
server.contextPath=/nacos
server.port=${NACOS_SERVER_PORT:8848}
spring.datasource.platform=${SPRING_DATASOURCE_PLATFORM:""}
nacos.cmdb.dumpTaskInterval=3600
nacos.cmdb.eventTaskInterval=10
nacos.cmdb.labelTaskInterval=300
nacos.cmdb.loadDataAtStart=false
db.num=${MYSQL_DATABASE_NUM:1}
db.url.0=jdbc:mysql://${MYSQL_SERVICE_HOST}:${MYSQL_SERVICE_PORT:3306}/${MYSQL_SERVICE_DB_NAME}?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.url.1=jdbc:mysql://${MYSQL_SERVICE_HOST}:${MYSQL_SERVICE_PORT:3306}/${MYSQL_SERVICE_DB_NAME}?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=${MYSQL_SERVICE_USER}
db.password=${MYSQL_SERVICE_PASSWORD}
### The auth system to use, currently only 'nacos' is supported:
nacos.core.auth.system.type=${NACOS_AUTH_SYSTEM_TYPE:nacos}


### The token expiration in seconds:
nacos.core.auth.default.token.expire.seconds=${NACOS_AUTH_TOKEN_EXPIRE_SECONDS:18000}

### The default token:
nacos.core.auth.default.token.secret.key=${NACOS_AUTH_TOKEN:SecretKey012345678901234567890123456789012345678901234567890123456789}

### Turn on/off caching of auth information. By turning on this switch, the update of auth information would have a 15 seconds delay.
nacos.core.auth.caching.enabled=${NACOS_AUTH_CACHE_ENABLE:false}

server.tomcat.accesslog.enabled=${TOMCAT_ACCESSLOG_ENABLED:false}
server.tomcat.accesslog.pattern=%h %l %u %t "%r" %s %b %D
# default current work dir
server.tomcat.basedir=
## spring security config
### turn off security
nacos.security.ignore.urls=/,/error,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-fe/public/**,/v1/auth/**,/v1/console/health/**,/actuator/**,/v1/console/server/**
# metrics for elastic search
management.metrics.export.elastic.enabled=false
management.metrics.export.influx.enabled=false

nacos.naming.distro.taskDispatchThreadCount=10
nacos.naming.distro.taskDispatchPeriod=200
nacos.naming.distro.batchSyncKeyCount=1000
nacos.naming.distro.initDataRatio=0.9
nacos.naming.distro.syncRetryDelay=5000
nacos.naming.data.warmup=true
```

## 创建nacos容器(单例模式)

这里以单点的模式为例,Docker启动需要暴露8848 9848 9849三个端口
为什么要开放三个端口？
可以发现官方文档中有这么一段话：Nacos2.x版本相比1.X新增了gRPC的通信方式，因此需要增加2个端口。新增端口是在配置的主端口(server.port)基础上，进行一定偏移量自动生成。
```
    docker run -d -p 8848:8848 -p 9848:9848 -p 9849:9849 \
    -e MODE=standalone \
    -e PREFER_HOST_MODE=hostname \ 
    -e SPRING_DATASOURCE_PLATFORM=mysql \
    -e MYSQL_SERVICE_HOST=127.0.0.1 \
    -e MYSQL_SERVICE_PORT=3306 \
    -e MYSQL_SERVICE_DB_NAME=nacos_config \
    -e MYSQL_SERVICE_USER=root \
    -e MYSQL_SERVICE_PASSWORD=123456 \
    -e MYSQL_DATABASE_NUM=1 \
    -v /root/nacos/logs:/home/nacos/logs \
    --restart always --name nacos nacos/nacos-server:latest
```

```
docker run -d -p 8848:8848 -p 9848:9848 -p 9849:9849 -e MODE=standalone -e PREFER_HOST_MODE=hostname -e SPRING_DATASOURCE_PLATFORM=mysql -e MYSQL_SERVICE_HOST=192.168.66.146 -e MYSQL_SERVICE_PORT=3306 -e MYSQL_SERVICE_DB_NAME=nacos_config -e MYSQL_SERVICE_USER=root -e MYSQL_SERVICE_PASSWORD=123456 -e MYSQL_DATABASE_NUM=1 -v /root/nacos/logs:/home/nacos/logs --name nacos nacos/nacos-server:latest
```


## 启动容器
```
    docker start nacos
```
### 访问http://localhost:8848/nacos/ 账号默认nacos、密码默认nacos
新建txt配置文件
![hello nacos](/img/docker-nacos/hello_nacos.png)

```
Service registration服务注册示例

curl -X POST 'http://127.0.0.1:8848/nacos/v1/ns/instance?serviceName=nacos.naming.serviceName&ip=20.18.7.10&port=8080'
Service discovery服务发现示例

curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=nacos.naming.serviceName'
Publish config推送配置示例

curl -X POST "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test&content=helloWorld"
Get config获取配置示例

curl -X GET "http://127.0.0.1:8848/nacos/v1/cs/configs?dataId=nacos.cfg.dataId&group=test"
```

## 集群部署
```
docker run -d \
--network myNetwork --ip 172.18.0.4 --name nacos-server-18848 \
-e MODE=cluster \
-e SPRING_DATASOURCE_PLATFORM=mysql \
-e MYSQL_SERVICE_HOST=172.18.0.3 \
-e MYSQL_SERVICE_PORT=3306 \
-e MYSQL_SERVICE_USER=root \
-e MYSQL_SERVICE_PASSWORD=123456 \
-e MYSQL_SERVICE_DB_NAME=nacos_config \
-e NACOS_SERVER_PORT=8848 \
-e NACOS_SERVERS="172.18.0.4:8848 172.18.0.5:8848 172.18.0.6:8848" \
-e NACOS_SERVER_IP=172.18.0.4 \
-e JVM_XMS=256m -e JVM_XMX=512m  \
-v /usr/local/nacos/logs/nacos-server-18848:/home/nacos/logs \
-v /usr/local/nacos/conf:/home/nacos/conf \
-p 18848:8848 \
nacos/nacos-server
```