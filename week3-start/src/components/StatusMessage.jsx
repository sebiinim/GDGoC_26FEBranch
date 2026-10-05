// 로딩 / 에러 / 빈 상태를 보여주는 작은 컴포넌트입니다.
//
// [왜 따로 만들었나]
// 요청 하나에는 인생이 세 갈래 있습니다.
//
//   loading : 아직 모른다      → "찾는 중…"
//   error   : 실패로 끝났다    → 사람이 읽을 수 있는 안내
//   data    : 성공으로 끝났다  → 결과 화면 (이건 부모가 그립니다)
//
// 규칙 ① 셋 중 정확히 하나만 화면에 보여야 한다.
// 규칙 ② 새 요청을 시작할 때 error 와 data 를 반드시 비운다.
// 규칙 ③ 성공하든 실패하든 loading 은 반드시 꺼진다.
//        (여기를 빠뜨리면 "영원히 찾는 중" 화면이 됩니다 — 실무 1등 버그)
//
// [early return 패턴]
// if 로 하나씩 걸러내고 return 해버리면
// 삼항 연산자를 세 겹 중첩하는 것보다 훨씬 읽기 쉽고,
// "셋 중 하나만 보인다"는 규칙이 코드 구조로 강제됩니다.
export default function StatusMessage({
  loading,
  error,
  empty,
  loadingText = '찾는 중…',
  emptyText = '결과가 없습니다.',
}) {
  if (loading) {
    return <p className="status status-loading">🔍 {loadingText}</p>
  }

  if (error) {
    return <p className="status status-error">⚠️ {error}</p>
  }

  if (empty) {
    return <p className="status status-empty">{emptyText}</p>
  }

  // 보여줄 상태가 없으면 아무것도 그리지 않습니다.
  return null
}
