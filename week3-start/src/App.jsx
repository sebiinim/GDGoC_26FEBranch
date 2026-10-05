import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import WordList from './components/WordList.jsx'
import { useWordSearch } from './hooks/useWordSearch.js'
import { WORDS } from './data/words.js'
import RecommendedWords from './components/RecommendedWords.jsx'

// localStorage 는 이 사이트 전체가 공유하는 "하나의 서랍"입니다.
// 'words' 같은 짧은 이름을 쓰면 다른 라이브러리나 페이지와 부딪힐 수 있습니다.
// 그래서 앱 이름을 접두사처럼 붙인 키를 씁니다.
const STORAGE_KEY = 'my-vocabulary'

/**
 * 저장소에서 내 단어장을 읽어옵니다.
 *
 * ★ 복원은 useEffect 가 아니라 useState 의 초기값으로 해야 합니다.
 *
 *   복원 = "화면을 처음 그리기 전에 이미 알고 있어야 하는 값"  → useState 초기값
 *   저장 = "화면이 바뀐 뒤에 곁다리로 하는 일"                 → useEffect
 *
 *   useEffect 는 항상 "렌더 후"에 실행됩니다. 그래서 복원에 쓰면
 *     ① 기본 단어가 한 프레임 그려졌다가 내 목록으로 바뀌는 깜빡임이 생기고
 *     ② 저장 effect 가 먼저 돌면서 저장소를 기본값으로 덮어쓰는 순간이 생깁니다.
 *       그 짧은 순간에 탭을 닫으면 내 단어가 진짜로 날아갑니다.
 */
function loadWords() {
  const saved = localStorage.getItem(STORAGE_KEY)

  // 저장된 게 없으면 기본 단어로 시작합니다.
  if (saved === null) return WORDS

  try {
    // localStorage 는 "문자열만" 담는 서랍입니다.
    // 넣을 때 JSON.stringify, 꺼낼 때 JSON.parse — 항상 짝으로 씁니다.
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : WORDS
  } catch {
    // 저장소 내용이 깨졌을 때 앱 전체가 죽지 않게 합니다.
    // (실습 중 저장소가 꼬이면 콘솔에서 localStorage.clear() 가 비상 탈출구입니다)
    return WORDS
  }
}

export default function App() {
  // ★ useState(loadWords) — 괄호를 붙이지 않았습니다.
  //   useState(loadWords())  → 렌더할 때마다 저장소를 읽고 JSON.parse 합니다. 낭비.
  //   useState(loadWords)    → React 가 처음 한 번만 실행합니다. (게으른 초기화)
  //   괄호를 붙이면 "지금 실행해라", 빼면 "필요할 때 네가 실행해라".
  const [words, setWords] = useState(loadWords)

  // 검색어. SearchBar 가 제출할 때만 바뀝니다. (타이핑할 때마다가 아닙니다)
  const [query, setQuery] = useState('')

  // 검색에 필요한 로직은 전부 커스텀 훅 안에 있습니다.
  // App 은 "무엇이 필요한지"만 말하고, "어떻게 가져오는지"는 모릅니다.
  const { data: result, loading, error } = useWordSearch(query)

  // words 가 바뀔 때마다 저장합니다.
  // 저장은 "화면이 바뀐 뒤에 하는 곁다리 작업"이므로 useEffect 가 맞습니다.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
  }, [words])

  // 이미 단어장에 있는 단어인지 확인합니다.
  const alreadyAdded =
    result !== null && words.some((item) => item.word === result.word)

  function handleAdd() {
    if (result === null) return
    if (alreadyAdded) return

    // ❌ words.push(...) 후 setWords(words) → 같은 배열이라 React 가 다시 안 그립니다.
    // ✅ 새 배열을 만들어 갈아끼웁니다. (state 는 고치지 말고 새로 만든다)
    setWords([{ id: Date.now(), ...result }, ...words])

    // 결과 패널을 비웁니다. query 를 '' 로 되돌리면
    // useWordSearch 안에서 data/error/loading 이 함께 초기화됩니다.
    setQuery('')
  }

  function handleDelete(id) {
    setWords(words.filter((item) => item.id !== id))
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">나만의 단어장</h1>
        <p className="page-subtitle">저장된 단어 {words.length}개</p>
      </header>

      {/* set 함수 자체를 그대로 내려줍니다.
          SearchBar 는 이게 무엇을 촉발하는지 몰라도 됩니다. */}
      <SearchBar onSearch={setQuery} />

      <section className="search-panel">
        {/* 로딩 / 에러는 StatusMessage 가 담당합니다.
            셋 중 하나만 보이도록 아래 결과 블록은 result 가 있을 때만 그립니다. */}
        <StatusMessage loading={loading} error={error} />

        {result && (
          <div className="search-result">
            <div className="search-result-head">
              <h2 className="search-result-word">{result.word}</h2>
              {result.phonetic && (
                <span className="search-result-pron">{result.phonetic}</span>
              )}
              <span className="card-pos">{result.partOfSpeech}</span>
            </div>

            <p className="search-result-meaning">{result.meaning}</p>
            {result.example && (
              <p className="search-result-example">{result.example}</p>
            )}

            {/* 반응 없는 버튼은 느린 버튼보다 나쁩니다.
                이미 있는 단어면 버튼을 잠그고 이유를 글자로 알려줍니다. */}
            <button
              className="search-result-add"
              onClick={handleAdd}
              disabled={alreadyAdded}
            >
              {alreadyAdded ? '이미 단어장에 있습니다' : '내 단어장에 추가'}
            </button>
          </div>
        )}
      </section>

      {words.length === 0 ? (
        <StatusMessage
          empty
          emptyText="단어장이 비어 있습니다. 위에서 단어를 검색해 추가해 보세요."
        />
      ) : (
        <WordList words={words} onDelete={handleDelete} />
      )}

      <RecommendedWords></RecommendedWords>
    </>
  )
}
