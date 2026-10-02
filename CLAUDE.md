# Color Math — 작업 지침

Primary 컬러 하나로 팔레트를 만드는 웹 도구. 오너(프로덕트 디자이너)의 개인 프로젝트다.

## 정본
- 설계: `docs/superpowers/specs/2026-10-02-color-math-web-design.md`
- 보류·개선 후보: `docs/BACKLOG.md`
- 생성 공식의 근거: 오너의 노션 「Color 관계」의 「08 · 생성기」. `src/color/generate.ts`의 상수를 바꾸면 설계 문서와 노션도 함께 맞춘다.

## 규칙
- 생성 공식은 노션 08 그대로가 기준이다. 개선은 BACKLOG에 적고 오너 결정 후에 바꾼다.
- 연쇄 수정(칩 하나를 고치면 같은 계열 다른 칸도 바뀌는 것)은 보류 중이다. 만들지 않는다.
- 화면 디자인은 `DESIGN.md`(opencode 스타일)를 따른다. 고정폭 글꼴, 크림 바탕·잉크 글자, 그림자 없음, 누르는 요소만 4px 모서리, ASCII 괄호 표시. 이 저장소에 맞춘 차이는 DESIGN.md 끝의 "Color Math adaptation"에 적는다.
- 테스트 먼저(Vitest). `npm test`와 `npm run build`가 통과해야 끝난 것이다. 화면 변경은 브라우저에서도 확인한다.
- 커밋 작성자는 이 저장소 로컬 설정(`opensmartyouth-art` + GitHub noreply 이메일)을 쓴다. 개인·회사 이메일을 넣지 않는다.

## 명령
- `npm run dev` / `npm test` / `npm run build`
- 배포: `GH_TOKEN=$(gh auth token --user opensmartyouth-art) npm run deploy` → `gh-pages` 브랜치 → GitHub Pages
- GitHub Actions는 쓰지 않는다(토큰에 workflow 권한이 없음).
