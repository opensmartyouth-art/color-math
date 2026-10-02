import { contrast } from '../color/convert';
import { FAMILIES, STEPS, type Scale } from '../color/generate';
import type { Selection } from '../App';

type Props = {
  scale: Scale;
  edited: Partial<Record<string, string>>;
  onSelect: (selection: Selection) => void;
};

const ink = (hex: string) => (contrast(hex, '#ffffff') >= contrast(hex, '#000000') ? '#ffffff' : '#000000');

export default function ChipGrid({ scale, edited, onSelect }: Props) {
  return (
    <section className="chip-grid" aria-label="컬러칩 목록">
      {FAMILIES.map((family) => (
        <div className="chip-row" key={family}>
          <span className="chip-family">{family}</span>
          <div className="chip-cells">
            {STEPS.map((step, i) => {
              const hex = scale[family][i];
              const isEdited = edited[`${family}-${step}`] !== undefined;
              return (
                <button
                  key={step}
                  type="button"
                  className="chip"
                  style={{ background: hex, color: ink(hex) }}
                  aria-label={`${family}-${step} ${hex}${isEdited ? ' 수정됨' : ''}`}
                  onClick={() => onSelect({ family, step })}
                >
                  {isEdited && <span className="chip-dot" />}
                  <span className="chip-step">{step}</span>
                  <span className="chip-hex">{hex}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
