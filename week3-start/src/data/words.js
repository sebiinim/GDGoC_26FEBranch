// 앱을 처음 열었을 때 보여줄 기본 단어입니다.
// localStorage 에 저장된 단어장이 아직 없을 때만 사용됩니다.
//
// 단어 하나의 모양(필드 이름)을 여기서 정해두는 것이 중요합니다.
// 사전 API 의 응답도, 미니 API 의 응답도 결국 이 모양으로 "번역해서" 씁니다.
//
//   id           : 목록에서 key 로 쓰는 고유값 (추가할 때는 Date.now() 를 씁니다)
//   word         : 영어 단어
//   phonetic     : 발음기호 (없을 수 있어서 빈 문자열을 허용합니다)
//   partOfSpeech : 품사
//   meaning      : 뜻
//   example      : 예문 (없을 수 있어서 빈 문자열을 허용합니다)
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
]
