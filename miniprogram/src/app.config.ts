export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/upload/index',
    'pages/wardrobe/index',
    'pages/outfits/index',
    'pages/profile/index',
    'pages/login/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#101114',
    navigationBarTitleText: '衣橱管家',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f2ed',
  },
  tabBar: {
    color: '#7d7468',
    selectedColor: '#111111',
    backgroundColor: '#fffaf3',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '今日' },
      { pagePath: 'pages/upload/index', text: '上传' },
      { pagePath: 'pages/wardrobe/index', text: '衣橱' },
      { pagePath: 'pages/outfits/index', text: '搭配' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
});
