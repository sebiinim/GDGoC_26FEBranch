/**
 * 나만의 단어장 — 미니 API 서버
 * ------------------------------------------------------------------
 * 프론트엔드 스터디 2·3·4회차 실습용으로 제공되는 서버입니다.
 * 수강생은 이 파일을 수정할 필요가 없습니다. "실행만" 하면 됩니다.
 *
 * [2회차에서의 역할]
 *   단어 검색 실습의 기본 데이터 소스입니다.
 *   외부 무료 사전 API(dictionaryapi.dev)는 자주 죽어서(504/522/타임아웃)
 *   수업의 주 경로로 쓰기엔 위험합니다. 이 서버가 그 자리를 대신합니다.
 *   Vite 개발 서버의 proxy 설정(vite.config.js)을 통해 /api 로 호출합니다.
 *   → "개발 중에는 Vite가 프록시를 해줬는데, 빌드하면 누가 해주지?"
 *     이 질문이 3회차 nginx 리버스 프록시의 복선이 됩니다.
 *
 * [의존성 0개]
 *   Node.js 내장 http 모듈만 사용합니다.
 *   package.json 도, npm install 도 필요 없습니다.
 *   `node server.js` 한 줄이면 바로 뜹니다. (Node 18 이상 권장)
 *
 * ★★★ 가장 중요한 설계 의도 — 이 서버는 "일부러" CORS 헤더를 보내지 않습니다 ★★★
 *
 *   아래 어디를 찾아봐도 Access-Control-Allow-Origin 헤더가 없습니다.
 *   빠뜨린 게 아니라 의도적으로 뺀 것입니다.
 *
 *   왜냐하면 3회차의 목표가 이것이기 때문입니다.
 *
 *     1단계) 브라우저에서 http://localhost:3001/api/words 를 직접 호출한다
 *            → 콘솔에 CORS 에러가 뜬다. "아, 이래서 CORS가 문제구나"를 몸으로 겪는다
 *     2단계) nginx 리버스 프록시 뒤에 이 서버를 둔다 (/api/ → mini-api:3001)
 *            → 브라우저 입장에서는 화면도 API도 전부 같은 출처(localhost:80)로 보인다
 *            → CORS 에러가 "사라진다". 서버 코드는 한 줄도 안 고쳤는데도.
 *
 *   즉 CORS는 "서버가 헤더를 붙여야만 풀리는 문제"가 아니라
 *   "배포 구조로도 풀 수 있는 문제"라는 걸 체험하는 것이 이 서버의 존재 이유입니다.
 *
 *   그러므로 실습 중에 이 파일에 CORS 헤더를 추가하지 마세요.
 *   추가하는 순간 3회차 실습이 통째로 무의미해집니다.
 */

const http = require('node:http');

const PORT = process.env.PORT || 3001;

/**
 * 단어 데이터 (실제 영단어)
 * DB 없이 메모리에 그냥 들고 있습니다. 서버를 재시작하면 초기 상태로 돌아갑니다.
 */
