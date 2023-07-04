---
title: Docker 创建、测试和部署容器化 Go 应用程序
date: 2023-06-25 20:32:43
description: 本文将向你展示：Dockerfile编写，如何构建一个 Go 程序的容器镜像。使用多阶段构建来高效构建小镜像，同时保持 Dockerfile 易于阅读和维护。 使用 Docker Compose 在开发环境中协调多个相关容器的运行。 使用 GitHub Actions 为您的应用程序配置 CI/CD 工作流。将容器化 Go 应用程序部署到 Google Cloud、AWS等云服务器平台。
categories: 
 - Docker
---

<a name="D9h5a"></a>
## 1. Dockerfile
<a name="Fperl"></a>
### 1.1 Git clone a application
```bash
git clone https://github.com/olliefr/docker-gs-ping.git
```
<a name="CBOE0"></a>
### 1.2 Create a Dockerfile
```dockerfile
# import golang base image
FROM golang:1.19

# 设置工作目录,使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），
# 以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会帮你建立目录。
WORKDIR /app

# 将项目 modules files 复制进image中 /app/go.mod /app/go.sum
COPY go.mod go.sum ./

# 引入程序源码
COPY *.go ./

# RUN 执行命令，下载项目引用的依赖
RUN go mod download

# 上一步完成了工具链：编译、链接...，开始编译构建程序的二进制可执行文件
RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

# CMD tell Docker what command to execute when our image is used to start a container.
# images 加载进 container 时需要执行的操作
CMD ["/docker-ps-ping"]


```
<a name="ynkni"></a>
### 1.3 Create a Dockerfile.multistage
```dockerfile
# import golang base image
FROM golang:1.19 AS build-stage

# 设置工作目录,使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），
# 以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会帮你建立目录。
WORKDIR /app

# 将项目 modules files 复制进image中 /app/go.mod /app/go.sum
COPY go.mod go.sum ./

# 引入程序源码
COPY *.go ./

# RUN 执行命令，下载项目引用的依赖
RUN go mod download

# 上一步完成了工具链：编译、链接...，开始编译构建程序的二进制可执行文件
RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

# CMD tell Docker what command to execute when our image is used to start a container.
# images 加载进 container 时需要执行的操作
CMD ["/docker-ps-ping"]


# 在容器中运行测试用例，Run the tests in the container
FROM build-stage AS run-test-stage
RUN go test -v ./...

# 创建一个新镜像，只执行二进制程序，，Deploy the application binary into a lean image
FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /docker-gs-ping /docker-gs-ping

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/docker-gs-ping"]
```
从根本上说, ENTRYPOINT和CMD都是让用户指定一个可执行程序, 这个可执行程序在container启动后自动启动. 实际上, 如果你想让自己制作的镜像自动运行程序(不需要在docker run后面添加命令行指定运行的命令), 你必须在Dockerfile里面, 使用ENTRYPOINT或者CMD命令

在写Dockerfile时, ENTRYPOINT或者CMD命令会自动覆盖之前的ENTRYPOINT或者CMD命令.<br />在docker镜像运行时, 用户也可以在命令指定具体命令, 覆盖在Dockerfile里的命令.

比如, 我们写了一个这样的Dockerfile:
```dockerfile
FROM ubuntu:trusty
CMD ping localhost
```

可以看出**ping**命令在docker启动后自己执行, 但是我们可以在命令行启动docker镜像时, 执行其他命令行参数, 覆盖默认的CMD
```bash
$ docker run demo hostname
6c1573c0d4c0
```

docker启动后, 并没有执行**ping**命令, 而是运行了**hostname**命令<br />和CMD类似, 默认的ENTRYPOINT也在docker run时, 也可以被覆盖. 在运行时, 用--entrypoint覆盖默认的ENTRYPOINT
```
$ docker run --entrypoint hostname demo
075a2fa95ab7
```

因为CMD命令很容易被docker run命令的方式覆盖, 所以, 如果你希望你的docker镜像的功能足够灵活, 建议在Dockerfile里调用CMD命令. 比如, 你可能有一个通用的Ruby镜像, 这个镜像启动时默认执行irb (_CMD irb_).<br />相反, ENTRYPOINT的作用不同, 如果你希望你的docker镜像只执行一个具体程序, 不希望用户在执行docker run的时候随意覆盖默认程序. 建议用ENTRYPOINT.

