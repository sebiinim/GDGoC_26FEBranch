import { useState, useEffect } from 'react'

// ==================================================================
// useWordSearch — 사전 검색 로직만 떼어낸 커스텀 훅
// ==================================================================
//
// [커스텀 훅이 뭔가요]
//   이름이 use 로 시작하고, 안에서 다른 훅(useState/useEffect)을 쓰는 함수입니다.
//   문법적으로 특별한 것은 없습니다. 그냥 함수입니다.
//
// [왜 뺐나요 — 재사용보다 관심사 분리가 먼저입니다]
//   이걸 빼기 전의 App.jsx 는 이런 것들을 전부 알고 있었습니다.
//     ① 화면을 어떻게 배치할지            ← App 이 알아야 할 일
//     ② 내 단어장 목록을 어떻게 관리할지    ← App 이 알아야 할 일
//     ③ 사전 API 주소와 응답 구조          ← App 이 왜 알아야 하죠?
//     ④ 로딩/에러 state 를 어떻게 굴리는지  ← App 이 왜 알아야 하죠?
//     ⑤ 경쟁 상태를 어떻게 막는지          ← App 이 왜 알아야 하죠?
//   ③④⑤ 를 여기로 옮겼습니다. App.jsx 는 이제 한 줄만 씁니다.
//     const { data, loading, error } = useWordSearch(query)
// ==================================================================

// ==================================================================
// 어디에 물어보나 — 상대경로 '/api' 의 비밀
// ==================================================================
// 주소에 http://... 가 없습니다. '/api/words/apple' 처럼 상대경로입니다.
//   개발 중(npm run dev)에는 vite.config.js 의 proxy 설정이 이 요청을
//   미니 API 서버(localhost:3001)로 대신 전달해 줍니다.
//   → 그래서 실습 전에 미니 API 서버를 먼저 켜두어야 합니다:
//        node materials/실습코드/mini-api/server.js
//
// ★ 3회차 복선: "빌드 결과물에는 Vite가 없다. 그럼 누가 전달해 주지?"
//
// [왜 외부 사전 API 를 안 쓰나요]
//   무료 공개 사전 API(dictionaryapi.dev)도 있지만 자주 죽습니다(504/522).
//   수업이 외부 서비스의 컨디션에 좌우되지 않도록 미니 API 를 기본으로 씁니다.
//   외부 API 버전은 "선택 심화" 과제에서 다뤄봅니다.
const BASE_URL = '/api/words'

/**
 * API 응답을 우리 앱이 쓰는 단어 모양으로 "번역"합니다.
 *
 * 미니 API 의 응답은 이미 평평한(flat) 한 겹 객체입니다.
 *   { word, phonetic, partOfSpeech, meaning, example }
 *
 * "그럼 이 함수 왜 있어요?" — 좋은 질문입니다.
 *   ① 앱은 각 단어에 id 가 필요합니다 (목록의 key). 응답에는 없으니 여기서 만듭니다.
 *   ② 바깥 세상의 데이터 모양과 내 앱이 쓰는 모양 사이에 "번역 층"을 한 겹 두면,
 *      나중에 API 가 바뀌어도 이 함수 하나만 고치면 됩니다.
 *      실제로 외부 사전 API(dictionaryapi.dev)는 세 겹 중첩 배열을 돌려주는데,
 *      그걸 붙이는 선택 과제에서도 이 함수만 바뀌고 앱의 나머지는 그대로입니다.
 */
function toWord(json) {
  return {
    // 같은 단어를 나중에 또 추가해도 목록 key 가 겹치지 않게 시각을 붙입니다.
    id: `${json.word}-${Date.now()}`,
    word: json.word,
    // ?? 는 "왼쪽이 null 이나 undefined 면 오른쪽을 써라" 입니다.
    // (|| 와 달리 0 이나 빈 문자열은 "있는 값"으로 봅니다)
    phonetic: json.phonetic ?? '',
    partOfSpeech: json.partOfSpeech,
    meaning: json.meaning,
    example: json.example ?? '',
  }
}

