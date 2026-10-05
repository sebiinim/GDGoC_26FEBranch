import { useState, useEffect } from 'react'
import WordList from './components/WordList.jsx'
import { WORDS } from './data/words.js'
import SearchBar from './components/SearchBar.jsx'
import AddWordForm from './components/AddWordForm.jsx'

const BASE_URL = '/api/words'

export default function App() {
  const [words, setWords] = useState(WORDS)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)   // 다음 단계에서 false 로 바꿉니다
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {

    if (query === '') {
      setResult(null); setError(null); setLoading(false);
      return
    }
    // useEffect 의 콜백은 cleanup 함수를 돌려줘야 합니다.
    // async 함수는 Promise 를 돌려주므로 콜백 자체를 async 로 만들 수 없습니다.
    async function run() {
      setLoading(true); setError(null); setResult(null)   // 규칙 ②
      try {
        const res = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`)

        if (res.status === 404) {
          throw new Error('사전에서 찾을 수 없습니다. 철자를 확인해 주세요.')
        }
        if (!res.ok) {
          throw new Error(`API 서버가 응답하지 않습니다. (${res.status})`)
        }

        const json = await res.json()

        setResult({
          id: `${json.word}-${Date.now()}`,
          word: json.word,
          phonetic: json.phonetic ?? '',
          partOfSpeech: json.partOfSpeech,
          meaning: json.meaning,
          example: json.example ?? '',
        })
        setLoading(false)                                   // 규칙 ③
      } catch (err) {
        setError(err.message)
        setLoading(false)                                   // 규칙 ③
      }
    }

    run()
  }, [query])

  function handleAdd(newWord) {
    // 원본을 고치지 않고 새 배열을 만듭니다. (splice/push 금지 — React 가 못 알아챕니다)
    setWords([newWord, ...words])   // 새 단어를 맨 앞에
  }

  function handleDelete(id) {
    // filter 는 조건에 맞는 것만 남긴 "새 배열"을 돌려줍니다.
    setWords(words.filter((item) => item.id !== id))
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">나만의 단어장</h1>
        <p className="page-subtitle">저장된 단어 {words.length}개</p>
      </header>

      <AddWordForm onAdd={handleAdd} />
      <SearchBar onSearch={setQuery} />

      {words.length === 0 ? (
        <p className="empty-message">아직 단어가 없습니다. 추가하세요</p>
      ) : (
        <WordList words={words} onDelete={handleDelete} />
      )}
    </>
  )
}