Docker在很多情况下被用来打包一个程序. 想象你有一个用python脚本实现的程序, 你需要发布这个python程序. 如果用docker打包了这个python程序, 你的最终用户就不需要安装python解释器和python的库依赖. 你可以把所有依赖工具打包进docker镜像里, 然后用ENTRYPOINT指向你的Python脚本本身. 当然你也可以用CMD命令指向Python脚本. 但是通常用ENTRYPOINT可以表明你的docker镜像只是用来执行这个python脚本,也不希望最终用户用这个docker镜像做其他操作.
<a name="tqJ1e"></a>
## 2. Docker build & tag
<a name="PZTIJ"></a>
### 2.1 docker build Dockerfile(Default)
保留中间images layer，含有大量的无效内容，占用空间
```bash
docker build -t docker-gs-ping .
```
```
[+] Building 18.3s (11/11) FINISHED                                                                                                                                                           
=> [internal] load build definition from Dockerfile                                                                                                                                     0.1s
=> => transferring dockerfile: 845B                                                                                                                                                     0.0s
=> [internal] load .dockerignore                                                                                                                                                        0.1s
=> => transferring context: 2B                                                                                                                                                          0.0s
=> [internal] load metadata for docker.io/library/golang:1.19                                                                                                                           0.9s
=> [internal] load build context                                                                                                                                                        0.1s
=> => transferring context: 113B                                                                                                                                                        0.0s
=> [1/6] FROM docker.io/library/golang:1.19@sha256:6fb612aac0ae076bd4f6a76e48c4c8e59a4bae89dc5201252ec2b4eb8a2ae2a0                                                                     0.0s
=> CACHED [2/6] WORKDIR /app                                                                                                                                                            0.0s
=> CACHED [3/6] COPY go.mod go.sum ./                                                                                                                                                   0.0s
=> CACHED [4/6] COPY *.go ./                                                                                                                                                            0.0s
=> CACHED [5/6] RUN go mod download                                                                                                                                                     0.0s
=> [6/6] RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping                                                                                                                      11.4s
=> exporting to image                                                                                                                                                                   5.7s
=> => exporting layers                                                                                                                                                                  5.6s
=> => writing image sha256:b7fc8bf6f2a3c2bea6ad5e7c5d6e5009e4af081fba9b349fb28c0b513fff7f3b                                                                                             0.0s
=> => naming to docker.io/library/docker-gs-ping         
```
<a name="zpGDE"></a>
### 2.2 docker build Dockerfile.multistage
通过编写Dockerfile，只保留最终执行二进制程序的镜像层layer，为镜像瘦身
```shell
$ docker build -t docker-gs-ping:multistage -f Dockerfile.multistage .
[+] Building 3.6s (15/15) FINISHED                                                                                                                                                            
 => [internal] load build definition from Dockerfile.multistage                                                                                                                          0.1s
 => => transferring dockerfile: 1.29kB                                                                                                                                                   0.0s
 => [internal] load .dockerignore                                                                                                                                                        0.2s
 => => transferring context: 2B                                                                                                                                                          0.0s
 => [internal] load metadata for gcr.io/distroless/base-debian11:latest                                                                                                                  0.9s
 => [internal] load metadata for docker.io/library/golang:1.19                                                                                                                           1.9s
 => [auth] library/golang:pull token for registry-1.docker.io                                                                                                                            0.0s
 => [build-stage 1/6] FROM docker.io/library/golang:1.19@sha256:6fb612aac0ae076bd4f6a76e48c4c8e59a4bae89dc5201252ec2b4eb8a2ae2a0                                                         0.0s
 => [internal] load build context                                                                                                                                                        0.1s
 => => transferring context: 113B                                                                                                                                                        0.0s
 => [build-release-stage 1/3] FROM gcr.io/distroless/base-debian11@sha256:73deaaf6a207c1a33850257ba74e0f196bc418636cada9943a03d7abea980d6d                                               0.0s
 => CACHED [build-stage 2/6] WORKDIR /app                                                                                                                                                0.0s
 => CACHED [build-stage 3/6] COPY go.mod go.sum ./                                                                                                                                       0.0s
 => CACHED [build-stage 4/6] COPY *.go ./                                                                                                                                                0.0s
 => CACHED [build-stage 5/6] RUN go mod download                                                                                                                                         0.0s
 => CACHED [build-stage 6/6] RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping                                                                                                    0.0s
 => CACHED [build-release-stage 2/3] COPY --from=build-stage /docker-gs-ping /docker-gs-ping                                                                                             0.0s
 => exporting to image                                                                                                                                                                   0.2s
 => => exporting layers                                                                                                                                                                  0.0s
 => => writing image sha256:a25a652c98be74a5b713ca9db33c71387488cb7e02086044ccd75f580d808ee0                                                                                             0.0s
 => => naming to docker.io/library/docker-gs-ping:multistage                                                                                                                             0.0s
```
<a name="KJPR4"></a>
### 2.3 docker tag 
删除 docker-gs-ping:v1.0 只会删除标签，不会删除原镜像
```bash
docker tag docker-gs-ping:latest docker-gs-ping:v1.0

docker images rm docker-gs-ping:v1.0
```

