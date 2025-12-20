export type ContactType = 'email' | 'github' | 'bilibili' | 'qq' | 'youtube'

export type LinkItem = { label: string; href: string; icon?: string }

export type Project = {
  title: string
  description: string
  role: string
  contribution: string[]
  cover: string
  tags: string[]
  links: LinkItem[]
}

export const content = {
  hero: {
    name: 'Yatmt',
    title: '初中生 & 字幕搬运工',
    subtitle: '游戏 · 翻译 · 技术：玩旮旯给木玩的，请勿投喂 Bug',
    location: '中国 · 云南 · 楚雄',
    intro:
      'Monday Eat My Ass 🙄💅',
    tags: ['🎮 游戏玩家（不一定通关）', '🌐 业余翻译/字幕员（偶尔翻车）', '🐌 活着就不错了', '💻 玩开源玩的（面向屎山编程）'],
    primaryAction: { label: '去 B 站摸鱼', href: 'https://space.bilibili.com/517013017', icon: 'smart_display' },
    secondaryAction: { label: '去 GitHub 挖宝', href: 'https://github.com/Yar1991-Translation', icon: 'code' },
  },
  tabs: [
    {
      id: 'game',
      label: '游戏',
      intro: '我喜欢玩的游戏之类的，可能会有一些我自己的游戏作品(大概率没有)。',
      projects: [
        {
          title: '像素微冒险',
          description: '极短关卡 + 彩蛋投喂，主打“轻度挑战 + 轻度上头”。',
          role: '设计 / 程序 / 关卡（全栈背锅）',
          contribution: ['玩法原型&平衡（手感对了再说）', '像素 UI 与动效（让它看起来更会玩）', '音效整合与打磨（咔哒一声很治愈）'],
          cover: '/covers/game.svg',
          tags: ['Unity', 'C#', 'Pixel Art'],
          links: [
            { label: 'B站视频（高清无码）', href: 'https://space.bilibili.com/517013017', icon: 'smart_display' },
            { label: 'GitHub（源码在这）', href: 'https://github.com/Yar1991-Translation', icon: 'code' },
          ],
        },
      ],
    },
    {
      id: 'translate',
      label: '仓库相关',
      intro: '自己搞得一些垃圾项目',
      projects: [
        {
          title: '  字幕仓库',
          description: '自己翻译的一些视频。',
          role: '翻译 / 时轴 / 压制（对齐强迫症）',
          contribution: ['翻译/时轴/压制（对齐强迫症）'],
          cover: '/covers/translate.svg',
          tags: ['翻译', '字幕', 'Premiere', 'GitHub'],
          links: [
            { label: 'GitHub（源码在这）', href: 'https://github.com/Yar1991-Translation', icon: 'code' },
          ],
        },
      ],
    },
    {
      id: 'contact',
      label: '联系',
      intro: '有合作、交流想要翻译视频/提供字幕或者只是想要找我玩，尽管来敲门，我不咬人（大概）。',
      projects: [],
    },
  ],
  contacts: [
    { label: 'Email（投递灵魂）', href: 'mailto:yar200000628@gmail.com', type: 'email' as const },
    { label: 'GitHub', href: 'https://github.com/Yar1991-Translation', type: 'github' as const },
    { label: 'Bilibili', href: 'https://space.bilibili.com/517013017', type: 'bilibili' as const },
    { label: 'QQ（滴滴）', href: 'tencent://message/?uin=3069049949&Site=qq&Menu=yes', type: 'qq' as const },
    { label: 'YouTube', href: 'https://www.youtube.com/yatmt', type: 'youtube' as const },
  ],
}

export {}
 
