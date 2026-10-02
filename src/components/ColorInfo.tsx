import { contrast, hexToHsl, hexToOklch, hexToRgb, wcagGrade, type WcagGrade } from '../color/convert';
import type { Mode } from '../color/generate';
import type { Selection } from '../App';

type Props = {
  selection: Selection;
  mode: Mode;
  hex: string;
  generated: string | null; // set only when the chip was edited
  onRevert: () => void;
};

const GRADE_LABEL: Record<WcagGrade, string> = { AAA: 'AAA', AA: 'AA', 'AA-large': 'AA 큰 글씨', fail: '미달' };

function ContrastValue({ ratio }: { ratio: number }) {
  const grade = wcagGrade(ratio);
  return (
    <>
      {ratio.toFixed(2)}:1 <span className={`grade grade-${grade}`}>{GRADE_LABEL[grade]}</span>
    </>
  );
}

export default function ColorInfo({ selection, mode, hex, generated, onRevert }: Props) {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  const ok = hexToOklch(hex);

  return (
    <section className="color-info" aria-label="색 정보">
      <div className="info-title">
        <h2>{`${selection.family}-${selection.step}`}</h2>
        <span className="mode-tag">{mode === 'light' ? '라이트' : '다크'}</span>
      </div>
      <div className="info-swatch" style={{ background: hex }} />
      <dl className="info-list">
        <dt>HEX</dt>
        <dd>{hex}</dd>
        <dt>RGB</dt>
        <dd>{rgb.join(', ')}</dd>
        <dt>HSL</dt>
        <dd>{`${hsl.h.toFixed(1)}°, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%`}</dd>
        <dt>OKLCH</dt>
        <dd>{`${ok.l.toFixed(2)}  ${ok.c.toFixed(4)}  ${ok.h.toFixed(1)}°`}</dd>
        <dt>흰 배경</dt>
        <dd>
          <ContrastValue ratio={contrast(hex, '#ffffff')} />
        </dd>
        <dt>검정 배경</dt>
        <dd>
          <ContrastValue ratio={contrast(hex, '#000000')} />
        </dd>
      </dl>
      {generated && (
        <div className="info-edited">
          <p>{`생성값 ${generated}`}</p>
          <button type="button" className="text-button" onClick={onRevert}>
            생성값으로 되돌리기
          </button>
        </div>
      )}
    </section>
  );
}
