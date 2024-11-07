在 Shell 脚本中写 docker build 命令，可以通过定义一系列变量或直接执行命令来实现自动化 Docker 镜像的构建。以下是如何在 Shell 脚本中使用 docker build 命令的详细说明及示例。

基本的 docker build 命令
最基本的 docker build 命令结构如下：

```bash
docker build -t <image_name>:<tag> <path_to_dockerfile>
```
-t <image_name>:<tag>：为镜像指定名称和标签（tag），标签可以是 latest 或自定义的版本号。
<path_to_dockerfile>：指定 Dockerfile 的路径，通常是当前目录 (.)。

### 示例1：最简单的 docker build Shell 脚本
假设你的 Dockerfile 和代码文件都在当前目录，可以编写一个简单的 build.sh 脚本：

```bash
#!/bin/bash

# 为镜像指定名称和标签
IMAGE_NAME="myapp"
TAG="latest"

# 执行 docker build 命令
docker build -t $IMAGE_NAME:$TAG .

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image $IMAGE_NAME:$TAG built successfully."
else
  echo "Docker image build failed."
  exit 1
fi
```

### 示例2：带有动态参数的 docker build 脚本
如果你想让脚本更加灵活，可以通过传递参数或使用环境变量控制镜像名称、标签以及 Dockerfile 路径。

```bash
#!/bin/bash

# 检查是否传递了镜像名称和标签参数
IMAGE_NAME=${1:-"myapp"}  # 如果没有参数，则默认使用 "myapp"
TAG=${2:-"latest"}        # 如果没有第二个参数，则默认使用 "latest"
DOCKERFILE_PATH=${3:-"."} # 如果没有第三个参数，则默认使用当前目录

echo "Building Docker image $IMAGE_NAME:$TAG from $DOCKERFILE_PATH..."

# 执行 docker build
docker build -t $IMAGE_NAME:$TAG $DOCKERFILE_PATH

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image $IMAGE_NAME:$TAG built successfully."
else
  echo "Docker image build failed."
  exit 1
fi
```
使用方法：
你可以通过以下方式运行脚本并传递参数：

```bash
./build.sh myapp v1.0 /path/to/dockerfile
```
myapp 是镜像名称
v1.0 是镜像的标签
/path/to/dockerfile 是 Dockerfile 所在目录

### 示例3：支持构建参数的 docker build
如果你在 Dockerfile 中使用了 ARG 进行构建参数传递，可以在 docker build 命令中使用 --build-arg 参数。

假设 Dockerfile 中定义了一个构建参数 VERSION：

```Dockerfile

ARG VERSION
FROM node:${VERSION}
# 其他指令
```
你可以在 Shell 脚本中通过 --build-arg 传递这个参数：


```bash
#!/bin/bash

# 镜像名称、标签和构建参数
IMAGE_NAME="myapp"
TAG="latest"
VERSION="14"

# 传递构建参数
docker build --build-arg VERSION=$VERSION -t $IMAGE_NAME:$TAG .

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image $IMAGE_NAME:$TAG built successfully with VERSION $VERSION."
else
  echo "Docker image build failed."
  exit 1
fi
```
### 示例4：多个构建参数和日志输出
你可以同时传递多个构建参数，并将构建日志保存到文件中，便于调试和跟踪：

```bash
#!/bin/bash

# 镜像名称和标签
IMAGE_NAME="myapp"
TAG="latest"
VERSION="14"
ENVIRONMENT="production"

# 构建时输出日志到 build.log
docker build --build-arg VERSION=$VERSION --build-arg ENVIRONMENT=$ENVIRONMENT -t $IMAGE_NAME:$TAG . > build.log 2>&1

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image $IMAGE_NAME:$TAG built successfully."
else
  echo "Docker image build failed. Check build.log for details."
  exit 1
fi
```

在这个脚本中：

--build-arg VERSION=$VERSION 和 --build-arg ENVIRONMENT=$ENVIRONMENT 用于传递多个构建参数。
> build.log 2>&1 用于将标准输出和标准错误都重定向到 build.log 文件。
进一步优化：使用 .env 文件
你可以将变量提取到 .env 文件中，让脚本自动读取环境变量进行构建。例如：

.env 文件：

```bash
IMAGE_NAME=myapp
TAG=latest
VERSION=14
```
Shell 脚本：

```bash
#!/bin/bash

# 载入 .env 文件中的变量
source .env

# 执行 docker build
docker build --build-arg VERSION=$VERSION -t $IMAGE_NAME:$TAG .

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "Docker image $IMAGE_NAME:$TAG built successfully."
else
  echo "Docker image build failed."
  exit 1
fi
```
## 总结
基本的 docker build 命令可以直接在 Shell 脚本中使用，结合 -t 参数指定镜像名称和标签。
通过传递参数和使用环境变量，你可以编写更灵活的脚本。
可以结合 --build-arg 传递构建参数，用于动态构建镜像。
将构建日志输出到文件中，方便调试。
通过 .env 文件管理环境变量，可以简化脚本管理。