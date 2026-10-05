import WordCard from './WordCard.jsx'

// 단어 목록입니다. 배열을 map 으로 돌면서 카드를 그립니다.
//
// key 에 index 를 쓰지 마세요.
// key 는 "React 야, 이 항목은 아까 그 항목과 같은 것이야" 라고 알려주는 이름표입니다.
// index 를 쓰면 목록 앞쪽에 새 항목이 끼어들 때 이름표가 통째로 밀려서
// 엉뚱한 카드의 state(뒤집힘 여부)가 남아 있는 버그가 납니다.
// 그래서 항목마다 고유한 id 를 씁니다.
export default function WordList({ words, onDelete }) {
  return (
    <main className="card-list">
      {words.map((item) => (
        <WordCard
          key={item.id}
          word={item.word}
          phonetic={item.phonetic}
          partOfSpeech={item.partOfSpeech}
          meaning={item.meaning}
          example={item.example}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </main>
  )
}