<a name="z8ygv"></a>
##  3. Docker run
In the previous module we created a Dockerfile for our example application and then we created our Docker image using the command docker build. Now that we have the image, we can run that image and see if our application is running correctly.

- --rm：退出容器时销毁 
- --publish -p：指定端口映射
- -it：**-i:** 以交互模式运行容器，通常与 -t 同时使用；
- --detach -d：后台运行，不进入容器
- --name：为容器命名
- -e username="ritchie": 设置环境变量；
- --expose=[]: 开放一个端口或一组端口；
- --volume , -v: 绑定一个卷

-i,  当前宿主机终端变为容器里的终端<br />即使未连接STDIN（标准输入）也保持打开状态，分配一个交互终端，<br />-t, 表示容器启动后会进入其命令行，与it一起使用。<br />分配一个伪tty设备,可以支持终端登录<br />PS：针对纯操作系统镜像（没有守护进程的）在docker run的时候需要加-it参数，否则启动后会自动退出
```bash
docker run -d -p 8080:8080 docker-gs-ping
d75e61fcad1e0c0eca69a3f767be6ba28a66625ce4dc42201a8a323e8313c14e
```

<a name="KJCsU"></a>
## 4. Docker volume & network
docker 基础设施(存储、计算、运输)
```bash
docker volume create roach

docker volume list

docker network create mynet

docker network list

docker run -d \
	--name roach \
  --hostname db \
  --network mynet \
  -p 26257:26257 \
  -p 8080:8080 \
  -v roach:/cockroach/cockroach-data \
  cockroachdb/cockroach:latest-v20.1 start-single-node \
  --insecure
```

<a name="vTtSp"></a>
### 4.1 Storage & Network
数据库的要点是拥有持久的数据存储。volume卷 是持久化 Docker 容器生成和使用的数据的首选机制。因此，在我们启动 CockroachDB 之前，让我们为它创建卷。
```bash
docker volume create roach
docker volume list
```
app 和 数据库引擎 将通过 网络 相互通信。有多种可能的网络配置，我们将使用所谓的用户定义的`bridge`桥接网络。它将为我们提供 DNS 查找服务，以便我们可以通过其主机名引用我们的数据库引擎容器。
```bash
docker network create mynet
docker network list
```
<a name="IiDJa"></a>
### 4.2 Container of Database Engine
<a name="D1BSA"></a>
### i. Start the database engine container
在容器中运行 CockroachDB 并将其附加到我们刚刚创建的卷和网络。当您运行以下命令时，Docker 将从 Docker Hub 中拉取镜像并在本地为您运行：
```bash
docker pull cockroachdb/cockroach:latest-v20.1

docker run -d \
  --name roach \
  --hostname db \
  --network mynet \
  -p 26257:26257 \
  -p 8080:8080 \
  -v myroach:/cockroach/cockroach-data \
  cockroachdb/cockroach:latest-v20.1 start-single-node \
  --insecure

173300cfbaef787fab4fbb03b3025e070397508729b9ec9b3e1d80aeda5abe9b
```
<a name="Yos2y"></a>
### ii. Config the datebase engine container
现在数据库引擎容器已经运行，在我们的app上可以开始使用它之前需要做一些配置。我们必须： 

- 创建一个空白数据库。 
- 向数据库引擎注册一个新的用户帐户。 
- 授予新用户对数据库的访问权限。 

