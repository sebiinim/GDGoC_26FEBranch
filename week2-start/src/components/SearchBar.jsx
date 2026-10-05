import { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('')

  function handleSubmit(event) {
    // 이 한 줄을 빼면 폼의 원래 동작(페이지 새로고침)이 일어납니다.
    // 새로고침되면 state 가 전부 초기화되어 앱이 처음 상태로 돌아갑니다.
    event.preventDefault()

    const trimmed = input.trim()
    if (trimmed === '') return

    // 사전 API 는 소문자 기준으로 찾는 편이 안전합니다.
    onSearch(trimmed.toLowerCase())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        className="search-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="영어 단어를 검색하세요 (예: serendipity)"
      />
      <button className="search-submit" type="submit">
        검색
      </button>
    </form>
  )
}