import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 이 파일이 앱의 시작점입니다.
// index.html 의 <div id="root"> 를 찾아서, 그 안에 App 컴포넌트를 그립니다.
//
// <StrictMode> 는 "고장"이 아니라 "검사기"입니다.
// 개발 모드에서 일부러 effect 를 한 번 더 실행시켜서
// "이 effect 를 두 번 실행해도 앱이 멀쩡한가?" 를 미리 검사합니다.
// 그래서 개발 중에는 fetch 요청이 두 번 나가는 것처럼 보입니다. 정상입니다.
// (빌드해서 배포하면 한 번만 실행됩니다 — 3회차에 직접 확인합니다)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
