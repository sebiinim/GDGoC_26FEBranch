Web Server의 역할

1. FE의 요청을 WAS 앞단에서 받아 BE와 유사한 Web Application Server가 모든 일을 handling하지 않아도 되도록 정적 파일 제공 같은 요청을 직접 처리한다. 

2. Reverse Proxy 기능을 수행해 현재 애플리케이션의 포트 번호를 숨긴다. 보안상 이점을 제공한다. 




# week3-start — 3회차 시작 코드

**"나만의 단어장" 스터디 3회차(빌드와 웹서버)의 시작점입니다.**

이 폴더는 **2회차(데이터와 상태)를 끝까지 따라왔을 때의 완성 상태**입니다.
2회차를 못 따라오셨거나 결석하셨어도, 이 코드로 시작하면 3회차를 그대로 함께 진행할 수 있습니다.

> 2회차를 직접 완성하신 분은 **본인 코드를 그대로 쓰셔도 됩니다.**
> 이 폴더는 "진도를 놓쳤을 때의 안전망"입니다.

---

## 1. 실행 방법

**터미널을 두 개** 씁니다 — 하나는 API 서버, 하나는 앱.

```bash
# 터미널 1 — 미니 API 서버 (검색 데이터의 출처)
node ../실습코드/mini-api/server.js

# 터미널 2 — 앱
cd week3-start
npm install
npm run dev
```

터미널에 뜨는 주소(보통 `http://localhost:5173`)를 브라우저로 엽니다.
검색이 동작하려면 **터미널 1의 미니 API 서버가 켜져 있어야** 합니다.
(앱은 상대경로 `/api` 로 부르고, `vite.config.js` 의 proxy 가 3001 포트로 전달합니다)

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버를 띄웁니다. 코드를 고치면 즉시 반영됩니다 |
| `npm run build` | `dist/` 폴더에 배포용 파일을 굽습니다 (3회차에 직접 합니다) |
| `npm run preview` | 구워진 `dist/` 를 웹서버로 띄워서 확인합니다 |

**인터넷 연결이 없어도 됩니다.** 검색 데이터는 함께 제공되는 미니 API 서버(로컬)에서 옵니다.

---

## 2. 지금 이 코드로 할 수 있는 것

브라우저를 열고 아래를 순서대로 해보세요. 전부 동작해야 정상입니다.

1. 검색창에 `serendipity` 를 치고 엔터 → 잠깐 "🔍 찾는 중…" 이 보였다가 뜻이 나온다
2. 없는 단어(`notaword123`)를 치면 → "사전에서 찾을 수 없습니다" 안내가 나온다
3. 검색 결과의 **"내 단어장에 추가"** 를 누르면 → 카드가 목록 맨 앞에 생긴다
4. **새로고침(`Cmd+R` / `Ctrl+R`) 해도 내가 추가한 단어가 그대로 남아 있다**
5. 카드의 "뜻 보기 / 뜻 숨기기" 가 카드마다 따로 동작한다
6. 개발자도구 → Application 탭 → Local Storage 에 `my-vocabulary` 키가 보인다

---

## 3. 이미 구현되어 있는 것 (2회차에서 배운 것 전부)

| 파일 | 무엇이 들어 있나 |
| --- | --- |
| `src/App.jsx` | 검색 → 결과 → 내 단어장에 추가 → 목록 표시 전체 흐름, localStorage 저장/복원 |
| `src/hooks/useWordSearch.js` | 사전 API 호출, `loading`/`error`/`data` 3-state, **경쟁 상태 방지** |
| `src/components/SearchBar.jsx` | 검색어 입력 + 제출 (`preventDefault`) |
| `src/components/StatusMessage.jsx` | 로딩 / 에러 / 빈 상태 화면 (early return 패턴) |
| `src/components/WordCard.jsx` | props 로 단어를 받고, `useState` 로 뜻 보이기/숨기기 |
| `src/components/WordList.jsx` | `map` + `key` 로 목록 그리기 |
| `src/data/words.js` | 저장된 단어장이 없을 때 쓰는 기본 단어 3개 |

### 특히 눈여겨볼 곳 세 군데

**① `useWordSearch.js` 의 `res.ok` 검사**

`fetch` 는 404를 **예외로 던지지 않습니다.** "답장이 왔다"는 사실 자체를 성공으로 칩니다.
그래서 `try/catch` 만 써놓고 에러 처리를 했다고 생각하면 안 되고,
`res.status` / `res.ok` 를 직접 봐야 합니다. 코드에 주석으로 설명해 두었습니다.

