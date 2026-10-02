import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { parseHex } from '../color/convert';
import type { Selection } from '../App';

type Props = {
  selection: Selection;
  hex: string;
  onChange: (hex: string) => void;
};

export default function ChipEditor({ selection, hex, onChange }: Props) {
  const [draft, setDraft] = useState(hex);
  const [syncedHex, setSyncedHex] = useState(hex);
  // Sync during render (no stale frame) and only when the color changed from outside
  // (picker drag, mode switch), so typing "#e8e" on the way to "#e8ecf2" is not rewritten to "#ee88ee".
  if (hex !== syncedHex) {
    setSyncedHex(hex);
    if (parseHex(draft) !== hex) setDraft(hex);
  }

  return (
    <section className="chip-editor" aria-label={`${selection.family}-${selection.step} 편집`}>
      <HexColorPicker color={hex} onChange={onChange} />
      <label className="field editor-field">
        <span>HEX 값</span>
        <input
          aria-label="HEX 값"
          value={draft}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={parseHex(draft) === null}
          onChange={(e) => {
            setDraft(e.target.value);
            const next = parseHex(e.target.value);
            if (next) onChange(next);
          }}
        />
      </label>
    </section>
  );
}
