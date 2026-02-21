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
    const { onCreateFile: _, ...propsWithoutCreate } = defaultProps;
    render(<FileTree {...propsWithoutCreate} />);
    expect(screen.queryByTitle('New file')).not.toBeInTheDocument();
  });
});
