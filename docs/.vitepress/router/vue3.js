
const baseUrl = '/project/vue3/'

const vue3 = [
    {
      text: 'vue3',
      collapsed: false,
      items: [
        { text: 'vue3.0 特性', link: baseUrl + 'vue3/aboutVue' },
        { text: '父子组件通过v-model 双向绑定', link: baseUrl + 'vue3/parent-son' },
        { text: '通信方式', link: baseUrl + 'vue3/communication' },
        { text: 'defineProps、withDefaults', link: baseUrl + 'vue3/define' },
        { text: 'getCurrentInstance', link: baseUrl + 'vue3/getCurrentInstance' },
        { text: 'Reactivity', link: baseUrl + 'vue3/Reactivity' },
        { text: 'shims-vue.d.ts', link: baseUrl + 'vue3/shimsVue' },
        { text: 'pinia', link: baseUrl + 'vue3/pinia' },
      ]
    },
    {
      text: '封装',
      collapsed: true,
      items: [
        { text: '自定义全局组件', link: baseUrl + 'initToast' },
      ]
    },
    {
      collapsed: true,
      text: '优化相关',
      items: [
        { text: '关于响应式部分的优化-未完', link: baseUrl },
      ]
    },
    {
      collapsed: true,
      text: '与vue2',
      items: [
        { text: 'vue2升级vue3', link: baseUrl + 'compareTwo/updateVue' },
        { text: '与vue2的与众不同', link: baseUrl + 'compareTwo/compareVue2' },
      ]
    }
  ]

  export default vue3