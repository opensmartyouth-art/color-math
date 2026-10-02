import { useMemo, useState } from 'react';
import { isFullHex, parseHex } from './color/convert';
import { FAMILIES, STEPS, generatePalette, type Family, type Mode, type Scale, type Step } from './color/generate';
import { toDesignTokens } from './color/tokens';
import ChipEditor from './components/ChipEditor';
import ChipGrid from './components/ChipGrid';
import ColorInfo from './components/ColorInfo';
import Wordmark from './components/Wordmark';

const DEFAULT_PRIMARY = '#3182f6';

type ChipKey = `${Family}-${Step}`;
type Overrides = Record<Mode, Partial<Record<ChipKey, string>>>;
export type Selection = { family: Family; step: Step };

const noOverrides = (): Overrides => ({ light: {}, dark: {} });

function applyOverrides(scale: Scale, overrides: Overrides[Mode]): Scale {
  return Object.fromEntries(
    FAMILIES.map((family) => [family, scale[family].map((hex, i) => overrides[`${family}-${STEPS[i]}`] ?? hex)]),
  ) as Scale;
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_PRIMARY);
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [mode, setMode] = useState<Mode>('light');
  const [selected, setSelected] = useState<Selection | null>(null);
  const [returnFocus, setReturnFocus] = useState<Selection | null>(null); // chip to refocus after closing the editor
  const [overrides, setOverrides] = useState<Overrides>(noOverrides);

  const palette = useMemo(() => generatePalette(primary), [primary]);
  const shown = useMemo(
    () => ({ light: applyOverrides(palette.light, overrides.light), dark: applyOverrides(palette.dark, overrides.dark) }),
    [palette, overrides],
  );
  const inputValid = parseHex(input) !== null;

  function applyPrimary(value: string) {
    const hex = parseHex(value);
    if (hex && hex !== primary) {
      setPrimary(hex);
      setOverrides(noOverrides());
      setSelected(null);
      setReturnFocus(null);
    }
  }

  function changePrimary(value: string) {
    setInput(value);
    if (isFullHex(value)) applyPrimary(value);
  }

  function closeEditor() {
    setReturnFocus(selected);
    setSelected(null);
  }

  // null, or the generated value itself, clears the edit.
  function setChip(sel: Selection, hex: string | null) {
    const generatedHex = palette[mode][sel.family][STEPS.indexOf(sel.step)];
    setOverrides((prev) => {
      const next = { ...prev[mode] };
      if (hex === null || hex === generatedHex) delete next[`${sel.family}-${sel.step}`];
      else next[`${sel.family}-${sel.step}`] = hex;
      return { ...prev, [mode]: next };
    });
  }

  function download() {
    const tokens = toDesignTokens({ primary, anchor: palette.anchor, ...shown });
    const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-math-${primary.slice(1)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const index = selected ? STEPS.indexOf(selected.step) : -1;
  const current = selected ? shown[mode][selected.family][index] : null;
  const generated = selected ? palette[mode][selected.family][index] : null;
  const edited = selected ? overrides[mode][`${selected.family}-${selected.step}`] !== undefined : false;

  return (
    <div className="app">
      <aside className="panel panel-left">
        <header className="brand">
          <h1>
            <span className="sr-only">Color Math</span>
            <Wordmark />
          </h1>
          <p>Primary 하나로 컬러 시스템 만들기</p>
        </header>

        <div className="field">
          <label htmlFor="primary">Primary 컬러</label>
          <div className="input-wrap">
            <span className="input-swatch" style={{ background: primary }} />
            <input
              id="primary"
              value={input}
              onChange={(e) => changePrimary(e.target.value)}
              onBlur={(e) => applyPrimary(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyPrimary(e.currentTarget.value)}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={!inputValid}
            />
          </div>
          {inputValid ? (
            <p className="hint">앵커 {palette.anchor} 칸에 들어갑니다</p>
          ) : (
            <p className="hint hint-error" role="alert">
              #RRGGBB 형식으로 입력해 주세요
            </p>
          )}
        </div>

        {selected && current && generated && (
          <ColorInfo
            selection={selected}
            mode={mode}
            hex={current}
            generated={edited ? generated : null}
            onRevert={() => setChip(selected, null)}
          />
        )}
      </aside>

      <main className="panel panel-right" data-mode={mode}>
        <header className="right-header">
          {selected ? (
            <button type="button" className="back" aria-label="컬러칩으로 돌아가기" onClick={closeEditor}>
              <span aria-hidden="true">[←]</span> 컬러칩
            </button>
          ) : (
            <h2>컬러칩</h2>
          )}
          <div className="mode-tabs" role="group" aria-label="모드">
            {(['light', 'dark'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m === 'light' ? '라이트' : '다크'}
              </button>
            ))}
          </div>
        </header>

        <div className="right-body">
          {selected && current ? (
            <ChipEditor
              selection={selected}
              hex={current}
              onChange={(hex) => setChip(selected, hex)}
              onClose={closeEditor}
            />
          ) : (
            <ChipGrid scale={shown[mode]} edited={overrides[mode]} focus={returnFocus} onSelect={setSelected} />
          )}
        </div>

        <footer className="right-footer">
          <button type="button" className="primary-button" onClick={download}>
            JSON 다운로드
          </button>
        </footer>
      </main>
    </div>
  );
}
