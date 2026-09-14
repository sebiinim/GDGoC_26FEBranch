import { useState } from 'react'
import { WORDS } from './data/words'
import WordList from './components/WordList'

export default function App() {
  const [words, setWords] = useState(WORDS)

  function handleDelete(id) {
    setWords(words.filter((item) => item.id !== id))  // 원본 대신 "새 배열"
  }

  return (
    <div className="card-list">
      {words.length === 0 ? (
        <p className="empty-message">단어를 모두 지웠습니다.</p>   // && 였다면? 0의 함정!
      ) : (
        <WordList words={words} onDelete={handleDelete} />    // 함수가 내려간다
      )}
    </div>
  )
}