const WORDS = [
  // ── 사전 과제 · 1회차에서 만난 단어들 ─────────────────────────
  { word: 'serendipity', phonetic: '/ˌser.ənˈdɪp.ə.ti/', partOfSpeech: '명사',
    meaning: '뜻밖의 행운을 우연히 발견하는 것',
    example: 'Finding that little bookshop was pure serendipity.' },
  { word: 'resilience', phonetic: '/rɪˈzɪl.i.əns/', partOfSpeech: '명사',
    meaning: '회복력, 다시 일어서는 힘',
    example: 'Her resilience helped her recover from the injury.' },
  { word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', partOfSpeech: '형용사',
    meaning: '어디에나 있는, 아주 흔한',
    example: 'Smartphones are ubiquitous in modern life.' },
  { word: 'meticulous', phonetic: '/məˈtɪk.jə.ləs/', partOfSpeech: '형용사',
    meaning: '꼼꼼한, 세심한',
    example: 'She kept meticulous notes during every meeting.' },
  { word: 'eloquent', phonetic: '/ˈel.ə.kwənt/', partOfSpeech: '형용사',
    meaning: '유창한, 설득력 있는',
    example: 'He gave an eloquent speech at the ceremony.' },
  { word: 'nostalgia', phonetic: '/nɑːˈstæl.dʒə/', partOfSpeech: '명사',
    meaning: '향수, 지난날에 대한 그리움',
    example: 'The old song filled her with nostalgia.' },

  // ── 2회차 검색 실습용 일반 단어 ──────────────────────────────
  { word: 'hello', phonetic: '/həˈloʊ/', partOfSpeech: '감탄사',
    meaning: '안녕 (인사말)',
    example: 'Hello! Nice to meet you.' },
  { word: 'apple', phonetic: '/ˈæp.əl/', partOfSpeech: '명사',
    meaning: '사과',
    example: 'She ate an apple for breakfast.' },
  { word: 'study', phonetic: '/ˈstʌd.i/', partOfSpeech: '동사',
    meaning: '공부하다, 연구하다',
    example: 'We study React together every Wednesday.' },
  { word: 'journey', phonetic: '/ˈdʒɝː.ni/', partOfSpeech: '명사',
    meaning: '여행, 여정',
    example: 'Learning to code is a long journey, not a race.' },
  { word: 'curious', phonetic: '/ˈkjʊr.i.əs/', partOfSpeech: '형용사',
    meaning: '호기심 많은, 궁금한',
    example: 'A curious mind is the best tool for a developer.' },
  { word: 'effort', phonetic: '/ˈef.ɚt/', partOfSpeech: '명사',
    meaning: '노력, 수고',
    example: 'Small daily effort beats occasional bursts of work.' },
  { word: 'habit', phonetic: '/ˈhæb.ɪt/', partOfSpeech: '명사',
    meaning: '습관',
    example: 'Reading error messages carefully is a good habit.' },
  { word: 'practice', phonetic: '/ˈpræk.tɪs/', partOfSpeech: '명사',
    meaning: '연습, 실천',
    example: 'Practice is the only way to get comfortable with code.' },
  { word: 'patient', phonetic: '/ˈpeɪ.ʃənt/', partOfSpeech: '형용사',
    meaning: '인내심 있는, 참을성 있는',
    example: 'Be patient with yourself when learning something new.' },
  { word: 'mistake', phonetic: '/məˈsteɪk/', partOfSpeech: '명사',
    meaning: '실수',
    example: 'Every mistake teaches you something new.' },
  { word: 'improve', phonetic: '/ɪmˈpruːv/', partOfSpeech: '동사',
    meaning: '개선하다, 나아지다',
    example: 'Your code will improve a little every single week.' },
  { word: 'focus', phonetic: '/ˈfoʊ.kəs/', partOfSpeech: '동사',
    meaning: '집중하다',
    example: 'Focus on one error at a time.' },
  { word: 'simple', phonetic: '/ˈsɪm.pəl/', partOfSpeech: '형용사',
    meaning: '단순한, 간단한',
    example: 'A simple solution is usually the best one.' },
  { word: 'question', phonetic: '/ˈkwes.tʃən/', partOfSpeech: '명사',
    meaning: '질문',
    example: 'There is no such thing as a stupid question.' },
  { word: 'answer', phonetic: '/ˈæn.sɚ/', partOfSpeech: '명사',
    meaning: '대답, 해답',
    example: 'The error message often contains the answer.' },
  { word: 'window', phonetic: '/ˈwɪn.doʊ/', partOfSpeech: '명사',
    meaning: '창문 / (컴퓨터) 창',
    example: 'Open a new window and check the console.' },
  { word: 'bridge', phonetic: '/brɪdʒ/', partOfSpeech: '명사',
    meaning: '다리, 연결',
    example: 'An API is a bridge between the screen and the data.' },
  { word: 'garden', phonetic: '/ˈɡɑːr.dən/', partOfSpeech: '명사',
    meaning: '정원',
    example: 'A codebase is like a garden — it needs regular care.' },
  { word: 'ocean', phonetic: '/ˈoʊ.ʃən/', partOfSpeech: '명사',
    meaning: '바다, 대양',
    example: 'The internet is an ocean of information.' },
  { word: 'memory', phonetic: '/ˈmem.ɚ.i/', partOfSpeech: '명사',
    meaning: '기억, 기억력 / (컴퓨터) 메모리',
    example: 'The data lives in memory until you refresh the page.' },
  { word: 'pattern', phonetic: '/ˈpæt.ɚn/', partOfSpeech: '명사',
    meaning: '무늬, 패턴, 반복되는 형태',
    example: 'You will see the same pattern in every React project.' },

  // ── 3·4회차 배포 도메인 단어 (기존) ──────────────────────────
  { word: 'build', phonetic: '/bɪld/', partOfSpeech: '동사',
    meaning: '짓다, 만들다 / (소스코드를) 배포 가능한 결과물로 변환하다',
    example: 'We build the app before deploying it to the server.' },
  { word: 'deploy', phonetic: '/dɪˈplɔɪ/', partOfSpeech: '동사',
    meaning: '배치하다, 배포하다',
    example: 'They deploy the new version every Friday afternoon.' },
  { word: 'container', phonetic: '/kənˈteɪ.nɚ/', partOfSpeech: '명사',
    meaning: '그릇, 용기 / 격리된 실행 환경',
    example: 'Each container runs in its own isolated environment.' },
  { word: 'proxy', phonetic: '/ˈprɑːk.si/', partOfSpeech: '명사',
    meaning: '대리인, 대리 / 요청을 대신 전달해 주는 중개 서버',
    example: 'The proxy forwards every request to the internal API server.' },
  { word: 'origin', phonetic: '/ˈɔːr.ə.dʒɪn/', partOfSpeech: '명사',
    meaning: '기원, 출처 / (웹) 프로토콜·호스트·포트의 조합',
    example: 'The browser blocks the request because it comes from a different origin.' },
  { word: 'render', phonetic: '/ˈren.dɚ/', partOfSpeech: '동사',
    meaning: '표현하다, 그려내다',
    example: 'The browser needs a few milliseconds to render the whole page.' },
  { word: 'stale', phonetic: '/steɪl/', partOfSpeech: '형용사',
    meaning: '신선하지 않은, 오래된',
    example: 'Users kept seeing a stale version of the page because of the cache.' },
  { word: 'fallback', phonetic: '/ˈfɔːl.bæk/', partOfSpeech: '명사',
    meaning: '대비책, 차선책',
    example: 'If the route does not match a file, index.html is used as a fallback.' },
];

