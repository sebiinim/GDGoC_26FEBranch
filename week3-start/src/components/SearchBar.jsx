import { useState } from 'react'

// 검색창입니다.
//
// 이 컴포넌트는 "검색이 무슨 일을 하는지" 전혀 모릅니다.
// 그냥 사용자가 입력한 글자를 부모가 준 onSearch 함수에 넘겨줄 뿐입니다.
// 그래서 fetch 를 하든, 목록을 거르든, 어디에 갖다 붙여도 그대로 동작합니다.
//   → 데이터는 위에서 아래로, 사건은 아래에서 위로.
export default function SearchBar({ onSearch }) {
  // 입력 중인 글자는 "이 검색창만의 관심사"라서 여기서 들고 있습니다.
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
