import WordCard from "./WordCard"

export default function WordList({ words, onDelete }) {
  return (
    <main className="card-list">
      {words.map((item) => (
        <WordCard key={item.id} word={item.word} phonetic={item.phonetic}
                  partOfSpeech={item.partOfSpeech} meaning={item.meaning}
                  example={item.example} 
                  onDelete={() => onDelete(item.id)}/>
      ))}
    </main>
  )
}