const baseUrl = '/project/question/'

const question = [
    {
      text: '项目遇到的问题',
      items: [
        { text: '关于构建部署踩的坑', link: baseUrl+'one' },
        { text: 'babel配置', link: baseUrl+'babel' },
        { text: 'es6 动态导入', link: baseUrl+'dynamicImport' },
        { text: 'eslint prettier', link: baseUrl+'eslintprettier' },
      ]
    },
    {
      text: '其他问题',
      items: [
        { text: '为什么只能忘记或修改密码', link: baseUrl+'pwd' },
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