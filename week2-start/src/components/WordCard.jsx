import { useState } from 'react'

// 단어 카드 한 장입니다.
//
// - 데이터는 전부 props 로 "위에서 아래로" 내려받습니다.
// - 뜻을 보였다/숨겼다 하는 것은 이 카드 한 장만의 관심사라서
//   부모가 아니라 이 컴포넌트 안에서 useState 로 들고 있습니다.
//   (카드 A를 뒤집어도 카드 B는 그대로인 이유가 이것입니다)
export default function WordCard({
  word,
  phonetic,
  partOfSpeech,
  meaning,
  example,
  onDelete,
}) {
  const [revealed, setRevealed] = useState(false)

  // 카드를 클릭하면 revealed 를 반대로 뒤집습니다.
  // revealed = true 처럼 직접 대입하면 화면이 안 바뀝니다. 반드시 set 함수로 바꿉니다.
  function handleClick() {
    setRevealed((prev) => !prev)
  }

  // 삭제 버튼은 카드 "안"에 있습니다.
  // 그냥 두면 삭제를 누를 때 카드 클릭까지 같이 일어나서 뒤집히기도 합니다.
  // (클릭이 자식 → 부모로 거슬러 올라가는 것을 이벤트 버블링이라고 합니다)
  // stopPropagation() 으로 여기서 멈춰 세웁니다.
  function handleDelete(event) {
    event.stopPropagation()
    onDelete()
  }

  return (
    <article className="card" onClick={handleClick}>
      <div className="card-head">
        <h2 className="card-word">{word}</h2>
        {/* phonetic 은 없는 단어가 많습니다. 빈 문자열이면 아예 안 그립니다. */}
        {phonetic && <span className="card-pron">{phonetic}</span>}
      </div>
      <span className="card-pos">{partOfSpeech}</span>

      {/* 조건부 렌더링 — 삼항 연산자로 둘 중 하나를 그립니다.
          revealed 가 true 면 뜻과 예문, false 면 안내 문구. */}
      {revealed ? (
        <>
          <p className="card-meaning">{meaning}</p>
          {example && <p className="card-example">{example}</p>}
        </>
      ) : (
        <p className="card-hint">클릭해서 뜻 보기</p>
      )}

      {/* onDelete 를 안 내려준 곳에서도 이 카드를 쓸 수 있게 조건부로 그립니다. */}
      {onDelete && (
        <div className="card-actions">
          <button className="card-button card-button-danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}
    </article>
  )
}
