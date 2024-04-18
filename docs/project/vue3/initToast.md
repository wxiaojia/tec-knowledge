（非vuex存储方法）

代码示例 components/show-toast
## initToast.js

```js
import {
    createStore
} from 'vuex'
export default function initToast(v) {
    console.log("[]", v)
    // 挂在store到全局Vue原型上
    v.$toastStore = createStore({
        state: {
            show: false,
            icon: "success", //success:成功；fail:失败
            title: "标题",
            content: '内容',
            duration: 2000,
            success: null,
        },
        mutations: {
            hideToast(state) {
                state.show = false
            },
            showToast(state, data) {
                state = Object.assign(state, data)
                state.show = true
                setTimeout(() => {
                    state.show = false
                    return state.success(state.icon)
                }, state.duration)
            }
        }
    })
    // 注册$showToast到Vue原型上，以方便全局调用
    v.$showToast = function(option) {
        console.log("[m]", option)
        if (typeof option === 'object') {
            v.$toastStore.commit('showToast', option)
        } else {
            throw "配置项必须为对象传入的值为：" + typeof option;
        }
    }
}
```

## show-toast.vue
```js
<template>
    <div class="_showToast" v-if="show">
        <div class="_shade"></div>
        <div class="_ToastBox">
            <div class="Toast-box">
                <div style="height: 40px;"></div>
                <img class="icon" v-if="icon == 'success'" src="@/assets/images/chenggong.png" />
                <span v-if="icon == 'success'" class="Toast-title-success">{{ title }}</span>
                <img class="icon" v-if="icon == 'fail'" src="@/assets/images/shibai.png" />
                <span v-if="icon == 'fail'" class="Toast-title-fail">{{ title }}</span>
                <span class="Toast-subtitle">{{ content }}</span>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: 'show-toast',
    data() {
        return {};
    },
    computed: {
        show() {
            return this.$toastStore.state.show;
        },
        title() {
            return this.$toastStore.state.title;
        },
        content() {
            return this.$toastStore.state.content;
        },
        icon() {
            return this.$toastStore.state.icon;
        }
    },
    methods: {},
    beforeUnmount() {
        this.$toastStore.commit('hideToast');
    }
};
</script>


<style lang="scss" scoped>
._showToast {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    ._shade {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        opacity: 0.6;
        z-index: 11000;
    }
    ._ToastBox {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 12000;
        display: flex;
        justify-content: center;
        align-items: center;
        .Toast-box {
            position: absolute;
            width: 478px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff;
            box-shadow: 0px 10px 20px 0px rgba(28, 23, 47, 0.2);
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            .icon {
                width: 173px;
                height: 117px;
            }
            .Toast-title-fail {
                font-size: 20px;
                font-family: Source Han Sans CN;
                font-weight: bold;
                color: #ec4e4e;
                margin-top: 18px;
            }
            .Toast-title-success {
                font-size: 20px;
                font-family: Source Han Sans CN;
                font-weight: bold;
                color: #26b156;
                margin-top: 18px;
            }
            .Toast-subtitle {
                font-size: 17px;
                font-family: Source Han Sans CN;
                font-weight: 400;
                color: #666666;
                margin-top: 6px;
                padding: 0 12px 12px 12px;
                text-align: center;
                margin-bottom: 50px;
            }
        }
    }
}
</style>

```

## main.js
```js
import {
    createApp
} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
const app = createApp(App);


// 引入自定义弹出框组件
//createApp(App).config.globalProperties代替 Vue 2.x 的 Vue.prototype
import initToast from "@/components/show-toast/initToast.js"
import showToast from "@/components/show-toast/show-toast.vue”

initToast(app.config.globalProperties);
app.component('show-toast', showToast);


app.use(store).use(router).mount('#app');
```

## 页面使用案例
```js
<template>
    <div class="home">
        <button @click="myfn">myfn</button>
        <show-toast></show-toast>
    </div>
</template>


<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
export default {
    name: 'Home',
    components: {},
    setup() {
        const name = ref('miao');
        // getCurrentInstance 支持访问内部组件实例。
        const { appContext } = getCurrentInstance();


        onMounted(() => {
            name.value = '我就是试一下';
        });
        function myfn() {
            appContext.config.globalProperties.$showToast({
                title: '',
                content: 'getCurrentInstance 支持访问内部组件实例',
                icon: 'success', //"fail"
                success: res => {
                    console.log(res);
                }
            });
        }
        return {
            name,
            myfn
        };
    },
    mounted() {
        this.$showToast({
            title: '',
            content: '这是vue3.0全局挂载',
            icon: 'success', //"fail"
            success: res => {
                console.log(res);
            }
        });
    },
    methods: {}
};
</script>
```