**② `useWordSearch.js` 의 `ignore` + `AbortController`**

`apple` 을 검색하고 기다리지 않고 바로 `banana` 를 검색하면,
느린 `apple` 응답이 나중에 도착해서 화면을 덮어쓸 수 있습니다. (경쟁 상태)
이 훅은 cleanup 에서 `ignore = true` 로 낡은 응답을 버리고,
`controller.abort()` 로 요청 자체를 취소합니다. 왜 그래야 하는지는 파일 주석에 있습니다.

**③ `App.jsx` 의 `useState(loadWords)` — 괄호가 없습니다**

localStorage 복원은 `useEffect` 가 아니라 **`useState` 초기값**으로 합니다.
`useEffect` 는 항상 렌더가 끝난 뒤에 실행되므로 복원에 쓰면
화면이 깜빡이고, 저장소가 잠깐 기본값으로 덮어써지는 순간이 생깁니다.

---

## 4. 사용하는 API — 미니 API 서버 (로컬)

```
GET /api/words          단어 목록 전체
GET /api/words/{단어}    단어 하나 (없으면 404 + JSON)
```

- `materials/실습코드/mini-api/server.js` — **의존성 0개**, `node server.js` 로 바로 뜹니다
- 없는 단어는 **404** 와 `{ error, word, hint }` 객체를 돌려줍니다
- 서버가 꺼져 있으면 프록시가 500 을 돌려줍니다 — 그래서 에러 화면을 만들어 둔 것이고,
  앱은 하얗게 죽지 않고 안내 문구를 보여줍니다
- 어떤 단어가 있는지 궁금하면 브라우저에서 `http://localhost:5173/api/words` 를 열어보세요

> **선택 심화 — 진짜 인터넷 사전 붙여보기.**
> 무료 공개 사전 API `https://api.dictionaryapi.dev/api/v2/entries/en/{단어}` 를
> 대신 붙여볼 수 있습니다 (회원가입·키 불필요, 응답은 세 겹 중첩 배열).
> `useWordSearch.js` 의 `BASE_URL` 과 `toWord()` 만 고치면 됩니다 —
> "번역 층을 한 겹 두면 API 교체가 쉬워진다"를 몸으로 확인하는 과제입니다.
> 단, 이 API 는 자주 죽습니다(504/522). 수업 기본 경로로 쓰지 않는 이유입니다.

---

## 5. 3회차에 여기서부터 무엇을 하나요

이 코드를 가지고 **앱 로직은 거의 건드리지 않고** 아래를 합니다.

1. `npm run build` 로 `dist/` 를 만들고, 그 안에 뭐가 들었는지 직접 열어봅니다
2. `.env` 에 넣은 값이 `dist/` 안에 **텍스트로 박혀 있는 것**을 `grep` 으로 찾아냅니다
3. nginx 위에 `dist/` 를 올려 `http://localhost:8080` 으로 접속합니다
4. 미니 API 를 붙여 **CORS 에러를 만들고**, 리버스 프록시로 **코드 수정 없이** 없앱니다

> 📌 **3회차 예고 하나.** 지금 여러분의 단어장은 `localhost:5173` 의 저장소에 있습니다.
> 3회차에 앱을 `localhost:8080` 에 올리면 **단어장이 비어 있는 것처럼 보입니다.**
> 데이터가 사라진 게 아니라, **다른 서랍을 보고 있는 것**입니다.
> localStorage 는 오리진(프로토콜 + 호스트 + 포트)별로 따로 있기 때문입니다.

---

## 6. 자주 나는 문제

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `npm run dev` 가 안 됨 | `npm install` 을 안 했음 | `npm install` 먼저 |
| 화면이 하얗다 | 콘솔에 에러가 있음 | F12 → Console 탭의 **첫 번째** 에러부터 읽기 |
| 검색이 계속 실패한다 | 인터넷 / 사내망에서 외부 API 차단 | Network 탭을 먼저 열어 확인. 핫스팟으로 전환 |
| 개발 모드에서 요청이 두 번 간다 | `<StrictMode>` 의 의도된 동작 | 정상입니다. `main.jsx` 주석 참고 |
| 단어장이 이상하게 꼬였다 | localStorage 내용이 깨짐 | 콘솔에서 `localStorage.clear()` 후 새로고침 |
| 5173 포트가 이미 쓰이는 중 | 다른 Vite 가 떠 있음 | 기존 터미널에서 `Ctrl+C`, 또는 Vite 가 알려주는 다른 포트 사용 |
