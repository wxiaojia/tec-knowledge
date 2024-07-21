```js
function replaceIpAndPort(url, newHost) {
    // // 使用正则表达式匹配协议、IP、端口和路径
    // const regex = /^(https?:\/\/)[^\/:]+(:\d+)?(\/.*)?$/;
    // // 替换找到的IP和端口部分
    // return url.replace(regex, `$1${newHost}$3`);
     const regex = /^(https?:\/\/[^\/]+)(\/.*)?$/;
    // 使用 newBaseUrl 替换匹配的基础URL部分
    return originalUrl.replace(regex, `${newBaseUrl}$2`);
}

// 使用示例
const originalUrl = "http://192.168.1.1:8080/api/data";
const newHost = "example.com"; // 新的主机名和端口（如果需要）

const newUrl = replaceIpAndPort(originalUrl, newHost);
console.log(newUrl); // 输出: http://example.com/api/data
```