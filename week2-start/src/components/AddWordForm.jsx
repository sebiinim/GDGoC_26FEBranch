import { useState } from 'react'

// 1회차 과제(필수 1)의 완성본입니다.
// 입력창 두 개(단어/뜻)와 추가 버튼 — 제출하면 부모(App)가 내려준 onAdd 를 부릅니다.
// 2회차에는 이 폼을 "검색창(SearchBar)"으로 개조합니다.
export default function AddWordForm({ onAdd }) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')

  function handleSubmit(event) {
    event.preventDefault()        // 폼의 기본 동작(페이지 새로고침)을 막습니다
    if (word.trim() === '') return

    onAdd({
      id: Date.now(),             // 지금 시각(밀리초). 겹치지 않는 간단한 id
      word: word.trim(),
      phonetic: '',
      partOfSpeech: '',
      meaning: meaning.trim(),
      example: '',
    })

    setWord('')                   // 입력창 비우기
    setMeaning('')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        className="add-input"
        value={word}
        onChange={(event) => setWord(event.target.value)}
        placeholder="단어를 추가하세요"
      />
      <input
        className="add-input"
        value={meaning}
        onChange={(event) => setMeaning(event.target.value)}
        placeholder="뜻"
      />
      <button className="add-submit" type="submit">추가</button>
    </form>
  )
}