/**
 * 인위적 지연 (200~400ms)
 * ------------------------------------------------------------------
 * 로컬 서버는 응답이 1ms 만에 돌아옵니다. 너무 빨라서
 * 2회차에서 만든 "로딩 중..." 화면이 화면에 뜨기도 전에 사라집니다.
 * 그러면 로딩 상태를 만들어놓고도 눈으로 확인할 수가 없습니다.
 *
 * 그래서 실제 네트워크처럼 보이도록 200~400ms 사이의 임의 지연을 넣습니다.
 * (실서비스에서는 절대 이런 코드를 넣지 않습니다. 어디까지나 학습용입니다.)
 *
 * ★ 경쟁 상태 재현 모드 (2회차 심화 실습용)
 * ------------------------------------------------------------------
 *   RACE=1 node server.js   로 켜면:
 *     - 5글자 이하 단어 검색  → 3초    (예: apple)
 *     - 6글자 이상 단어 검색  → 0.3초  (예: banana)
 *   apple 검색 직후 banana 를 검색하면 응답 도착 순서가 뒤바뀌어
 *   "화면이 혼자 옛날 결과로 바뀌는" 경쟁 상태가 안정적으로 재현됩니다.
 *   실습이 끝나면 Ctrl+C 후 RACE 없이 다시 켜세요.
 */
const RACE_MODE = process.env.RACE === '1';

