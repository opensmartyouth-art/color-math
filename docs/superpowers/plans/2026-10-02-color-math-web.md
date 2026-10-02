# Color Math 웹 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Primary HEX 하나로 8계열 × 10단계 라이트/다크 팔레트를 만들고, 칩을 고치고, DTCG JSON으로 내려받는 웹 앱.

**Architecture:** 순수 함수 세 개(`convert` → `generate` → `tokens`)가 계산을 맡고, React `App`이 상태를 한 곳에 들고 두 패널을 그린다. 서버 없음, 정적 배포.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, @testing-library/react, jsdom, react-colorful, gh-pages

**Spec:** `docs/superpowers/specs/2026-10-02-color-math-web-design.md`

**Execution:** Native(인라인) — 오너가 "그냥 진행"으로 단계별 확인 생략을 요청. 마지막에 새 리뷰어 한 번.

## Global Constraints

- 생성 공식은 스펙 4장 그대로. 상수를 바꾸지 않는다.
- 노션 예시 비교 허용 오차: 채널당 ±1/255.
- JSON은 DTCG, `$value`는 소문자 `#rrggbb`.
- 연쇄 수정·알파·옵션 노출은 만들지 않는다(백로그).
- 화면 문구는 한국어.
- 커밋 작성자 `opensmartyouth-art <313367727+opensmartyouth-art@users.noreply.github.com>`, 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. 무채색 입력(`#000000`, `#ffffff`, `#808080`): 색상각이 정의되지 않아도 모든 칸이 올바른 HEX여야 한다. → Task 2 테스트
2. 앵커가 양 끝(50 또는 900)일 때: 0으로 나누기 없이 사다리가 단조여야 한다. → Task 2 테스트
3. 대소문자·`#` 없음·3자리 HEX 입력: 같은 색으로 받아들여야 한다. → Task 1, 4 테스트
4. 고친 칩이 있는 상태에서 Primary를 바꾸면: 고친 값과 선택이 지워져야 한다. → Task 4 테스트
5. 피커 상태에서 모드 전환: 같은 칩의 다른 모드 값을 편집해야 하고, 원래 모드 값은 그대로여야 한다. → Task 4 테스트

---

### Task 1: 프로젝트 골격 + 색 변환 (`convert.ts`)

**Files:** Create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/color/convert.ts`, `src/color/convert.test.ts`

**Interfaces — Produces:**
- `parseHex(input: string): string | null` — `#rrggbb` 소문자 또는 null
- `hexToRgb(hex: string): [number, number, number]` — 0~255
- `hexToOklch(hex: string): { l: number; c: number; h: number }` — l 0~100
- `oklchToHex(l: number, c: number, h: number): string` — 색역 클리핑 후 HEX
- `hexToHsl(hex: string): { h: number; s: number; l: number }` — s·l 0~100
- `contrast(a: string, b: string): number`
- `wcagGrade(ratio: number): 'AAA' | 'AA' | 'AA-large' | 'fail'`

- [ ] 실패하는 테스트 작성: `parseHex('3182F6')`·`parseHex('#38f')` 정규화, 틀린 입력 null / `#3182f6` OKLCH(62.01, 0.1906, 258.2) ±0.01·±0.0005·±0.1 / HSL(215.3, 91.6, 57.8) ±0.1 / 대비 `#8b95a1` 3.04, `#6b7684` 4.62, `#4e5968` 7.11 / `oklchToHex(70, 0.4, 145)`가 올바른 HEX이고 다시 읽은 L이 70±0.5 / `wcagGrade` 경계 3, 4.5, 7
- [ ] `npx vitest run src/color/convert.test.ts` → FAIL (모듈 없음)
- [ ] 구현 (Ottosson OKLab 직접 행렬, 클리핑은 채도 이분 탐색, 판정은 엄격한 0~1)
- [ ] 같은 명령 → PASS
- [ ] 커밋 `feat: color conversion utilities`

### Task 2: 팔레트 생성 (`generate.ts`)

**Interfaces — Consumes:** Task 1 함수. **Produces:**
- `FAMILIES`, `STEPS`, `type Family`, `type Step`, `type Mode`, `type Scale = Record<Family, string[]>`
- `generatePalette(primary: string): { primary: string; anchor: Step; torsion: number; light: Scale; dark: Scale }`

- [ ] 실패하는 테스트 작성: `#3182f6` → anchor `'500'`, torsion 1.43±0.01, `light.primary[5] === '#3182f6'`, 노션 예시 70칸 채널당 ±1, gray 흰 배경 대비 `[1.04, 1.34, 1.75, 2.33, 3.2, 4.44, 6.42, 9.33, 13.06, 17.08]` ±0.02 / `#ff6600`·`#06c755`·`#000000`·`#ffffff`·`#808080`: 8계열 × 10칸 모두 `/^#[0-9a-f]{6}$/`, 라이트 primary L 단조 감소, 다크 primary L 단조 증가
- [ ] FAIL 확인 → 스펙 4장 구현 → PASS
- [ ] 커밋 `feat: palette generator from Notion 08 constants`

### Task 3: 디자인 토큰 (`tokens.ts`)

**Interfaces — Produces:** `toDesignTokens(input: { primary: string; anchor: Step; light: Scale; dark: Scale }): DesignTokens`

- [ ] 실패하는 테스트: `$description`에 primary·anchor, `light.gray['100']` = `{ $type: 'color', $value: <hex> }`, 모드 2 × 계열 8 × 단계 10, 넘겨준 scale 값(고친 값 포함)을 그대로 씀
- [ ] FAIL → 구현 → PASS → 커밋 `feat: export palette as W3C design tokens`

### Task 4: 화면

**Files:** `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/styles.css`, `src/components/ChipGrid.tsx`, `src/components/ColorInfo.tsx`, `src/components/ChipEditor.tsx`

- [ ] 실패하는 테스트(Testing Library): 칩 버튼 80개 / Primary 입력을 `#ff6600`으로 바꾸면 해당 칩 갱신 / 틀린 입력 안내 문구, 칩 유지 / 다크 전환 시 칩 값이 다크 값 / 칩 클릭 → 왼쪽 정보(HEX·RGB·HSL·OKLCH·대비)와 오른쪽 피커, `← 컬러칩`으로 복귀 / 피커 HEX 입력 변경 → 칩 반영·수정 표시, `생성값으로 되돌리기` / 피커 상태에서 모드 전환 → 다른 모드 칩 편집, 원래 모드 값 유지 / Primary 변경 시 고친 값 초기화 / `JSON 다운로드` 클릭 시 Blob 생성
- [ ] FAIL → 구현 → PASS, `npm run build` 성공
- [ ] 브라우저 스크린샷으로 라이트·다크·피커 화면 확인
- [ ] 커밋 `feat: two-panel palette UI with chip editor and JSON download`

### Task 5: 문서·배포

- [ ] `README.md`(소개, 사용법, JSON 형식, 개발 명령, 공식 출처), `CLAUDE.md`
- [ ] `vite.config.ts`의 `base: '/color-math/'`, `npm run deploy` = `vite build && gh-pages -d dist`
- [ ] GitHub 공개 저장소 생성 → `main` 푸시 → `npm run deploy` → Pages 소스를 `gh-pages` 브랜치로 설정
- [ ] 배포 주소가 200을 돌려주고 빌드된 JS를 불러오는지 확인
- [ ] 커밋 `docs: readme and deploy setup`
