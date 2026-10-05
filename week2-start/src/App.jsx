import { useState, useEffect } from 'react'
import WordList from './components/WordList.jsx'
import { WORDS } from './data/words.js'

const BASE_URL = '/api/words'

export default function App() {
  const [words, setWords] = useState(WORDS)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)   // 다음 단계에서 false 로 바꿉니다
  const [error, setError] = useState(null)

  useEffect(() => {
    // useEffect 의 콜백은 cleanup 함수를 돌려줘야 합니다.
    // async 함수는 Promise 를 돌려주므로 콜백 자체를 async 로 만들 수 없습니다.
    async function run() {
      setLoading(true); setError(null); setResult(null)   // 규칙 ②
      try {
        const res = await fetch(`${BASE_URL}/serendipity`)

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
  }, [])

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">나만의 단어장</h1>
        <p className="page-subtitle">저장된 단어 {words.length}개</p>
      </header>

      <section className="search-panel">
        {loading && <p className="status status-loading">🔍 찾는 중…</p>}
        {error && <p className="status status-error">⚠️ {error}</p>}
        {result && <p className="search-result-meaning">{result.meaning}</p>}
      </section>

      <WordList words={words} />
    </>
  )
}



// import { useState } from 'react'
// import AddWordForm from './components/AddWordForm.jsx'
// import WordList from './components/WordList.jsx'
// import { WORDS } from './data/words.js'

// const BASE_URL = '/api/words'

// // 1회차를 마친 상태입니다 (과제까지 포함).
// //
// // App 이 하는 일은 세 가지뿐입니다.
// //   1. 단어 목록을 state 로 "소유"합니다 — 목록을 바꾸는 권한은 App 에만 있습니다
// //   2. 바꾸는 함수(handleAdd / handleDelete)를 만들어 자식에게 내려보냅니다
// //   3. 화면의 큰 골격(머리말 → 추가 폼 → 목록)을 그립니다
// //
// // 카드 한 장을 어떻게 그릴지는 WordCard 가, 목록을 어떻게 돌릴지는 WordList 가 압니다.
// export default function App() {
//   // 목록을 화면에서 지우고 더할 수 있으려면 "변하는 값" = state 여야 합니다.
//   // WORDS 배열 자체를 고치는 게 아니라, WORDS 로 시작하는 state 를 만듭니다.
//   const [words, setWords] = useState(WORDS)
//   const [result, setResult] = useState(null)
//   const [loading, setLoading] = useState(true)   // 20분 뒤에 false 로 바꿉니다
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     // async 는 Promise 를 돌려주므로 콜백 자체를 async 로 못 만듭니다
//     async function run() {
//       setLoading(true); setError(null); setResult(null)   // 규칙 ②
//       try {
//         const res = await fetch(`${BASE_URL}/serendipity`)
//         if (res.status === 404) throw new Error('사전에서 찾을 수 없는 단어입니다.')
//         if (!res.ok) throw new Error(`API 서버가 응답하지 않습니다. (${res.status})`)
//         const json = await res.json()
//         const entry = json[0], meaning = entry.meanings[0], definition = meaning.definitions[0]
//         setResult({ word: entry.word, phonetic: entry.phonetic ?? '',
//           partOfSpeech: meaning.partOfSpeech, meaning: definition.definition,
//           example: definition.example ?? '' })
//       } catch (err) { setError(err.message) }
//       finally { setLoading(false) }                        // 규칙 ③
//     }
//     run()
//   }, [])
//   function handleAdd(newWord) {
//     // 원본을 고치지 않고 새 배열을 만듭니다. (splice/push 금지 — React 가 못 알아챕니다)
//     setWords([newWord, ...words])   // 새 단어를 맨 앞에
//   }

//   function handleDelete(id) {
//     // filter 는 조건에 맞는 것만 남긴 "새 배열"을 돌려줍니다.
//     setWords(words.filter((item) => item.id !== id))
//   }

//   return (
//     <>
//       <header className="page-header">
//         <h1 className="page-title">나만의 단어장</h1>
//         {/* WORDS.length 가 아니라 words.length — 지우고 더한 결과가 반영되어야 하니까요 */}
//         <p className="page-subtitle">오늘 외울 단어 {words.length}개</p>
//       </header>

//       {/* 함수를 props 로 내려보냅니다. 자식이 이 함수를 부르면 App 의 state 가 바뀝니다. */}
//       <AddWordForm onAdd={handleAdd} />

//       {words.length === 0 ? (
//         // {words.length && ...} 로 쓰면 화면에 0 이 찍힙니다. 그래서 비교(===)로 씁니다.
//         <p className="empty-message">아직 단어가 없습니다. 위에서 추가해 보세요.</p>
//       ) : (
//         <WordList words={words} onDelete={handleDelete} />
//       )}
//     </>
//   )
// }
