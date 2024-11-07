在 Dockerfile 中，RUN 和 CMD 是两个不同的指令，用于在构建和运行 Docker 容器时执行不同的任务。

1. RUN 指令
用途：用于在构建镜像时执行命令，并将命令的结果保存到新生成的镜像层中。
作用：常用于安装依赖、下载文件、设置环境等任务，所有这些操作会形成镜像的新层。
执行时间：RUN 在镜像构建阶段执行，仅在 docker build 过程中运行一次，之后生成的镜像中会保留运行的结果。
示例
dockerfile
复制代码
# 安装 Node.js
RUN apt-get update && apt-get install -y nodejs
在这个例子中，RUN 会更新系统包管理器，并安装 nodejs。此操作的结果会被保存到镜像的新层中，以便在构建完镜像后每次启动容器时都具有 nodejs。

2. CMD 指令
用途：用于在容器启动时定义默认执行的命令。如果用户没有在 docker run 中指定命令，Docker 就会执行 CMD 指令。
作用：通常用于指定容器的主应用程序或启动脚本，如启动一个服务或运行一个脚本。
执行时间：CMD 在容器启动时执行，而不是在构建镜像时执行。
示例
dockerfile
复制代码
CMD ["node", "app.js"]
在这个例子中，CMD 指定了容器启动时默认执行的命令，即运行 node app.js。如果用户运行 docker run <image>，则会自动执行 CMD 指定的命令。

区别总结
指令    | 用途               |	何时执行                           |	常见用途
RUN	    | 执行命令并创建新层  | 	构建镜像时执行 (docker build)	|   安装依赖、配置环境
CMD	    |指定容器启动时的默认命令	| 容器启动时执行 (docker run)	| 运行应用或启动服务

常见组合示例
在 Dockerfile 中，通常使用多个 RUN 指令来设置环境，最后一个 CMD 来指定容器启动时的默认命令。例如：

dockerfile
复制代码
# 安装依赖
RUN apt-get update && apt-get install -y python3
RUN pip install flask

# 复制应用文件
COPY . /app

# 指定启动命令
CMD ["python3", "/app/app.py"]
这个 Dockerfile 在构建时会安装 Python 和 Flask 依赖，然后将应用文件复制到 /app 目录，最后在容器启动时执行 python3 /app/app.py 来启动应用。