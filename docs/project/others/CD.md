root polarise@192.168.20.212
polarise

helm repo list 
docker ps | grep iot 
docker ps 列出容器，grep 过滤

daemon off; 关闭后台运行 nginx.conf配置文件，注意Nginx默认是后台运行的，但Docker需要其在前台运行，否则直接退出容器。配置文件中添加daemon off;关闭后台运行。