我们可以借助 CockroachDB 内置的 SQL shell 来做到这一点。要在运行数据库引擎的容器内执行 SQL shell.
```bash
# 进入容器
docker exec -it roach /bin/bash

# 查看目录下文件
root@db:/cockroach ls

cockroach  cockroach-data  cockroach.sh

# 与数据库交互 SQL shell 
root@db:/cockroach ./cockroach sql --insecure

# 或者直接运行容器的SQL shell
docker exec -it roach ./cockroach sql --insecure

# create db
root@:26257/defaultdb> CREATE DATABASE mydb;

CREATE DATABASE
Time: 68.3925ms

# create user
root@:26257/defaultdb> CREATE USER soar;

CREATE ROLE
Time: 41.2268ms

# grant all
root@:26257/defaultdb> GRANT ALL ON DATABASE mydb TO soar;

GRANT
Time: 34.8493ms

# quit
root@:26257/defaultdb> quit
```
<a name="hnn5e"></a>
## 5. Extend app using database engine
<a name="bynBq"></a>
### 5.1 Update main.go
现在我们已经启动并配置了数据库引擎，我们可以将注意力转移到应用程序上了。 此模块的示例应用程序是我们在之前的模块中使用的 docker-gs-ping 应用程序的扩展版本。你有两个选择：

- 更新本地的 docker-gs-ping 副本以匹配本章中介绍的新扩展版本；
- 克隆 olliefr/docker-gs-ping-roach 存储库。

main.go 现在包括数据库初始化代码，以及实现新业务需求的代码： 

- 对包含 { "value" : string } JSON 的 /send 的 HTTP POST 请求必须将值保存到数据库中。 
- 服务使用消息计数的字符串进行响应，该字符串括在括号中。 

示例输出：你好，Docker！(7)

<a name="xTY11"></a>
### 5.2 Update Dockerfile & Build app image
```dockerfile
# import golang base image
FROM golang:1.16-buster AS build

# 设置工作目录,使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），
# 以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会帮你建立目录。
WORKDIR /app

# 将项目 modules files 复制进image中 /app/go.mod /app/go.sum
COPY go.mod go.sum ./

# 引入程序源码
COPY *.go ./

# RUN 执行命令，下载项目引用的依赖
RUN go mod download

# 上一步完成了工具链：编译、链接...，开始编译构建程序的二进制可执行文件
RUN go build -o /docker-gs-ping-roach


##
## Deploy
##
FROM gcr.io/distroless/base-debian10

WORKDIR /

# 将编译后的二进制文件放入更精简的“distroless”镜像中来构建最终镜像
COPY --from=build /docker-gs-ping-roach /docker-gs-ping-roach

EXPOSE 8080

USER nonroot:nonroot

# CMD and ENTRYPOINT tell Docker what command to execute when our image is used to start a container.
# images 加载进 container 时需要执行的操作
# CMD ["/docker-ps-ping"]
ENTRYPOINT ["/docker-gs-ping-roach"]
```
<a name="PSAnV"></a>
### 5.3 Build & Run app image
构建并运行我们的镜像。这次我们需要设置一些环境变量，以便我们的应用程序知道如何访问数据库。<br />现在，我们将在 docker run 命令中直接执行此操作。稍后我们将看到使用 Docker Compose 的更方便的方法。
```bash
docker build --tag docker-gs-ping-roach .

docker run -it --rm -d \
  --network mynet \
  --name rest-server \
  -p 80:8080 \
  -e PGUSER=soar \
  -e PGPASSWORD=myfriend \
  -e PGHOST=db \
  -e PGPORT=26257 \
  -e PGDATABASE=mydb \
  docker-gs-ping-roach

docker run --rm \
  --network mynet \
  --name rest-server \
  -p 80:8080 \
  -e PGUSER=soar \
  -e PGPASSWORD=myfriend \
  -e PGHOST=db \
  -e PGPORT=26257 \
  -e PGDATABASE=mydb \
  docker-gs-ping-roach

```

