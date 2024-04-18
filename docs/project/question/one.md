
## 1. 混用 require 和 import
如果项目中存在混用 commonJS 和 ES6 模块的情况，需要使用 @originjs/vite-plugin-commonjs 这个插件的 transformMixedEsModules 配置进行 hotfix。不然会报错Uncaught ReferenceError: require is not defined。_不过，尽量不要混用，因为尤大大说了这么干不好....
```js
import { defineConfig } from 'vite'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  // ...
  plugins: [
    viteCommonjs({
      transformMixedEsModules: true,
    }),
  ]
})
```

个人理解，这个配置类似于 babel 的 sourceType[8]配置项。因为之前在babel也踩过类似的坑，这里贴出对应 issues4039[9]。其实简单概括就是出现了import和module.exports的混用。

所以，原来项目中用 h 函数渲染图片的写法也要改为es引入，如下：
```js
import exampleImg from './assets/example.png'
import { h } from 'vue';

function renderModal() {
   Modal.confirm({
    title: '操作确认',
    icon: null,
    content: () =>
      h('div', { style: 'text-align: center;padding-bottom: 32px;' }, [
        // 原来vue2的写法 h('img', {attrs: {src: require('./assets/example.png')}})
        h('img', { src: exampleImg })]),

  });

}
```

## 2. 关于浏览器兼容问题
vite 的 build.target[10] 配置项可以配置希望兼容的浏览器版本或者 ES 版本，cssTarget[11]可以对 CSS 的压缩设置一个target，该配置应针对非主流浏览器使用。例如，安卓微信中的 webview，并不支持 CSS 中的十六进制颜色符号, 此时将 build.cssTarget 设置为 chrome61，可以防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制符号的形式。

除此之外, 还可以使用插件 @vitejs/plugin-legacy 进行更多的浏览器兼容问题处理。例如，在内核 chrome 69 版本的360浏览器中，遇到过Uncaught ReferenceError: globalThis is not defined这样的报错。网上搜到可以通过解决浏览器端 globalThis is not defined 报错[12]简单快速的 hotfix 可以解决这个问题，但是我始终觉得不够优雅。

后来翻了下文档，实际可以通过 @vitejs/plugin-legacy 的modernPolyfills配置去解决这个问题，解决配置如下代码。同理,你也可以 Polyfills 你需要的es[13]。

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  server: {
    port: 8080
  },
  build: {
    target: 'es2015', // js兼容处理
    cssTarget: 'chrome49', // css兼容处理
  }
  plugins: [
    vue(),
    legacy({
      targets: ['chrome 49'],
      modernPolyfills: ['es.global-this'], // 解决浏览器端 globalThis is not defined 报错
    }),
  ]
})
```