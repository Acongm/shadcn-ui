import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '../registry/acongm/ui/alert';
import { Badge } from '../registry/acongm/ui/badge';
import { Button } from '../registry/acongm/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../registry/acongm/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '../registry/acongm/ui/field';
import { Input } from '../registry/acongm/ui/input';
import { Separator } from '../registry/acongm/ui/separator';
import { Skeleton } from '../registry/acongm/ui/skeleton';
import { ThemeToggle } from '../registry/acongm/ui/theme-toggle';

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  expect(results.violations.map(({ id, help }) => ({ id, help }))).toEqual([]);
}

describe('Acongm UI accessibility', () => {
  it('has no axe violations in a representative core-ui composition', async () => {
    const { container } = render(
      <main>
        <Field>
          <FieldLabel htmlFor="search">搜索</FieldLabel>
          <Input id="search" name="search" aria-describedby="search-help" />
          <FieldDescription id="search-help">输入关键字查询内容。</FieldDescription>
        </Field>
        <Button>提交</Button>
        <Badge render={<a href="/docs" />}>文档</Badge>
        <Separator />
        <Card>
          <CardHeader><CardTitle>同步状态</CardTitle><CardDescription>跨项目 UI 已同步。</CardDescription></CardHeader>
          <CardContent>最近同步：今天</CardContent>
        </Card>
        <Alert><AlertTitle>提示</AlertTitle><AlertDescription>内容已保存。</AlertDescription></Alert>
        <FieldError>示例校验错误</FieldError>
        <Skeleton className="h-4 w-20" aria-hidden="true" />
      </main>,
    );
    await expectNoAxeViolations(container);
  });

  it('has no axe violations in the Acongm platform theme recipe', async () => {
    const { container } = render(<ThemeToggle showLabel={false} />);
    await expectNoAxeViolations(container);
  });
});
