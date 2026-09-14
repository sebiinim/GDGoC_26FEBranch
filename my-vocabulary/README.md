week 1 React 시작하기 Review

1. React는 재사용이 용이한 component를 사용한다. 현 과제에도 카드가 매우 많아질 경우 직접 article을 복사 붙여넣기 하는 방식은 한계가 있을 것이다. 

2. React를 사용하기 위한 언어인 JSX는 HTML이 아니라 JS이다. 약간의 차이로는 JS 예약어인 class대신 className을 사용한다. 

3. props를 이용해 컴포넌트 밖에서 컴포넌트에 값을 넣을 수 있다. 프로그래밍의 함수와 비슷하다. 이 값은 컴포넌트 안에서는 바꿀 수 없다. 

4. 화면을 바꾸기 위해 useState를 사용한다. useState변수는 직접 값을 대입해 바꿀 수 없고 set함수로만 바꿀 수 있다. 반드시 이벤트에 () => setRevealed(true)같은 함수를 넘기자. 아니면 too many re-renders 오류가 생긴다. 예전부터 가장 궁금했던 게 useState인데 생각보다 정말 간단했고 편리한 녀석이었다. 

5. filter를 사용해 새 배열을 만들어야 화면에 반영된다. 

6. React는 virtual DOM을 이용해 렌더링 비용을 낮춘다. CSR(Client Side Rendering)을 이용해 더 빠르게 렌더링한다.