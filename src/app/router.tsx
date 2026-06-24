import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import Shell from './Shell'

const HomePage = lazy(() => import('@/pages/HomePage'))
const GamesPage = lazy(() => import('@/pages/GamesPage'))
const ReposPage = lazy(() => import('@/pages/ReposPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))

// GitHub Pages 子路径部署时 BASE_URL 形如 "/AboutMe/"，router basename 去掉尾斜杠
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Shell />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'games', element: <GamesPage /> },
        { path: 'repos', element: <ReposPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: '*', element: <HomePage /> },
      ],
    },
  ],
  { basename },
)
