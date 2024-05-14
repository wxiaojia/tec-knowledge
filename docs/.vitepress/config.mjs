import { defineConfig } from 'vitepress'

import vue3Route from './router/vue3'
import vue2Route from './router/vue2'
import othersRoute from './router/others'
import pluginRoute from './router/plugin'
import questionRoute from './router/question'
import threeRoute from './router/three'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "wxiaojia",
  description: "knowledge base",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      {
        text: '学习文档',
        items: [
          { text: 'vue2', link: '/vue2/index' },
          { text: 'vue3', link: '/vue3/index' },
          { text: 'webpack', link: '/webpack/index' },
          { text: 'plugin', link: '/plugin/index' },
          { text: 'threejs', link: '/project/three/index' }
        ]
      },
      {
        text: '项目遇到的问题',
        link: '/question/one'
      },
      {
        text: '一些概念', link: '/others/gateway' 
      }
    ],
    outlineTitle: '本页导航',
    outline: [2, 3],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    sidebar: {
      '/vue3/': vue3Route,
      '/vue2/': vue2Route,
      '/markdown-examples/': [

      ],
      '/plugin': pluginRoute,
      '/others/': othersRoute,
      '/question/': questionRoute,
      '/project/three': threeRoute
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
