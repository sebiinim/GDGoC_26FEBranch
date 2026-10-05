# 미니 API 서버 (mini-api)

"나만의 단어장" 실습에서 사용하는 아주 작은 백엔드입니다.
**수강생은 이 코드를 작성하지 않습니다. 실행만 하면 됩니다.**

- 의존성 **0개** — Node.js 내장 `http` 모듈만 사용합니다
- `npm install` 이 필요 없습니다. `package.json` 도 없습니다
- Node.js 18 이상이면 동작합니다

---

## 1. 실행 방법

세 가지 방법이 있습니다. **2회차에는 (A)**, **3회차에는 (A) 또는 (B)**, **4회차에는 (C)** 를 씁니다.
2회차에는 Docker 가 필요 없습니다 — (A) 한 줄이면 됩니다.

### (A) node 로 직접 실행 — 가장 빠름

```bash
cd mini-api
node server.js
```

포트를 바꾸고 싶다면

```bash
PORT=4000 node server.js
```

터미널에 아래처럼 뜨면 성공입니다.

```
────────────────────────────────────────────────────────────
  미니 API 서버가 떴습니다: http://localhost:3001
────────────────────────────────────────────────────────────
```

### (B) docker build + run

```bash
cd mini-api

# 이미지 빌드 (이름: mini-api, 태그: latest)
docker build -t mini-api .

# 컨테이너 실행 (호스트 3001 -> 컨테이너 3001)
docker run --rm -p 3001:3001 --name mini-api mini-api
```

- `--rm` : 컨테이너가 멈추면 자동으로 지웁니다 (실습 중 찌꺼기 방지)
- `--name mini-api` : 이름을 붙여두면 `docker logs mini-api` 로 로그를 볼 수 있습니다
- 종료는 터미널에서 `Ctrl + C`

백그라운드로 띄우고 싶다면 `-d` 를 붙입니다.

```bash
docker run -d --rm -p 3001:3001 --name mini-api mini-api
docker logs -f mini-api   # 로그 실시간으로 보기
docker stop mini-api      # 종료
```

### (C) docker compose — 4회차

저장소의 `docker/docker-compose.yml` 이 이 서버를 함께 띄웁니다.

```bash
cd docker
docker compose up --build
```

여기서는 **mini-api 의 포트가 바깥으로 열리지 않습니다.**
`http://localhost:3001` 로는 접속이 안 되고, 오직 nginx 를 통한
`http://localhost/api/...` 로만 접근됩니다. 이게 4회차의 교육 포인트입니다.

---

## 2. 엔드포인트

| 메서드 | 경로 | 설명 | 응답 |
| --- | --- | --- | --- |
| GET | `/api/words` | 단어 목록 전체 | `200` 단어 객체 배열 (35개) |
| GET | `/api/words/:word` | 단어 하나 조회 (대소문자 무시) | `200` 단어 객체 / `404` 에러 JSON |
| GET | `/api/health` | 서버 상태 확인 | `200` `{"status":"ok"}` |
| 그 외 | 아무 경로 | 존재하지 않는 경로 | `404` 에러 JSON |
| GET/HEAD 이외 | 아무 경로 | POST/PUT 등은 지원 안 함 | `405` 에러 JSON |

### 단어 객체 모양

```json
{
  "word": "proxy",
  "phonetic": "/ˈprɑːk.si/",
  "partOfSpeech": "명사",
  "meaning": "대리인, 대리 / 요청을 대신 전달해 주는 중개 서버",
  "example": "The proxy forwards every request to the internal API server."
}
```

> `phonetic` 은 발음기호입니다. **없는 단어도 있습니다** — 빈 문자열로 옵니다.
> 그래서 화면에서는 있을 때만 그려야 합니다 (1회차에 배운 조건부 렌더링).

### 터미널에서 확인해 보기

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/words
curl http://localhost:3001/api/words/proxy
curl -i http://localhost:3001/api/words/banana   # 404 확인
```

> `curl` 은 잘 되는데 브라우저 JS 에서만 실패한다면? 그게 바로 CORS 입니다.
> 아래 3번을 읽어보세요.

---

## 3. 왜 CORS 헤더가 없나요?

**일부러 뺐습니다. 버그가 아닙니다.**

`server.js` 어디를 찾아봐도 `Access-Control-Allow-Origin` 헤더가 없습니다.
빠뜨린 게 아니라, 여러분이 CORS 에러를 **직접 만나보게 하려고** 뺀 것입니다.

### 무슨 일이 일어나나요

1. 앱은 `http://localhost:5173` (Vite 개발 서버) 또는 `http://localhost` (nginx) 에서 열립니다
2. 앱 안의 JS 가 `http://localhost:3001/api/words` 를 `fetch` 합니다
3. 포트가 다르므로 브라우저에게는 **다른 출처(origin)** 입니다
4. 브라우저는 응답에 `Access-Control-Allow-Origin` 이 있는지 확인합니다
5. 없습니다 → 브라우저가 **응답을 JS 에게 넘겨주지 않고 차단**합니다

