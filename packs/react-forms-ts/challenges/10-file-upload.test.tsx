// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useEffect, useState, ChangeEvent } from 'react';

function AvatarUpload({ onChange }: { onChange?: (file: File | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    onChange?.(next);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onPick} />
      {previewUrl ? <img src={previewUrl} alt="preview" /> : null}
    </div>
  );
}

describe('10 File Upload', () => {
  beforeEach(() => {
    let counter = 0;
    URL.createObjectURL = vi.fn(() => `blob:fake-${++counter}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an image preview after a file is picked', async () => {
    const onChange = vi.fn();
    const { container } = render(<AvatarUpload onChange={onChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText('preview') as HTMLImageElement;
      expect(img.src).toContain('blob:fake-');
    });
    expect(onChange).toHaveBeenCalledWith(file);
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });
});
