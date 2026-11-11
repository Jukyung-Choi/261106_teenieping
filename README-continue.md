# 다른 컴퓨터에서 이어가기

이 저장소를 clone하거나 기존 저장소에서 pull한 후, Codex에서 이 폴더를 프로젝트로 열면 됩니다.

## 현재 작업 화면

- `menu-variant.html`: 최신 작업 화면. 이후 수정은 이 화면과 `menu-variant.css`, `menu-variant.js`를 기준으로 합니다.
- `redesign.html`: 이전 디자인 비교용 화면.
- `index.html`: 원본 게임. 기존 파일을 유지합니다.
- `assets/`: 캐릭터 WebP, 정지 이미지, Figma 팝업 및 배경 리소스. 모두 함께 필요합니다.
- `policy-engine.js`: 게임 정책 계산.

추가 패키지 설치 없이 HTML을 브라우저에서 열 수 있습니다. 로컬 서버가 필요하면 이 폴더에서 `python3 -m http.server 8080`을 실행하고 `http://localhost:8080/menu-variant.html`로 접속하세요.

## 최신 반영 내용 (2026-11-11)

- 한번에 충전하기 팝업: Figma `1172:61590`. 새 리소스는 `assets/charge-popup-v2/`.
- 배경 선택: 가로 스크롤 속도, 관성 및 가장자리 탄성 적용.
- 캐릭터 30종, 도감 보유/미획득 표시, 눈 뜬/감은 정지 이미지 적용.
- 게임 정책: 기본 XP 30% + 충전 XP 70%, 터치당 최대 15 XP, 충전분마다 2시간 감소.
- 전체 충전은 하루 3회 무료, 4회부터 1젬.
- 캐릭터 끌기 제거, 충돌 반동, 겹침 허용량 10%, 소환 시 화면 중앙 등장.
- Figma에 맞춘 도감·랭킹·소울게이지·도움말·배경 선택 팝업 유지.

Figma: https://www.figma.com/design/I4Cc1bf1WuifNjNzQ2GVVJ?node-id=1172-61590&m=dev

## Codex에 전달할 요청

“README-continue.md를 읽고 menu-variant.html 작업을 이어가줘. 원본 index.html과 redesign.html은 유지하고 요청한 화면만 수정해줘. 기존 정책과 기능은 유지해줘.”

브라우저에 저장된 게임 진행 상태는 GitHub로 이전되지 않습니다. 새 컴퓨터에서는 별도 상태로 시작합니다.

## 공개 화면

- https://teenieping-game-designs-1111.jukyung-choi.chatgpt.site/menu-variant.html
- https://teenieping-game-designs-1111.jukyung-choi.chatgpt.site/redesign.html

GitHub 소스와 공개 사이트 배포는 별도입니다. 배포할 때 기존 사이트를 재사용하세요.
Sites project_id: `appgprj_6af43705fb988191801482d024e3cb25`

기존 README.md와 README-redesign.txt에는 이전 버전 설명이 포함되어 있습니다. 최신 작업 진입점은 이 문서를 기준으로 확인하세요.