该命令有几点需要注意。 我们这次将容器的8080端口映射到宿主机的80端口。因此，对于 GET 请求，我们可以直接使用 curl localhost：
```
@SoarYu ➜ /workspaces/docker-best-practices/go (main) $ curl localhost

Hello, Docker! (0)

@SoarYu ➜ /workspaces/docker-best-practices/go (main) $ curl --request POST \
   --url http://localhost/send \
   --header 'content-type: application/json' \
   --data '{"value": "Hello, Docker!"}'

{"value":"Hello, Docker!"}
```
数据库中的记录数是正确的，因为容器重复使用了 CockroachDB 的卷，尽管我们不仅停止了容器，而且在启动新实例之前删除了它们。

清除镜像与缓存<br />Now that you know the container IDs, you can use docker container stop and docker container rm, as demonstrated in the previous modules.<br />Please make sure that you stop the CockroachDB and docker-gs-ping-roach containers before moving on.
<a name="mvNxG"></a>
## 6. Docker compose
<a name="wKzMu"></a>
### 6.1 docker-compose.yml
```yaml
version: '3.8'

# 要启动的容器
services:
  docker-gs-ping-roach:
    depends_on: #依赖
      - roach
    build:
      context: .
    container_name: rest-server
    hostname: rest-server
    networks:
      - mynet
    ports:
      - 80:8080
    environment:
      - PGUSER=${PGUSER:-soar}
      - PGPASSWORD=${PGPASSWORD:?database password not set}
      - PGHOST=${PGHOST:-db}
      - PGPORT=${PGPORT:-26257}
      - PGDATABASE=${PGDATABASE:-mydb}
    deploy:
      restart_policy:
        condition: on-failure
  roach:
    image: cockroachdb/cockroach:latest-v20.1
    container_name: roach
    hostname: db
    networks:
      - mynet
    ports:
      - 26257:26257
      - 8080:8080
    volumes:
      - roach:/cockroach/cockroach-data
    command: start-single-node --insecure

# import volume
volumes:
  roach:

# import network
networks:
  mynet:
    driver: bridge
```
这个 Docker Compose 配置非常方便，因为我们不必键入所有参数来传递给 docker run 命令。我们可以在 Docker Compose 文件中以声明方式执行此操作。

<a name="O6xIK"></a>
### 6.2 .env 文件 
Docker Compose 将自动从 .env 文件中读取环境变量（如果可用）。由于我们的 Compose 文件需要设置 PGPASSWORD，因此我们将以下内容添加到 .env 文件中：
```yaml
PGPASSWORD=whatever
```
确切的值对于我们的示例并不重要，因为我们在不安全模式下运行 CockroachDB，但我们必须将变量设置为某个值以避免出现错误。

<a name="vgQPf"></a>
### 6.3 指定合并多个 Compose 文件 -f
如果没有提供 -f 标志，文件名 docker-compose.yml 是 docker-compose 命令识别的默认文件名。这意味着如果您的环境有这样的要求，您可以拥有多个 Docker Compose 文件。此外，Docker Compose 文件是……可组合的（双关语），因此可以在命令行上指定多个文件以将部分配置合并在一起。以下列表只是此类功能非常有用的场景的几个示例：

- 对本地开发的源代码使用绑定安装，但在运行 CI 测试时不使用； 
- 在为某些 API 应用程序的前端使用预构建图像与为源代码创建绑定挂载之间切换； 
- 添加用于集成测试的附加服务； 还有很多...

<a name="zON5I"></a>
### 6.4 Docker Compose 中的变量替换
Docker Compose 的一个非常酷的特性是变量替换。您可以在我们的 Compose 文件的环境部分中查看一些示例。通过一个例子：

- PGUSER=${PGUSER:-soar} 表示在容器内部，环境变量 PGUSER 应设置为与运行 Docker Compose 的主机上相同的值。如果宿主机上没有这个名字的环境变量，容器内的变量取默认值soar。
- PGPASSWORD=${PGPASSWORD:?database password not set} 表示如果主机上没有设置环境变量PGPASSWORD，Docker Compose会报错。这没关系，因为我们不想硬编码密码的默认值。我们在机器本地的 .env 文件中设置密码值。将 .env 添加到 .gitignore 总是一个好主意，以防止秘密被签入版本控制。

<a name="gCVXx"></a>
### 6.5 验证 Docker Compose 配置
在应用对 Compose 配置文件所做的更改之前，有机会使用以下命令验证配置文件的内容：
```yaml
docker-compose config
```
运行此命令时，Docker Compose 将读取文件 docker-compose.yml，将其解析为内存中的数据结构，在可能的情况下进行验证，并从其内部表示打印回该配置文件的重建。如果由于错误而无法做到这一点，它将打印一条错误消息。