/**
 * @param {string} word 검색할 단어. 빈 문자열이면 아무 요청도 보내지 않습니다.
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useWordSearch(word) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 아직 아무것도 검색하지 않은 상태입니다.
    // 상태를 깨끗이 비우고 요청은 보내지 않습니다.
    if (word === '') {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    // ------------------------------------------------------------------
    // ★ 경쟁 상태(race condition) 방지 — 오늘 가장 중요한 부분입니다
    // ------------------------------------------------------------------
    // [무슨 일이 일어나나]
    //   t=0     'apple'  검색 → 요청 A 출발 (느림, 3초)
    //   t=0.5   'banana' 검색 → 요청 B 출발 (빠름, 0.3초)
    //   t=0.8   B 도착 → setData(banana)  → 화면: banana  ✅
    //   t=3.0   A 도착 → setData(apple)   → 화면: apple   ❌
    //
    //   아무도 아무것도 안 눌렀는데 화면이 혼자 옛날 결과로 바뀝니다.
    //   화면은 "마지막에 도착한 것"을 그리는데
    //   우리가 원하는 건 "마지막에 요청한 것"이기 때문입니다.
    //
    //   ⚠️ "먼저 보낸 요청이 먼저 도착한다"는 것은 어디에도 보장돼 있지 않습니다.
    //      캐시, 서버 부하, 네트워크 상태에 따라 순서는 언제든 뒤바뀝니다.
    //
    // [해결 두 가지를 같이 씁니다]
    //   ① ignore 플래그 — 결과를 "버린다"
    //      effect 가 실행될 때마다 ignore 변수가 새로 만들어집니다.
    //      요청 A 의 ignore 와 요청 B 의 ignore 는 서로 다른 변수입니다(클로저).
    //      React 는 다음 effect 를 실행하기 직전에 이전 effect 의 cleanup 을
    //      먼저 호출합니다. 그때 A 의 ignore 만 true 가 됩니다.
    //      → 요청은 그대로 가지만 화면은 건드리지 않습니다.
    //
    //   ② AbortController — 요청 자체를 "끊는다"
    //      signal 을 fetch 에 넘겨두면 controller.abort() 로 취소됩니다.
    //      Network 탭에 (canceled) 로 표시되고, 서버 부하도 줄어듭니다.
    //
    //   ①만으로도 대부분 충분합니다. 요청이 비싸면 ②를 얹습니다.
    // ------------------------------------------------------------------
    let ignore = false
    const controller = new AbortController()

    // 새 요청을 시작할 때 이전 결과와 이전 에러를 반드시 비웁니다.
    // 안 비우면 "이전 에러 문구 아래에 새 결과"가 같이 뜹니다.
    setLoading(true)
    setError(null)
    setData(null)

    // useEffect 의 콜백은 cleanup 함수를 돌려줘야 합니다.
    // async 함수는 Promise 를 돌려주므로 콜백 자체를 async 로 만들 수 없습니다.
    // 그래서 안에 async 함수를 만들고 부르는 형태로 씁니다.
    async function run() {
      try {
        const res = await fetch(`${BASE_URL}/${encodeURIComponent(word)}`, {
          signal: controller.signal,
        })

        // ★★★ fetch 는 404 를 예외로 던지지 않습니다 ★★★
        //   fetch 는 "답장이 왔다"는 사실 자체를 성공으로 칩니다.
        //   404 도 성공, 500 도 성공입니다.
        //   fetch 가 진짜로 예외를 던지는 경우는 이런 것들뿐입니다.
        //     - 인터넷이 끊겼다
        //     - 존재하지 않는 도메인이다
        //     - CORS 로 브라우저가 막았다
        //     - 요청이 취소되었다 (AbortError)
        //
        //   그래서 try/catch 만 써놓고 "에러 처리 했다"고 생각하면 안 됩니다.
        //   res.ok / res.status 를 우리가 직접 봐야 합니다.
        if (res.status === 404) {
          // 없는 단어일 때 서버는 단어 객체가 아니라 이런 것을 돌려줍니다.
          //   { error: 'Word not found', word, hint }
          // 그대로 toWord 에 넣으면 meaning 이 undefined 인 카드가 생깁니다.
          // 여기서 미리 끊어줍니다.
          throw new Error(
            `'${word}' 은(는) 단어장 사전에 없습니다. 다른 단어를 검색해 보세요.`
          )
        }

        if (!res.ok) {
          // 미니 API 서버가 꺼져 있으면 프록시가 500 을 돌려줍니다.
          // 이 분기가 있어서 앱이 하얗게 죽지 않고 안내 문구를 보여줍니다.
          throw new Error(
            `API 서버가 응답하지 않습니다. (${res.status}) 미니 API 서버가 켜져 있는지 확인하세요.`
          )
        }

        const json = await res.json()
        const found = toWord(json)

        // 이 응답이 아직 유효한가? 낡았으면 화면을 건드리지 않습니다.
        if (ignore) return
        setData(found)
        setLoading(false)
      } catch (err) {
        // 내가 취소한 것은 "에러"가 아닙니다. 조용히 빠져나갑니다.
        if (ignore || err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      }
      // ⚠️ 여기에 finally { setLoading(false) } 를 쓰면 안 됩니다.
      //   취소된 옛 요청의 finally 도 실행되면서
      //   "아직 로딩 중인데 로딩 표시가 꺼진 화면"이 됩니다.
      //   → 취소된 요청은 화면을 어떤 방식으로도 건드리면 안 됩니다.
    }

    run()

    // cleanup — 다음 effect 가 시작되기 직전, 그리고 컴포넌트가 사라질 때 호출됩니다.
    return () => {
      ignore = true
      controller.abort()
    }
  }, [word])
  // ▲ 의존성 배열은 "얼마나 자주 실행할까"를 정하는 옵션이 아닙니다.
  //   "이 effect 안에서 쓰는 바깥 값들의 목록"입니다.
  //   word 가 지난번과 다르면 이전 요청은 낡은 것이므로 다시 하는 것뿐입니다.
  //   여기를 [] 로 두면 검색어를 바꿔도 화면이 안 바뀝니다. (직접 해보세요)

  return { data, loading, error }
}
