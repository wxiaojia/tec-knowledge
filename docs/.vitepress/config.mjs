import { defineConfig } from 'vitepress'

import vue3Route from './router/vue3'
import vue2Route from './router/vue2'
import othersRoute from './router/others'
import pluginRoute from './router/plugin'
import questionRoute from './router/question'
import cliRoute from './router/cli'
import reactRoute from './router/react'

const PR = '/project'
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
          { text: 'vue2', link: PR+'/vue2/index' },
          { text: 'vue3', link: PR+'/vue3/index' },
          { text: 'webpack', link: PR+'/webpack/index' },
          { text: 'plugin', link: PR+'/plugin/index' },
          { text: 'react', link : PR+'/react/hook'},
          { text: '脚手架', link: PR+'/cli/create' }
        ]
      },
      {
        text: '项目/问题',
        link: PR+'/question/one'
      },
      {
        text: '一些概念', link: PR+'/others/gateway' 
      }
    ],
    outlineTitle: '本页导航',
    outline: [2,4],

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
      '/project/vue3/': vue3Route,
      '/project/vue2/': vue2Route,
      '/markdown-examples/': [

      ],
      '/project/react': reactRoute,
      '/project/plugin': pluginRoute,
      '/project/cli': cliRoute,
      '/project/others/': othersRoute,
      '/project/question/': questionRoute
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
