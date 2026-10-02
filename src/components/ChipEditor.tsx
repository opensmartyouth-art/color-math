import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isFullHex, parseHex } from '../color/convert';
import type { Selection } from '../App';

type Props = {
  selection: Selection;
  hex: string;
  onChange: (hex: string) => void;
  onClose: () => void;
};

export default function ChipEditor({ selection, hex, onChange, onClose }: Props) {
  const [draft, setDraft] = useState(hex);
  const [syncedHex, setSyncedHex] = useState(hex);
  // Sync during render (no stale frame) and only when the color changed from outside
  // (picker drag, mode switch), so a draft like "#e8e" or "#dcd" stays as typed.
  if (hex !== syncedHex) {
    setSyncedHex(hex);
    if (parseHex(draft) !== hex) setDraft(hex);
  }

  const commit = () => {
    const next = parseHex(draft);
    if (next) onChange(next);
  };

  return (
    <section
      className="chip-editor"
      aria-label={`${selection.family}-${selection.step} 편집`}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <HexColorPicker color={hex} onChange={onChange} />
      <label className="field editor-field">
        <span>HEX 값</span>
        <input
          aria-label="HEX 값"
          value={draft}
          autoFocus
          onFocus={(e) => e.target.select()}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={parseHex(draft) === null}
          onChange={(e) => {
            setDraft(e.target.value);
            if (isFullHex(e.target.value)) onChange(parseHex(e.target.value)!);
          }}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
      </label>
    </section>
  );
}
