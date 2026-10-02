import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { generatePalette } from './color/generate';

const initial = generatePalette('#3182f6');

const chip = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name} `) });
const primaryInput = () => screen.getByLabelText('Primary 컬러');

afterEach(cleanup);

describe('palette view', () => {
  it('starts from #3182f6 and renders 8 families × 10 chips', () => {
    render(<App />);
    expect(primaryInput()).toHaveProperty('value', '#3182f6');
    const grid = screen.getByRole('region', { name: '컬러칩 목록' });
    expect(within(grid).getAllByRole('button')).toHaveLength(80);
    expect(chip('primary-500').getAttribute('aria-label')).toContain('#3182f6');
  });

  it('regenerates when a new primary is typed', () => {
    render(<App />);
    fireEvent.change(primaryInput(), { target: { value: 'FF6600' } });
    expect(chip('primary-300').getAttribute('aria-label')).toContain('#ff6600');
    expect(screen.getByText('앵커 300 칸에 들어갑니다')).toBeTruthy();
  });

  it('keeps the previous palette and explains the format on invalid input', () => {
    render(<App />);
    fireEvent.change(primaryInput(), { target: { value: '#31' } });
    expect(screen.getByRole('alert').textContent).toBe('#RRGGBB 형식으로 입력해 주세요');
    expect(chip('primary-500').getAttribute('aria-label')).toContain('#3182f6');
  });

  it('switches every chip to its dark value', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '다크' }));
    expect(screen.getByRole('button', { name: '다크' }).getAttribute('aria-pressed')).toBe('true');
    expect(chip('primary-500').getAttribute('aria-label')).toContain(initial.dark.primary[5]);
    expect(chip('gray-50').getAttribute('aria-label')).toContain(initial.dark.gray[0]);
  });
});

describe('chip editing', () => {
  it('shows color info on the left and a picker on the right', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    const info = screen.getByRole('region', { name: '색 정보' });
    expect(within(info).getByText('gray-100')).toBeTruthy();
    expect(within(info).getAllByText(initial.light.gray[1]).length).toBeGreaterThan(0);
    for (const label of ['RGB', 'HSL', 'OKLCH', '흰 배경', '검정 배경']) {
      expect(within(info).getByText(label)).toBeTruthy();
    }
    expect(screen.getByLabelText('HEX 값')).toHaveProperty('value', initial.light.gray[1]);
    expect(screen.queryByRole('region', { name: '컬러칩 목록' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(screen.getByRole('region', { name: '컬러칩 목록' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: '색 정보' })).toBeNull();
  });

  it('applies an edit to that chip only, marks it, and can revert', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    fireEvent.change(screen.getByLabelText('HEX 값'), { target: { value: '#123456' } });
    expect(screen.getByText(`생성값 ${initial.light.gray[1]}`)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe('gray-100 #123456 수정됨');
    expect(chip('gray-200').getAttribute('aria-label')).toBe(`gray-200 ${initial.light.gray[2]}`);

    fireEvent.click(chip('gray-100'));
    fireEvent.click(screen.getByRole('button', { name: '생성값으로 되돌리기' }));
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe(`gray-100 ${initial.light.gray[1]}`);
  });

  it('edits the same chip in the other mode after switching while the picker is open', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    fireEvent.click(screen.getByRole('button', { name: '다크' }));
    expect(screen.getByLabelText('HEX 값')).toHaveProperty('value', initial.dark.gray[1]);
    fireEvent.change(screen.getByLabelText('HEX 값'), { target: { value: '#abcdef' } });
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe('gray-100 #abcdef 수정됨');

    fireEvent.click(screen.getByRole('button', { name: '라이트' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe(`gray-100 ${initial.light.gray[1]}`);
  });

  it('clears edits and selection when the primary changes', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    fireEvent.change(screen.getByLabelText('HEX 값'), { target: { value: '#123456' } });
    fireEvent.change(primaryInput(), { target: { value: '#06c755' } });
    expect(screen.queryByRole('region', { name: '색 정보' })).toBeNull();
    expect(chip('gray-100').getAttribute('aria-label')).not.toContain('수정됨');
  });

  it('keeps what the user is typing when a 3-digit prefix is already a valid hex', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    const field = screen.getByLabelText('HEX 값');
    for (const value of ['#', '#e', '#e8', '#e8e', '#e8ec', '#e8ecf', '#e8ecf2']) {
      fireEvent.change(field, { target: { value } });
      expect(field).toHaveProperty('value', value);
    }
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe('gray-100 #e8ecf2 수정됨');
  });

  it('does not apply a 3-digit prefix while typing in the HEX field, only on Enter or blur', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    const field = screen.getByLabelText('HEX 값');
    fireEvent.change(field, { target: { value: '#dcd' } });
    expect(screen.queryByText(/^생성값 /)).toBeNull();
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(screen.getByText(`생성값 ${initial.light.gray[1]}`)).toBeTruthy();
    expect(field).toHaveProperty('value', '#dcd');
  });

  it('drops the edit mark when a chip is set back to its generated value', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    const field = screen.getByLabelText('HEX 값');
    fireEvent.change(field, { target: { value: '#123456' } });
    fireEvent.change(field, { target: { value: initial.light.gray[1].toUpperCase() } });
    expect(screen.queryByText(/^생성값 /)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe(`gray-100 ${initial.light.gray[1]}`);
  });

  it('shows no hue for achromatic colors', () => {
    render(<App />);
    fireEvent.click(chip('gray-50')); // #fafafa, chroma ≈ 0
    const info = screen.getByRole('region', { name: '색 정보' });
    expect(within(info).getByText('OKLCH').nextElementSibling?.textContent).toMatch(/—$/);
  });
});

describe('primary input', () => {
  it('keeps edits while backspacing through a 3-digit prefix of the same color', () => {
    render(<App />);
    fireEvent.click(chip('gray-100'));
    fireEvent.change(screen.getByLabelText('HEX 값'), { target: { value: '#123456' } });
    for (const value of ['#3182f', '#318', '#31', '#318', '#3182f', '#3182f6']) {
      fireEvent.change(primaryInput(), { target: { value } });
    }
    expect(screen.getByRole('region', { name: '색 정보' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(chip('gray-100').getAttribute('aria-label')).toBe('gray-100 #123456 수정됨');
  });

  it('applies a 3-digit shorthand on Enter', () => {
    render(<App />);
    fireEvent.change(primaryInput(), { target: { value: '#38f' } });
    expect(chip('primary-500').getAttribute('aria-label')).toContain('#3182f6');
    fireEvent.keyDown(primaryInput(), { key: 'Enter' });
    expect(screen.getAllByRole('button', { name: /#3388ff/ }).length).toBeGreaterThan(0);
  });
});

describe('keyboard focus', () => {
  it('moves focus into the editor and back to the chip it came from', () => {
    render(<App />);
    chip('gray-100').focus();
    fireEvent.click(chip('gray-100'));
    expect(document.activeElement).toBe(screen.getByLabelText('HEX 값'));
    fireEvent.click(screen.getByRole('button', { name: '← 컬러칩' }));
    expect(document.activeElement).toBe(chip('gray-100'));
  });

  it('closes the editor with Escape', () => {
    render(<App />);
    fireEvent.click(chip('red-500'));
    fireEvent.keyDown(screen.getByLabelText('HEX 값'), { key: 'Escape' });
    expect(screen.getByRole('region', { name: '컬러칩 목록' })).toBeTruthy();
    expect(document.activeElement).toBe(chip('red-500'));
  });
});

describe('JSON download', () => {
  it('downloads design tokens including edited chips', async () => {
    let saved: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      saved = blob;
      return 'blob:color-math';
    });
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    fireEvent.click(chip('gray-100'));
    fireEvent.change(screen.getByLabelText('HEX 값'), { target: { value: '#123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'JSON 다운로드' }));

    expect(click).toHaveBeenCalledTimes(1);
    const json = JSON.parse(await saved!.text());
    expect(json.light.gray['100']).toEqual({ $type: 'color', $value: '#123456' });
    expect(json.dark.primary['500'].$value).toBe(initial.dark.primary[5]);
    click.mockRestore();
    vi.unstubAllGlobals();
  });
});
