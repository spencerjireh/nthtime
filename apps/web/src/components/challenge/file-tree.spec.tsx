import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree } from './file-tree';

const mockFiles = ['app.js', 'server.js', 'src/utils.ts', 'src/index.ts'];

describe('FileTree', () => {
  const defaultProps = {
    files: mockFiles,
    activeFile: 'app.js',
    isDirty: vi.fn().mockReturnValue(false),
    onSelect: vi.fn(),
    onCreateFile: vi.fn(),
    onRenameFile: vi.fn(),
    onDeleteFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders flat files at root level', () => {
    render(<FileTree {...defaultProps} />);
    expect(screen.getByText('app.js')).toBeInTheDocument();
    expect(screen.getByText('server.js')).toBeInTheDocument();
  });

  it('renders folder hierarchy', () => {
    render(<FileTree {...defaultProps} />);
    // src folder shown, children hidden by default
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.queryByText('utils.ts')).not.toBeInTheDocument();
  });

  it('expands folder on click', () => {
    render(<FileTree {...defaultProps} />);
    // Click the folder button (which contains the folder name)
    fireEvent.click(screen.getByText('src'));
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('calls onSelect when clicking a file', () => {
    render(<FileTree {...defaultProps} />);
    fireEvent.click(screen.getByText('app.js'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('app.js');
  });

  it('highlights active file', () => {
    const { container } = render(<FileTree {...defaultProps} />);
    // Active file row has accent classes
    const activeRow = container.querySelector('.bg-accent');
    expect(activeRow).toBeInTheDocument();
  });

  it('shows Files header with create button', () => {
    render(<FileTree {...defaultProps} />);
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByTitle('New file')).toBeInTheDocument();
  });

  it('renders file type icons', () => {
    render(<FileTree {...defaultProps} />);
    // JS files should have JS icon
    expect(screen.getAllByText('JS')).toHaveLength(2); // app.js, server.js
  });

  it('does not show create button when onCreateFile is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onCreateFile: _, ...propsWithoutCreate } = defaultProps;
    render(<FileTree {...propsWithoutCreate} />);
    expect(screen.queryByTitle('New file')).not.toBeInTheDocument();
  });

  it('create file: clicking "+" shows inline input', () => {
    render(<FileTree {...defaultProps} />);
    fireEvent.click(screen.getByTitle('New file'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('create file: Enter commits and calls onCreateFile', () => {
    render(<FileTree {...defaultProps} />);
    fireEvent.click(screen.getByTitle('New file'));
    const input = screen.getByRole('textbox');
    // Set the input value, then press Enter to commit
    fireEvent.change(input, { target: { value: 'new-file.js' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onCreateFile).toHaveBeenCalledWith('new-file.js');
  });

  it('create file: Escape cancels, onCreateFile NOT called', () => {
    render(<FileTree {...defaultProps} />);
    fireEvent.click(screen.getByTitle('New file'));
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(defaultProps.onCreateFile).not.toHaveBeenCalled();
  });

  it('rename: clicking rename button shows input pre-filled with filename', () => {
    render(<FileTree {...defaultProps} />);
    // Rename buttons are visible on hover; query by title
    const renameButtons = screen.getAllByTitle('Rename');
    fireEvent.click(renameButtons[0]); // rename first file (app.js)
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('app.js');
  });

  it('rename: Enter commits and calls onRenameFile', () => {
    render(<FileTree {...defaultProps} />);
    const renameButtons = screen.getAllByTitle('Rename');
    fireEvent.click(renameButtons[0]);
    const input = screen.getByRole('textbox');
    // Change the value and press Enter
    fireEvent.change(input, { target: { value: 'renamed.js' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRenameFile).toHaveBeenCalledWith('app.js', 'renamed.js');
  });

  it('delete: calls onDeleteFile when confirm returns true', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<FileTree {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeleteFile).toHaveBeenCalledWith('app.js');
  });

  it('delete: does NOT call onDeleteFile when confirm returns false', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<FileTree {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeleteFile).not.toHaveBeenCalled();
  });

  it('dirty indicator: teal dot visible when isDirty returns true', () => {
    const isDirty = vi.fn((path: string) => path === 'app.js');
    render(<FileTree {...defaultProps} isDirty={isDirty} />);
    // The teal dot has class bg-teal-400, and is a 1.5x1.5 circle
    const { container } = render(<FileTree {...defaultProps} isDirty={isDirty} />);
    const dots = container.querySelectorAll('.bg-teal-400');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });
});
