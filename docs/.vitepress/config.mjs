import { defineConfig } from 'vitepress'

import vue3Route from './router/vue3'
import vue2Route from './router/vue2'
import vueRoute from './router/vue'
import othersRoute from './router/others'
import pluginRoute from './router/plugin'
import questionRoute from './router/question'
import threeRoute from './router/three'
import cliRoute from './router/cli'
import reactRoute from './router/react'
import nodeRoute from './router/node'
import avRoute from './router/av'
import serverRoute from './router/docker'

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
          { text: 'vue2', link: '/vue2/index' },
          { text: 'vue3', link: '/vue3/index' },
          { text: 'webpack', link: '/webpack/index' },
          { text: 'plugin', link: '/plugin/index' },
          { text: 'threejs', link: '/project/three/index' },
          { text: 'vue', link: PR+'/vue/transform' },
          { text: 'react', link : PR+'/react/hook'},
          { text: '脚手架', link: PR+'/cli/create' },
          { text: 'node', link: PR+'/node/commands' },
          { text: '音视频', link: PR+'/AV/index' },
          { text: '服务器', link: PR+'/server/docker' }
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
      '/project/vue/': vueRoute,
      '/markdown-examples/': [

      ],
      '/project/three': threeRoute,
      '/project/react': reactRoute,
      '/project/plugin': pluginRoute,
      '/project/cli': cliRoute,
      '/project/others/': othersRoute,
      '/project/question/': questionRoute,
      '/project/node': nodeRoute,
      '/project/AV': avRoute,
      '/project/server': serverRoute
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