<a name="xdVSb"></a>
### 6.6 使用 Docker Compose 构建并运行应用程序
:::info
Docker Compose 是一个有用的工具，但它有自己的怪癖。例如，如果不加上 --build，在更新源代码时就不会触发重建。编辑一个人的源代码是一个非常常见的陷阱，并且在运行 docker-compose up 时忘记使用 --build 标志。
:::
```yaml
docker-compose up . --buildud
```
我们传递了 --build 标志，这样 Docker 就会编译我们的镜像，然后启动它。<br />没有  --build  不会重新编译生成镜像

由于我们的设置现在由 Docker Compose 运行，它已为其分配了一个“项目名称”，因此我们创建 CockroachDB 实例时使用了一个新卷。这意味着我们的应用程序将无法连接到数据库，因为数据库不存在于这个新卷中。终端将显示数据库的身份验证错误：
```yaml
rest-server             | 2021/05/10 00:54:25 failed to initialise the store: pq: password authentication failed for user totoro
roach                   | *
roach                   | * INFO: Replication was disabled for this cluster.
roach                   | * When/if adding nodes in the future, update zone configurations to increase the replication factor.
roach                   | *
roach                   | CockroachDB node starting at 2021-05-10 00:54:26.398177 +0000 UTC (took 3.0s)
roach                   | build:               CCL v20.1.15 @ 2021/04/26 16:11:58 (go1.13.9)
roach                   | webui:               http://db:8080
roach                   | sql:                 postgresql://root@db:26257?sslmode=disable
roach                   | RPC client flags:    /cockroach/cockroach  --host=db:26257 --insecure
roach                   | logs:                /cockroach/cockroach-data/logs
roach                   | temp dir:            /cockroach/cockroach-data/cockroach-temp349434348
roach                   | external I/O path:   /cockroach/cockroach-data/extern
roach                   | store[0]:            path=/cockroach/cockroach-data
roach                   | storage engine:      rocksdb
roach                   | status:              initialized new cluster
roach                   | clusterID:           b7b1cb93-558f-4058-b77e-8a4ddb329a88
roach                   | nodeID:              1
rest-server exited with code 0
rest-server             | 2021/05/10 00:54:25 failed to initialise the store: pq: password authentication failed for user totoro
rest-server             | 2021/05/10 00:54:26 failed to initialise the store: pq: password authentication failed for user totoro
rest-server             | 2021/05/10 00:54:29 failed to initialise the store: pq: password authentication failed for user totoro
rest-server             | 2021/05/10 00:54:25 failed to initialise the store: pq: password authentication failed for user totoro
rest-server             | 2021/05/10 00:54:26 failed to initialise the store: pq: password authentication failed for user totoro
rest-server             | 2021/05/10 00:54:29 failed to initialise the store: pq: password authentication failed for user totoro
rest-server exited with code 1
```
Because of the way we set up our deployment using restart_policy, the failing container is being restarted every 20 seconds. So, in order to fix the problem, we need to log into the database engine and create the user, we’ve done it before in the []<br />This is not a big deal. All we have to do is to connect to CockroachDB instance and run the three SQL commands to create the database and the user, as described above in the Configure the database engine section above.<br />由于我们使用 `restart_policy` 设置部署的方式，失败的容器每 20 秒重新启动一次。所以，为了解决这个问题，我们需要登录数据库引擎并创建用户，如上文配置数据库引擎部分所述。
```yaml
docker exec -it roach ./cockroach sql --insecure

CREATE USER soar;
CREATE DATABASE mydb;
GRANT ALL ON DATABASE mydb TO soar;
```
And execute the same commands as before to create the database mydb, the user totoro, and to grant that user necessary permissions. Once we do that (and the example application container is automatically restarted), the rest-service stops failing and restarting and the console goes quiet.<br />It would have been possible to connect the volume that we had previously used, but for the purposes of our example it’s more trouble than it’s worth and it also provided an opportunity to show how to introduce resilience into our deployment via the restart_policy Compose file feature.<br />执行与之前相同的命令来创建数据库 mydb、用户 soar 并授予该用户必要的权限。一旦我们这样做了（并且示例应用程序容器自动重新启动），`rest-service` 停止失败并重新启动并且控制台变得安静。 
<a name="bVWQ3"></a>
### 6.7 Shutting down
要停止由 Docker Compose 启动的容器，请在我们运行 `docker-compose up` 的终端中按 `ctrl+c`。要在停止后删除这些容器，请运行 `docker-compose down`。
<a name="YK1D8"></a>
### 6.8 Detached mode
您可以使用 -d 标志在分离模式下运行由 docker-compose 命令启动的容器，就像使用 docker 命令一样。 要启动由后台模式下的 Compose ：
```
$ docker-compose up --build -d
```
然后，您可以使用 

