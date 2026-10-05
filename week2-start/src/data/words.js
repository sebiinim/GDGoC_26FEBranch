// 화면에 그릴 단어 목록입니다.
// 지금은 이렇게 파일에 직접 적어두지만, 2회차에서는 이 자리를
// 서버에서 받아온 데이터가 대신하게 됩니다.
//
// 항목 하나가 카드 한 장이 됩니다.
//
//   id           : 목록에서 key 로 쓰는 고유값
//   word         : 영어 단어
//   phonetic     : 발음기호
//   partOfSpeech : 품사
//   meaning      : 뜻
//   example      : 예문
export const WORDS = [
  {
    id: 1,
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    partOfSpeech: '명사',
    meaning: '뜻밖의 행운을 우연히 발견하는 것',
    example: 'Finding that little bookshop was pure serendipity.',
  },
  {
    id: 2,
    word: 'resilience',
    phonetic: '/rɪˈzɪl.i.əns/',
    partOfSpeech: '명사',
    meaning: '회복력, 다시 일어서는 힘',
    example: 'Her resilience helped her recover from the injury.',
  },
  {
    id: 3,
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: '형용사',
    meaning: '어디에나 있는, 아주 흔한',
    example: 'Smartphones have become ubiquitous in daily life.',
  },
  {
    id: 4,
    word: 'meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    partOfSpeech: '형용사',
    meaning: '아주 꼼꼼한, 세심한',
    example: 'He kept meticulous notes of every experiment.',
  },
  {
    id: 5,
    word: 'eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    partOfSpeech: '형용사',
    meaning: '말을 잘하는, 설득력 있는',
    example: 'She gave an eloquent speech about climate change.',
  },
  {
    id: 6,
    word: 'nostalgia',
    phonetic: '/nɒsˈtæl.dʒə/',
    partOfSpeech: '명사',
    meaning: '지난 시절을 그리워하는 마음, 향수',
    example: 'The old photographs filled him with nostalgia.',
  },
]
