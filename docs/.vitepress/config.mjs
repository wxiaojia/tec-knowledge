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
import serverRoute from './router/server'
import AIRoute from './router/ai'
import payCourseRoute from './router/payCourse'
import notesRoute from './router/notes'
// git
// H5
// rust

const PR = '/project'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/tec-knowledge/',
  // outDir: '../../dist',  // 输出目录相对于 .vitepress 文件夹的路径
  title: "wxiaojia",
  description: "knowledge base",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: '学习文档',
        items: [
          // { text: 'vue2', link: PR+'/vue2/index' },
          { text: 'vue3', link: PR+'/vue3/index' },
          // { text: 'webpack', link: PR+'/webpack/index' },
          { text: 'plugin', link: PR+'/plugin/index' },
          { text: 'threejs', link: PR+'/three/index' },
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
      },
      {
        text: 'AI', link: PR+'/AI/index' 
      },
      {
        text: 'b付费课程', link: PR+'/payCourse/哲学看透世界' 
      },
      {
        text: '播客/书笔记', link: PR+'/notes/books/influence' 
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
      // '/project/webpack': pluginRoute,
      '/project/plugin': pluginRoute,
      '/project/cli': cliRoute,
      '/project/others/': othersRoute,
      '/project/question/': questionRoute,
      '/project/node': nodeRoute,
      '/project/AV': avRoute,
      '/project/server': serverRoute,
      '/project/AI': AIRoute,
      '/project/payCourse': payCourseRoute,
      '/project/notes': notesRoute
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
