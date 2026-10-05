# 미니 API 서버 Dockerfile
# ---------------------------------------------------------------
# 이 서버는 외부 의존성이 0개입니다 (Node 내장 http 모듈만 사용).
# 그래서 npm install 단계도, package.json 복사 단계도 없습니다.
# Dockerfile 이 이렇게까지 단순해질 수 있다는 걸 보여주는 예시이기도 합니다.

# 1) 베이스 이미지: Node 20 + Alpine Linux (가벼운 배포판)
#    node:20 (약 1GB) 대신 node:20-alpine (약 130MB) 을 씁니다.
FROM node:20-alpine

# 2) 컨테이너 안에서 작업할 디렉터리. 없으면 자동으로 만들어집니다.
WORKDIR /app

# 3) 서버 코드 한 파일만 복사
COPY server.js ./

# 4) 이 컨테이너가 3001 포트를 쓴다는 "문서화".
#    EXPOSE 자체가 포트를 열어주지는 않습니다.
#    실제로 밖에서 접속하려면 docker run -p 3001:3001 처럼 매핑해야 합니다.
EXPOSE 3001

# 5) node:20-alpine 이미지에는 root 가 아닌 node 유저가 이미 들어 있습니다.
#    컨테이너를 root 로 돌리지 않는 것이 기본 보안 수칙입니다.
USER node

# 6) 컨테이너가 시작될 때 실행할 명령
#    쉘 형태("node server.js")가 아니라 배열(exec) 형태로 쓰면
#    node 가 PID 1 이 되어 docker stop 의 SIGTERM 을 직접 받습니다.
CMD ["node", "server.js"]
