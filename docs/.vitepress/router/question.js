const baseUrl = '/project/question/'

const question = [
    {
      text: '项目相关',
      items: [
        { text: '关于构建部署踩的坑', link: baseUrl+'one' },
        { text: 'babel配置', link: baseUrl+'babel' },
        { text: 'es6 动态导入', link: baseUrl+'dynamicImport' },
        { text: 'eslint prettier', link: baseUrl+'eslintprettier' },
        { text: '展示请求进度', link: baseUrl+'requestProgress' },
        { text: '好看的开源页面', link: baseUrl+'goodPage' },
        { text: '高德地图优化（多数据）', link: baseUrl+'gaodeMap' },
      ]
    },
    {
      text: '其他问题',
      items: [
        { text: '为什么只能忘记或修改密码', link: baseUrl+'pwd' },
        { text: '做后台比较多，怎么提升自己', link: baseUrl+'promote' },
        { text: '正则替换ip地址', link: baseUrl+'reg' },
      ]
    },
    {
      text: '其他',
      items: [
        { text: 'npm run serve发生了什么', link: baseUrl+'npmrunserve' },
        { text: '不要再写满屏import啦', link: baseUrl+'notImport' },
      ]
    }
]

export default question