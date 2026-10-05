import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 이 파일이 앱의 시작점입니다.
// index.html 의 <div id="root"> 를 찾아서, 그 안에 App 컴포넌트를 그립니다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