function randomDelay(word) {
  if (RACE_MODE && word) {
    const ms = word.length <= 5 ? 3000 : 300;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const ms = 200 + Math.floor(Math.random() * 201); // 200 ~ 400
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * JSON 응답 헬퍼
 *
 * ★ 여기가 CORS 헤더를 붙일 법한 자리입니다. 하지만 붙이지 않습니다.
 *   Content-Type 딱 하나만 내려보냅니다. (위 상단 주석 참고 — 의도적입니다)
 */
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * 요청 로그를 한 줄씩 출력합니다.
 * ------------------------------------------------------------------
 * 이 로그가 3회차의 핵심 관찰 도구입니다.
 * 브라우저 주소창은 계속 localhost:80 인데도, 이 터미널에 로그가 찍힌다면
 * = nginx가 요청을 이 서버까지 대신 전달해 줬다는 증거입니다.
 * 프록시가 "동작하고 있다"를 눈으로 확인하세요.
 */
function log(req, statusCode, elapsedMs) {
  const time = new Date().toISOString().slice(11, 19); // HH:MM:SS
  console.log(
    `[${time}] ${req.method} ${req.url} -> ${statusCode} (${elapsedMs}ms)`
  );
}

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now();

  // URL 파싱. 두 번째 인자는 상대경로를 절대 URL로 만들기 위한 더미 base 입니다.
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  // 실습에서는 GET 만 사용합니다.
  // HEAD 는 "본문 없는 GET" 이라서 함께 허용합니다.
  // (curl -I 나 헬스체크 도구가 HEAD 를 보냅니다.
  //  Node 가 HEAD 응답에서는 본문을 알아서 빼줍니다)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    await randomDelay();
    sendJson(res, 405, { error: 'Method Not Allowed', method: req.method });
    log(req, 405, Date.now() - startedAt);
    return;
  }

  // GET /api/health — 서버가 살아있는지 확인용
  if (pathname === '/api/health') {
    // health 체크는 지연 없이 즉시 응답합니다.
    // (docker compose 의 헬스체크가 느려지면 곤란하기 때문입니다)
    sendJson(res, 200, { status: 'ok' });
    log(req, 200, Date.now() - startedAt);
    return;
  }

  // GET /api/words — 단어 목록 전체
  if (pathname === '/api/words') {
    await randomDelay();
    sendJson(res, 200, WORDS);
    log(req, 200, Date.now() - startedAt);
    return;
  }

  // GET /api/words/:word — 단어 하나
  if (pathname.startsWith('/api/words/')) {
    const target = pathname.slice('/api/words/'.length).toLowerCase();
    const found = WORDS.find((w) => w.word.toLowerCase() === target);

    await randomDelay(target);

    if (!found) {
      // 없는 단어는 404 + JSON 본문. (HTML 에러 페이지가 아니라 JSON 입니다)
      sendJson(res, 404, {
        error: 'Word not found',
        word: target,
        hint: 'GET /api/words 로 사용 가능한 단어 목록을 확인하세요.',
      });
      log(req, 404, Date.now() - startedAt);
      return;
    }

    sendJson(res, 200, found);
    log(req, 200, Date.now() - startedAt);
    return;
  }

  // 그 밖의 모든 경로
  await randomDelay();
  sendJson(res, 404, {
    error: 'Not Found',
    path: pathname,
    availableEndpoints: ['/api/words', '/api/words/:word', '/api/health'],
  });
  log(req, 404, Date.now() - startedAt);
});

// 0.0.0.0 으로 바인딩합니다.
// 127.0.0.1 로 바인딩하면 컨테이너 안에서만 접근 가능해져서
// docker run -p 로 포트를 열어도 밖에서 접속이 안 됩니다. (흔한 함정)
server.listen(PORT, '0.0.0.0', () => {
  console.log('─'.repeat(60));
  console.log(`  미니 API 서버가 떴습니다: http://localhost:${PORT}`);
  console.log('─'.repeat(60));
  console.log('  GET /api/words        단어 목록');
  console.log('  GET /api/words/:word  단어 하나 (없으면 404)');
  console.log('  GET /api/health       상태 확인');
  if (RACE_MODE) {
    console.log('');
    console.log('  🏁 RACE 모드 ON — 5글자 이하 단어는 3초, 6글자 이상은 0.3초');
    console.log('     (경쟁 상태 재현용. 평소에는 RACE 없이 실행하세요)');
  }
  console.log('');
  console.log('  ※ 이 서버는 의도적으로 CORS 헤더를 보내지 않습니다.');
  console.log('    브라우저에서 직접 호출하면 CORS 에러가 납니다. 정상입니다.');
  console.log('    nginx 리버스 프록시 뒤에 두면 에러가 사라집니다.');
  console.log('─'.repeat(60));
});

// Ctrl+C / docker stop 을 받았을 때 깔끔하게 종료합니다.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n${signal} 수신 — 서버를 종료합니다.`);
    server.close(() => process.exit(0));
  });
}
