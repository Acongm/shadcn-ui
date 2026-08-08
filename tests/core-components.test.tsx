import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { cn } from '../registry/acongm/lib/ui-cn';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../registry/acongm/ui/alert';
import { Badge, badgeVariants } from '../registry/acongm/ui/badge';
import { Button, buttonVariants } from '../registry/acongm/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../registry/acongm/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '../registry/acongm/ui/field';
import { Input } from '../registry/acongm/ui/input';
import { Separator } from '../registry/acongm/ui/separator';
import { Skeleton } from '../registry/acongm/ui/skeleton';

describe('core component contracts', () => {
  it('lets consumer Tailwind classes override defaults through cn()', () => {
    const classes = cn('h-10 px-4 text-sm', 'h-8 px-2');
    expect(classes.split(' ')).toContain('h-8');
    expect(classes.split(' ')).toContain('px-2');
    expect(classes.split(' ')).not.toContain('h-10');
    expect(classes.split(' ')).not.toContain('px-4');
  });

  it('exposes the mature Button variant/size surface and stable state markers', () => {
    render(<Button variant="outline" size="icon-sm" aria-label="设置">S</Button>);
    const button = screen.getByRole('button', { name: '设置' });
    expect(button.getAttribute('data-variant')).toBe('outline');
    expect(button.getAttribute('data-size')).toBe('icon-sm');
    expect(button.className.split(' ')).toContain('size-8');
    expect(buttonVariants({ variant: 'link' })).toContain('hover:underline');
    expect(buttonVariants({ size: 'xs' })).toContain('h-6');
    expect(buttonVariants({ size: 'icon-lg' })).toContain('size-10');
  });

  it('allows Input className to override default Tailwind sizing', () => {
    render(<Input aria-label="搜索" className="h-12 px-5" />);
    const input = screen.getByRole('textbox', { name: '搜索' });
    const classes = input.className.split(' ');
    expect(classes).toContain('h-12');
    expect(classes).toContain('px-5');
    expect(classes).not.toContain('h-9');
    expect(classes).not.toContain('px-3');
  });

  it('keeps Card composition neutral and supports size/action', () => {
    render(
      <Card size="sm">
        <CardHeader>
          <CardTitle>项目状态</CardTitle>
          <CardDescription>最近一次同步成功</CardDescription>
          <CardAction><Button size="xs">刷新</Button></CardAction>
        </CardHeader>
        <CardContent>内容</CardContent>
      </Card>,
    );
    const title = screen.getByText('项目状态');
    expect(title.tagName).toBe('DIV');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(title.closest('[data-slot="card"]')?.getAttribute('data-size')).toBe('sm');
    expect(screen.getByText('刷新').closest('[data-slot="card-action"]')).not.toBeNull();
  });

  it('supports Badge render semantics instead of forcing span-only output', () => {
    render(<Badge variant="link" render={<a href="/docs" />}>文档</Badge>);
    const link = screen.getByRole('link', { name: '文档' });
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.getAttribute('data-slot')).toBe('badge');
    expect(badgeVariants({ variant: 'ghost' })).toContain('hover:bg-accent');
  });

  it('composes Alert action without forcing heading hierarchy', () => {
    render(
      <Alert>
        <AlertTitle>连接异常</AlertTitle>
        <AlertDescription>可以稍后重试。</AlertDescription>
        <AlertAction><Button size="xs">重试</Button></AlertAction>
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('重试').closest('[data-slot="alert-action"]')).not.toBeNull();
  });

  it('supports Field label, description, input and announced errors as one composition', async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel htmlFor="username">用户名</FieldLabel>
        <Input id="username" aria-describedby="username-help username-error" aria-invalid="true" />
        <FieldDescription id="username-help">用于公开显示。</FieldDescription>
        <FieldError id="username-error" errors={[{ message: '用户名不能为空' }, { message: '用户名不能为空' }, { message: '至少 3 个字符' }]} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '用户名' });
    await user.type(input, 'abc');
    expect((input as HTMLInputElement).value).toBe('abc');
    expect(screen.getByText('用于公开显示。')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('delegates Separator orientation semantics to Base UI', () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.hasAttribute('data-vertical')).toBe(true);
  });

  it('keeps Skeleton accessibility policy consumer-controlled', () => {
    const { rerender } = render(<Skeleton data-testid="loading-shape" />);
    expect(screen.getByTestId('loading-shape').hasAttribute('aria-hidden')).toBe(false);
    rerender(<Skeleton data-testid="loading-shape" aria-hidden="true" />);
    expect(screen.getByTestId('loading-shape').getAttribute('aria-hidden')).toBe('true');
  });
});
