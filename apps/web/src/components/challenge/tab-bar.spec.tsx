import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TabBar } from './tab-bar';

const TABS = ['src/app.js', 'src/utils/helpers.ts', 'package.json'];

function mockResizeObserver(onConstruct?: (cb: ResizeObserverCallback) => void) {
  globalThis.ResizeObserver = class {
    constructor(cb: ResizeObserverCallback) {
      onConstruct?.(cb);
    }
    observe() { /* noop */ }
    unobserve() { /* noop */ }
    disconnect() { /* noop */ }
  } as unknown as typeof ResizeObserver;
}

// jsdom lacks ResizeObserver and scrollIntoView
beforeAll(() => {
  mockResizeObserver();
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  mockResizeObserver();
});

describe('TabBar', () => {
  it('renders filenames from tab paths', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    expect(screen.getByText('app.js')).toBeInTheDocument();
    expect(screen.getByText('helpers.ts')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('calls onSelect when tab is clicked', () => {
    const onSelect = vi.fn();
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('helpers.ts'));
    expect(onSelect).toHaveBeenCalledWith('src/utils/helpers.ts');
  });

  it('active tab has bg-background class', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    const activeTab = screen.getByText('app.js').closest('[draggable]') as HTMLElement;
    expect(activeTab.className).toContain('bg-background');
  });

  it('inactive tab has text-muted-foreground class', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    const inactiveTab = screen.getByText('helpers.ts').closest('[draggable]') as HTMLElement;
    expect(inactiveTab.className).toContain('text-muted-foreground');
  });

  it('close button calls onClose and stops propagation', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={onSelect} onClose={onClose} />);

    const closeButtons = screen.getAllByTitle('Close tab');
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledWith('src/app.js');
    // onSelect should NOT be called because stopPropagation
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('close button is absent when onClose is undefined', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    expect(screen.queryAllByTitle('Close tab')).toHaveLength(0);
  });

  it('shows modified dot for paths in modifiedPaths set', () => {
    const modifiedPaths = new Set(['src/app.js']);
    const { container } = render(
      <TabBar
        tabs={TABS}
        activeTab={TABS[0]}
        onSelect={vi.fn()}
        modifiedPaths={modifiedPaths}
      />,
    );
    // Modified indicator is a rounded-full span
    const dots = container.querySelectorAll('.rounded-full.bg-primary');
    expect(dots).toHaveLength(1);
  });

  it('drag and drop calls onReorder', () => {
    const onReorder = vi.fn();
    render(
      <TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} onReorder={onReorder} />,
    );

    const tabElements = screen.getAllByText(/app\.js|helpers\.ts|package\.json/)
      .map((el) => el.closest('[draggable]') as HTMLElement);

    const dataTransfer = { effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(tabElements[0], { dataTransfer });
    fireEvent.dragOver(tabElements[2], { dataTransfer });
    fireEvent.drop(tabElements[2], { dataTransfer });

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it('tabs are not draggable when onReorder is undefined', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    const tabElements = screen.getAllByText(/app\.js|helpers\.ts|package\.json/)
      .map((el) => el.closest('[draggable]') as HTMLElement);

    tabElements.forEach((el) => {
      expect(el.getAttribute('draggable')).toBe('false');
    });
  });

  it('drop indicator styling appears during drag over', () => {
    const onReorder = vi.fn();
    render(
      <TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} onReorder={onReorder} />,
    );

    const tabElements = screen.getAllByText(/app\.js|helpers\.ts|package\.json/)
      .map((el) => el.closest('[draggable]') as HTMLElement);

    // jsdom doesn't support DataTransfer on synthetic drag events, so we
    // provide a minimal stub to prevent runtime errors in the component.
    const dataTransfer = { effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(tabElements[0], { dataTransfer });
    fireEvent.dragOver(tabElements[1], { dataTransfer });

    // The drop target should now have the border-l-primary class
    expect(tabElements[1].className).toContain('border-l-primary');
  });

  it('scroll arrows are hidden when all tabs fit', () => {
    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);
    expect(screen.queryByLabelText('Scroll tabs left')).toBeNull();
    expect(screen.queryByLabelText('Scroll tabs right')).toBeNull();
  });

  it('data-tab-path attribute is set on each tab', () => {
    const { container } = render(
      <TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />,
    );
    expect(container.querySelector('[data-tab-path="src/app.js"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tab-path="src/utils/helpers.ts"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tab-path="package.json"]')).toBeInTheDocument();
  });

  it('scroll arrows appear when overflow is detected', () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    mockResizeObserver((cb) => { resizeCallback = cb; });

    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);

    // Simulate overflow: scrollWidth > clientWidth, scrolled partway
    const scrollContainer = screen.getByTitle(/Switch tabs/);
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 50, configurable: true });

    act(() => {
      resizeCallback?.([], {} as ResizeObserver);
    });

    expect(screen.getByLabelText('Scroll tabs left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll tabs right')).toBeInTheDocument();
  });

  it('clicking scroll right calls scrollBy', () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    mockResizeObserver((cb) => { resizeCallback = cb; });

    render(<TabBar tabs={TABS} activeTab={TABS[0]} onSelect={vi.fn()} />);

    const scrollContainer = screen.getByTitle(/Switch tabs/);
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 600, configurable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });

    const scrollBySpy = vi.fn();
    scrollContainer.scrollBy = scrollBySpy;

    act(() => {
      resizeCallback?.([], {} as ResizeObserver);
    });

    fireEvent.click(screen.getByLabelText('Scroll tabs right'));
    expect(scrollBySpy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
  });
});
