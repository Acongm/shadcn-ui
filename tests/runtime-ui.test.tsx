import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '../registry/acongm/ui/alert';
import { Button } from '../registry/acongm/ui/button';
import { Input } from '../registry/acongm/ui/input';
import { Label } from '../registry/acongm/ui/label';
import { ThemeToggle } from '../registry/acongm/ui/theme-toggle';

describe('Acongm UI runtime contracts', () => {
  it('keeps Button keyboard reachable and disabled-safe through Base UI', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <div>
        <Button onClick={onClick}>保存</Button>
        <Button disabled onClick={onClick}>不可用</Button>
      </div>,
    );

    const button = screen.getByRole('button', { name: '保存' }) as HTMLButtonElement;
    const disabled = screen.getByRole('button', { name: '不可用' });

    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');

    await user.tab();
    expect(document.activeElement).toBe(button);

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    await user.click(disabled);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('binds Label and Input through native form semantics', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" />
      </div>,
    );

    const input = screen.getByRole('textbox', { name: '邮箱' }) as HTMLInputElement;
    await user.type(input, 'hello@acongm.com');

    expect(input.value).toBe('hello@acongm.com');
    expect(input.type).toBe('text');
  });

  it('keeps Alert assertive without forcing application heading hierarchy', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>登录失败</AlertTitle>
        <AlertDescription>请检查账号后重试。</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('登录失败');
    expect(alert.textContent).toContain('请检查账号后重试。');
    expect(alert.querySelector('[data-slot="alert-title"]')?.tagName).toBe('DIV');
    expect(alert.querySelector('[data-slot="alert-description"]')?.tagName).toBe('DIV');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('cycles system → light → dark and persists the shared theme contract', async () => {
    const user = userEvent.setup();

    render(<ThemeToggle showLabel={false} />);

    const toggle = await screen.findByRole('button', {
      name: /跟随系统，切换到浅色模式/,
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    await user.click(toggle);
    await waitFor(() => {
      expect(window.localStorage.getItem('acongm-theme')).toBe('light');
      expect(window.localStorage.getItem('theme')).toBe('light');
      expect(toggle.getAttribute('aria-label')).toContain('浅色模式');
    });

    await user.click(toggle);
    await waitFor(() => {
      expect(window.localStorage.getItem('acongm-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(document.cookie).toContain('acongm-theme=dark');
      expect(toggle.getAttribute('aria-label')).toContain('深色模式');
    });
  });

  it('reacts to operating-system theme changes while system mode is active', async () => {
    let systemDark = false;
    let changeListener: (() => void) | undefined;
    const mediaQuery = {
      get matches() {
        return systemDark;
      },
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        changeListener = listener;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    };

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => mediaQuery),
    });

    render(<ThemeToggle showLabel={false} />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(changeListener).toBeTypeOf('function');
    });

    act(() => {
      systemDark = true;
      changeListener?.();
    });

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    expect(window.localStorage.getItem('acongm-theme')).toBeNull();
  });
});
