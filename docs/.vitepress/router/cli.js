
const baseUrl = '/project/cli/'
const cli = [
    {
      text: '脚手架',
      items: [
        { text: '搭建一个脚手架', link: baseUrl+'create' },
        { text: '仿vue-cli', link: baseUrl+'start' },
        { text: '分析vue-cli生成步骤', link: baseUrl+ 'fakeVueCli'},
        { text: 'yargs', link: baseUrl+ 'yargs'},
        { text: 'commander', link: baseUrl+ 'commander'},
        { text: 'yargs vs commander', link: baseUrl+ 'yargsvscommander'},
        { text: 'lerna vs monorepo', link: baseUrl+ 'lernaVSmonorepo'}
      ]
    }
  ]

  export default cli