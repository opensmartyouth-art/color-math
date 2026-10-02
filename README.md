# Color Math

Primary 컬러 하나를 넣으면 Neutral, 시맨틱 컬러(red · orange · yellow · green · blue · purple), 다크모드까지 한 번에 만들어 주는 웹 도구입니다.

**https://opensmartyouth-art.github.io/color-math/**

화면은 opencode.ai 스타일을 분석한 [DESIGN.md](DESIGN.md)(출처 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md), MIT)를 따릅니다.

## 왜 만들었나

디자인 시스템의 Color를 처음 세울 때 "왜 이 회색인가, 왜 50부터인가"에 답하기 어렵습니다.
Radix, Tailwind, IBM Carbon, Atlassian, GitHub Primer, Adobe Spectrum, Toss, 당근 Seed, Apple, Ant Design, Fluent, Polaris, Gestalt, Paste까지 14개 시스템이 실제로 배포하는 토큰 3,850개를 OKLCH로 재서 공통 규칙을 뽑았고, 이 도구는 그 규칙만으로 팔레트를 만듭니다.

| 규칙 | 값 |
| --- | --- |
| 회색은 브랜드 색을 따라가지 않는다 | 색상각 263.3° 고정 |
| 명도 사다리 (50 → 900) | okL 98.5 · 90.2 · 81.9 · 73.6 · 65.3 · 57.0 · 48.4 · 39.8 · 31.2 · 22.6 |
| 채도는 가운데가 가장 높은 아치 | 양 끝에서 채도를 덜어냄 |
| 어두워질수록 색상각이 돈다 | 파랑 +1.44°/칸, 노랑 −2.21°/칸 … |
| 시맨틱 컬러는 정해진 좌표 | red 26.7°, green 154.7° … |
| 다크모드 = 반전 + 22포인트 | `okL_dark = 122.4 − okL_light` |

## 사용법

1. 왼쪽에 Primary 컬러 HEX를 넣습니다 (`#3182f6`, `3182f6`, `#38f` 모두 가능).
2. 오른쪽에 8계열 × 10단계 컬러칩이 나옵니다. 우측 상단에서 라이트/다크를 바꿔 봅니다.
3. 칩을 누르면 왼쪽에 색 정보(HEX · RGB · HSL · OKLCH · WCAG 대비)가, 오른쪽에 컬러피커가 나옵니다. 고친 값은 그 칩 하나에만, 지금 보고 있는 모드에만 반영됩니다.
4. 우측 하단 `JSON 다운로드`로 화면에 보이는 값을 그대로 내려받습니다.

## JSON 형식

[W3C 디자인 토큰(DTCG)](https://www.designtokens.org/) 형식이라 Tokens Studio, Style Dictionary 등에 바로 넣을 수 있습니다.

```json
{
  "$description": "Color Math · primary #3182f6 · anchor 500",
  "light": {
    "primary": { "50": { "$type": "color", "$value": "#f7fbff" } },
    "gray": { "100": { "$type": "color", "$value": "#dcdfe3" } }
  },
  "dark": { "primary": { "500": { "$type": "color", "$value": "#2b7df0" } } }
}
```

## 개발

```bash
npm install
npm run dev      # 로컬 서버
npm test         # 테스트
npm run build    # 타입 검사 + 빌드
npm run deploy   # gh-pages 브랜치로 배포
```

- 설계: [docs/superpowers/specs/2026-10-02-color-math-web-design.md](docs/superpowers/specs/2026-10-02-color-math-web-design.md)
- 보류·개선 후보: [docs/BACKLOG.md](docs/BACKLOG.md)
