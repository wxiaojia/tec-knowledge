const baseUrl = '/project/question/'

const question = [
    {
      text: '项目遇到的问题',
      items: [
        { text: '关于构建部署踩的坑', link: baseUrl+'one' },
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