- `docker-compose stop` 停止容器
- `docker-compose down` 删除它们。

<a name="qLdFM"></a>
### 6.9 Other
<a name="hvLeS"></a>
#### Further exploration
We would suggest running docker-compose to see what other commands are available.
<a name="GmGwJ"></a>
#### Wrap up
There are some tangential, yet interesting points that were purposefully not covered in this chapter. For the more adventurous reader, this section offers some pointers for further study.
<a name="BzVxe"></a>
#### Persistent storage
A managed volume isn’t the only way to provide your container with persistent storage. It is highly recommended to get acquainted with available storage options and their use cases, covered in the following part of Docker documentation: [Manage data in Docker](https://docs.docker.com/storage/).
<a name="OVYII"></a>
#### CockroachDB clusters
We run a single instance of CockroachDB, which was enough for our demonstration. But it is possible to run a CockroachDB cluster, which is made of multiple instances of CockroachDB, each instance running in its own container. Since CockroachDB engine is distributed by design, it would have taken us surprisingly little change to our procedure to run a cluster with multiple nodes.<br />Such distributed set-up offers interesting possibilities, such as applying Chaos Engineering techniques to simulate parts of the cluster failing and evaluating our application’s ability to cope with such failures.<br />If you are interested in experimenting with CockroachDB clusters, check out:<br />[Start a CockroachDB Cluster in Docker](https://www.cockroachlabs.com/docs/v20.2/start-a-local-cluster-in-docker-mac.html) article; and<br />Documentation for Docker Compose keywords [deploy](https://docs.docker.com/compose/compose-file/compose-file-v3/#deploy) and [replicas](https://docs.docker.com/compose/compose-file/compose-file-v3/#replicas).
<a name="Xich7"></a>
#### Other databases
Since we did not run a cluster of CockroachDB instances, you might be wondering whether we could have used a non-distributed database engine. The answer is ‘yes’, and if we were to pick a more traditional SQL database, such as [PostgreSQL](https://www.postgresql.org/), the process described in this chapter would have been very similar.
<a name="Pmssk"></a>
#### Next steps
In this module, we set up a containerised development environment with our application and the database engine running in different containers. We also wrote a Docker Compose file which links the two containers together and provides for easy starting up and tearing down of the development environment.<br />In the next module, we’ll take a look at one possible approach to running functional tests in Docker. See:<br />[Run your tests](https://docs.docker.com/language/golang/run-tests/)

<a name="dVEvj"></a>
## 7. Run your tests using Go test
测试是现代软件开发的重要组成部分。然而，测试对于不同的开发团队来说可能意味着很多事情。为简洁起见，我们将只看一下运行孤立的、高级的、功能测试。
<a name="wL0hP"></a>
### 测试用例 
每个测试都旨在验证我们的示例应用程序的单个业务需求。以下测试摘自我们示例应用程序中的 main_test.go 测试套件。
```go
func TestRespondsWithLove(t *testing.T) {

	pool, err := dockertest.NewPool("")
	require.NoError(t, err, "could not connect to Docker")

	resource, err := pool.Run("docker-gs-ping", "latest", []string{})
	require.NoError(t, err, "could not start container")

	t.Cleanup(func() {
		require.NoError(t, pool.Purge(resource), "failed to remove container")
	})

	var resp *http.Response

	err = pool.Retry(func() error {
		resp, err = http.Get(fmt.Sprint("http://localhost:", resource.GetPort("8080/tcp"), "/"))
		if err != nil {
			t.Log("container not ready, waiting...")
			return err
		}
		return nil
	})
	require.NoError(t, err, "HTTP error")
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode, "HTTP status code")

	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err, "failed to read HTTP body")

	// Finally, test the business requirement!
	require.Contains(t, string(body), "<3", "does not respond with love?")
}
```
如您所见，这是一个高级测试，与示例应用程序的实现细节无关。 测试使用的是 ory/dockertest Go 模块； 该测试假定 Docker 引擎实例在运行测试的同一台机器上运行。
<a name="GZ9Q7"></a>
### 本地测试

- 构造测试镜像
```go
docker build --tag docker-gs-ping .
```

- 运行测试
```go
go test ./...
```

<a name="uozHp"></a>
## 8. Configure CI/CD for your application
<a name="UKAG4"></a>
### Git Actions
本教程将引导您完成设置和使用 GitHub Actions 来构建 Docker 映像以及将映像推送到 Docker Hub 的过程。您将完成以下步骤： 

- 在 GitHub 上创建一个新的存储库。 
- 定义 GitHub Actions workflow工作流。 
- 运行workflow工作流。 

要学习本教程，您需要一个 Docker ID 和一个 GitHub 帐户。
<a name="xSTg6"></a>
### Config the github repository
创建 GitHub 仓库并配置 Docker Hub secrets 。 

- 使用此模板存储库创建一个 GitHub 存储库。 存储库包含一个简单的 Dockerfile，仅此而已。如果您愿意，可以随意使用另一个包含有效 Dockerfile 的存储库。 
- 打开存储库设置，然后转到 Secrets and variables > Actions。 
- 创建一个名为 DOCKERHUB_USERNAME 的 secrets 密钥 ，并将您的 `Docker ID` 作为密钥的value值。 
- 创建一个 [Personal Access Token (PAT)](https://docs.docker.com/docker-hub/access-tokens/#create-an-access-token)  的 Docker Hub 个人访问令牌 。您可以将此令牌命名为 clockboxci。 
- 在 GitHub settins 中添加这个 PAT 作为第二个秘密，名称为 `DOCKERHUB_TOKEN`。

创建存储库并配置机密后，您现在就可以开始行动了！
<a name="M3qwr"></a>
### Config the workflow
设置 GitHub Actions 工作流程以构建映像并将其推送到 Docker Hub。 

- 转到您在 GitHub 上的存储库，然后选择“操作”选项卡。 
- 选择自己设置工作流程。 这会将您带到一个页面，用于在存储库中创建新的 GitHub 操作工作流文件，默认情况下位于 .github/workflows/main.yml 下。 
```yaml
name: ci

on:
  push:
    branches:
      - "main"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    # 检查构建机器上的存储库。
      -
        name: Checkout
        uses: actions/checkout@v3
    # 通过Actions的配置登录 Docker Hub, 
      -
        name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
    # 使用 Docker Setup Buildx 操作创建 BuildKit builder instance实例。
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
    # 使用 Build and push Docker images, build 和 push 镜像到 Docker Hub 上
      -
        name: Build and push
        uses: docker/build-push-action@v4
        with:
          # the build context
          context: ./go/docker-gs-ping/.
          # filepath to the Dockerfile.
          file: ./go/docker-gs-ping/Dockerfile
          # tells the action to upload the image to a registry after building it.
          push: true 
          # tags that specify where to push the image.
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/clockbox:latest

```
<a name="U4LfK"></a>
### Run the workflow

1. 保存工作流文件并运行作业。 选择 **Commit changes...** 并将更改推送到 `main`分支。 

推送提交后，工作流自动启动。 

2. 转到“操作”选项卡。它显示工作流程。 选择工作流程会向您显示所有步骤的分解。 
3. 工作流完成后，转到 Docker Hub 上的存储库。 

如果您在该列表中看到新的存储库，则表示 GitHub Actions 已成功将映像推送到 Docker Hub！

<a name="d7KwD"></a>
## 9. Deploy your app
[https://docs.docker.com/language/golang/deploy/](https://docs.docker.com/language/golang/deploy/)


## 相关链接
[https://docs.docker.com/language/golang/build-images/](https://docs.docker.com/language/golang/build-images/)<br />[https://github.com/olliefr/docker-gs-ping](https://github.com/olliefr/docker-gs-ping)<br />[https://docs.github.com/zh/codespaces/developing-in-codespaces/using-github-codespaces-with-github-cli](https://docs.github.com/zh/codespaces/developing-in-codespaces/using-github-codespaces-with-github-cli)