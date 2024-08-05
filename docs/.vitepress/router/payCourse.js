
const baseUrl = '/project/payCourse/'
const h = 'huangzhizhong/'
const r = '人人都需要的自我管理'
const cli = [
    {
      text: 'b站的付费课程',
      items: [
        { text: '哲学看透世界', link: baseUrl+'哲学看透世界' },
        { text: '幽默感培养', link: baseUrl+'幽默感培养' },
      ]
    },
    {
      text: '黄执中表达课',
      items: [
        { text: '动机', link: baseUrl+h+'1-1动机' },
        { text: '目的', link: baseUrl+h+'1-2目的' },
        { text: '框架', link: baseUrl+h+'1-3框架' },
        { text: '一句话总结核心思想', link: baseUrl+h+'1-4一句话总结核心思想' },
        { text: '总结', link: baseUrl+h+'总结' },
      ]
    },
    {
      text: r,
      items: [
        { text: '思维管理', link: baseUrl+r+'/思维管理' },
      ]
    }
  ]

  export default cli