## 通过debug搞清楚.vue文件怎么变成.js文件
浏览器只认识html\css\js等文件类型，所以需要一个工具将.vue文件变成 .js文件
第一想到的是使用 webpack 或 vite,但他们本身也没有能力去处理vue文件
其实背后使用 **vue-loader** 和 **vitejs/plugin-vue**,这里以vitejs/plugin-vue为例


### 举个例子
这个是我的源代码App.vue文件：
```vue
<template>
  <h1 class="msg">{{ msg }}</h1>
</template>

<script setup lang="ts">
import { ref } from "vue";

const msg = ref("hello word");
</script>

<style scoped>
.msg {
  color: red;
  font-weight: bold;
}
</style>
```
这个例子很简单，在setup中定义了msg变量，然后在template中将msg渲染出来。

下面这个是我从network中找到的编译后的js文件，已经精简过了：
```js
import {
  createElementBlock as _createElementBlock,
  defineComponent as _defineComponent,
  openBlock as _openBlock,
  toDisplayString as _toDisplayString,
  ref,
} from "/node_modules/.vite/deps/vue.js?v=23bfe016";
import "/src/App.vue?vue&type=style&index=0&scoped=7a7a37b1&lang.css";  // <style scoped>模块。

const _sfc_main = _defineComponent({       // 对应script模块
  __name: "App",
  setup(__props, { expose: __expose }) {
    __expose();
    const msg = ref("hello word");
    const __returned__ = { msg };
    return __returned__;
  },
});

const _hoisted_1 = { class: "msg" };
//  对应template模块
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createElementBlock(
      "h1",
      _hoisted_1,
      _toDisplayString($setup.msg),
      1
      /* TEXT */
    )
  );
}

__sfc__.render = render;
export default _sfc_main;
```
编译后的js代码中我们可以看到主要有三部分，想必你也猜到了这三部分刚好对应vue文件的那三块。

### 通过debug
vite.config.ts中使用 @vitejs/plugin-vue
1）走vuePlugin函数
```js
function vuePlugin(rawOptions = {}) {
const options = shallowRef({
    compiler: null,
    // 省略...
  });

  return {
    name: "vite:vue",
    handleHotUpdate(ctx) {
      // ...
    },
    config(config) {
      // ..
    },
    configResolved(config) {
      // ..
    },
    configureServer(server) {
      // ..
    },
    buildStart() {      // 服务器启动时调用
      // ..
       const compiler = options.value.compiler = options.value.compiler || resolveCompiler(options.value.root);
    },
    async resolveId(id) {
      // ..
    },
    load(id, opt) {
      // ..
    },
    transform(code, id, opt) {      //  vite解析时每个模块时调用
        // 解析App.vue文件时transform函数实际就是执行了transformMain函数，
        const { filename, query } = parseVueRequest(id);
        if (!query.vue) {
            return transformMain(
            code,
            filename,
            options.value,
            this,
            ssr,
            customElementFilter.value(filename)
            );
        } else {
            const descriptor = query.src ? getSrcDescriptor(filename, query) || getTempSrcDescriptor(filename, query) : getDescriptor(filename, options.value);
            if (query.type === "style") {
            return transformStyle(
                code,
                descriptor,
                Number(query.index || 0),
                options.value,
                this,
                filename
            );
            }
        }
    }
  };
}
```
@vitejs/plugin-vue 是一个plugin插件，函数返回的对象就是对应的插件钩子函数。


### buildStart的时候
 options.value.compiler 返回的是null,所以走resolveCompiler
```js
function resolveCompiler(root) {
  const compiler = tryResolveCompiler(root) || tryResolveCompiler();
  return compiler;
}

// 判断是否为vue3.x版本
function tryResolveCompiler(root) {
  const vueMeta = tryRequire("vue/package.json", root);
  if (vueMeta && vueMeta.version.split(".")[0] >= 3) {
    return tryRequire("vue/compiler-sfc", root);
  }
}
```
所以经过初始化后options.value.compiler的值就是vue的底层库 **vue/compiler-sfc**

### transformMain
- 根据源代码code字符串调用createDescriptor函数生成一个descriptor对象。
- 调用genScriptCode函数传入第一步生成的descriptor对象将script setup模块编译为浏览器可执行的js代码。
- 调用genTemplateCode函数传入第一步生成的descriptor对象将 template 模块编译为render函数。
- 调用genStyleCode函数传入第一步生成的descriptor对象将style scoped 模块编译为类似这样的import语句，import "/src/App.vue?vue&type=style&index=0&scoped=7a7a37b1&lang.css";。

### createDescriptor
```js
// 解析app.js：filename就是App.vue的文件路径，source就是App.vue中我们写的源代码。
// 在vite启动时调用了buildStart钩子函数，然后将vue底层包vue/compiler-sfc赋值给options的compiler属性。
function createDescriptor(filename, source, { root, isProduction, sourceMap, compiler, template }, hmr = false) {
  const { descriptor, errors } = compiler.parse(source, {   // compiler.parse其实就是调用的vue/compiler-sfc包暴露出来的parse函数，
    filename,
    sourceMap,
    templateParseOptions: template?.compilerOptions
  });
  const normalizedPath = slash(path.normalize(path.relative(root, filename)));
  descriptor.id = getHash(normalizedPath + (isProduction ? source : ""));
  return { descriptor, errors };
}
```
parse:
```js
export function parse(
    source: string,     // vue文件源代码
    options: SFCParseOptions = {},  
): SFCParseResult {}
```
SFCParseResult的类型
```js
export interface SFCParseResult {
  descriptor: SFCDescriptor
  errors: (CompilerError | SyntaxError)[]
}

export interface SFCDescriptor {
  filename: string
  source: string
  template: SFCTemplateBlock | null
  script: SFCScriptBlock | null
  scriptSetup: SFCScriptBlock | null
  styles: SFCStyleBlock[]
  customBlocks: SFCBlock[]
  cssVars: string[]
  slotted: boolean
  shouldForceReload: (prevImports: Record<string, ImportBinding>) => boolean
}
```
SFCDescriptor中，其中的template属性就是App.vue文件对应的template标签中的内容，里面包含了由App.vue文件中的template模块编译成的AST抽象语法树和原始的template中的代码。

未完待续。。。