콘솔에 이런 에러가 뜹니다.

```
Access to fetch at 'http://localhost:3001/api/words' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

### 여기서 꼭 알아야 할 것

- **서버는 정상적으로 200 응답을 보냈습니다.** 서버 터미널 로그를 보세요. 요청이 찍혀 있습니다
- 막은 것은 서버가 아니라 **브라우저**입니다
- 그래서 `curl` 로는 잘 됩니다. `curl` 은 브라우저가 아니니까요
- CORS 는 "서버 에러"가 아니라 **브라우저의 보안 정책**입니다

### 해결 방법은 두 가지입니다

| 방법 | 하는 일 | 이 스터디에서는 |
| --- | --- | --- |
| 서버가 CORS 헤더를 붙인다 | `Access-Control-Allow-Origin: *` 등을 응답에 추가 | ❌ 쓰지 않습니다 |
| **출처를 하나로 만든다 (리버스 프록시)** | nginx 가 `/api/` 요청을 API 서버로 대신 전달 | ✅ **3회차에 이걸 합니다** |

두 번째 방법을 쓰면 브라우저 입장에서는

- 화면: `http://localhost/`
- API : `http://localhost/api/words`

**둘 다 `http://localhost` 라는 같은 출처**입니다. 애초에 교차 출처가 아니니
CORS 검사 자체가 일어나지 않습니다. 그래서 에러가 "사라집니다".

> **서버 코드는 한 줄도 안 고쳤는데 문제가 해결됩니다.**
> 배포 구조를 바꿔서 문제를 없앤 것입니다. 이게 3회차에서 가져가야 할 감각입니다.
> 실무에서 프론트엔드 배포에 nginx 를 앞에 두는 이유 중 하나가 정확히 이것입니다.

### 실습 중 주의

실습 도중 이 서버에 CORS 헤더를 추가하지 마세요.
추가하는 순간 리버스 프록시 실습이 통째로 무의미해집니다.

---

## 4. 요청 로그를 꼭 보세요

서버는 받은 요청을 한 줄씩 출력합니다.

```
[19:42:07] GET /api/words -> 200 (312ms)
[19:42:11] GET /api/words/proxy -> 200 (287ms)
[19:42:15] GET /api/words/banana -> 404 (241ms)
```

nginx 프록시 실습에서 이 로그가 **증거** 역할을 합니다.
브라우저 주소창은 `http://localhost/api/words` 인데
이 터미널에 로그가 찍힌다면, nginx 가 요청을 여기까지 전달해 줬다는 뜻입니다.

로그가 안 찍힌다면 프록시 설정이 잘못된 것입니다. (경로, 포트, 서비스 이름 확인)

---

## 5. 응답이 왜 느린가요? (200~400ms)

일부러 넣은 지연입니다.

로컬 서버는 응답이 1ms 만에 돌아옵니다. 너무 빨라서 2회차에서 만든
`로딩 중...` 화면이 눈에 보이기도 전에 사라져 버립니다.
그러면 로딩 상태를 잘 만들었는지 확인할 방법이 없습니다.

그래서 실제 네트워크처럼 보이도록 200~400ms 임의 지연을 넣었습니다.
(`/api/health` 만 예외로 즉시 응답합니다. 헬스체크가 느려지면 곤란하니까요.)

실서비스 코드에는 절대 이런 걸 넣지 않습니다. 학습용 장치입니다.

---

## 6. 자주 나는 문제

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `EADDRINUSE: address already in use :::3001` | 3001 포트를 이미 다른 프로세스가 쓰는 중 | `lsof -i :3001` 로 찾아 종료하거나 `PORT=4000 node server.js` |
| 브라우저에서 CORS 에러 | 정상입니다 (의도된 동작) | 위 3번 참고 |
| 컨테이너는 떴는데 접속이 안 됨 | `-p 3001:3001` 을 빼먹음 | 포트 매핑 옵션 확인 |
| compose 로 띄웠는데 `localhost:3001` 접속 실패 | 정상입니다 (포트를 열지 않았습니다) | `http://localhost/api/words` 로 접속 |
| `node: command not found` | Node.js 미설치 | 1회차 설치 가이드 참고 |
