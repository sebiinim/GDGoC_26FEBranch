import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')

export default function RecommendedWords() {
  const [words, setWords] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/words`)
      .then((r) => r.json())
      .then(setWords)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p style={{ color: 'crimson' }}>추천 단어를 불러오지 못했습니다: {error}</p>

  return (
    <section>
      <h2>추천 단어</h2>
      <ul>
        {words.map((w) => (
          <li key={w.word}>{w.word} — {w.meaning}</li>
        ))}
      </ul>
    </section>
  )
}