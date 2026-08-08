import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription } from '../registry/acongm/ui/alert';
import { Button } from '../registry/acongm/ui/button';
import { Input } from '../registry/acongm/ui/input';
import { Label } from '../registry/acongm/ui/label';
import { Separator } from '../registry/acongm/ui/separator';
import { Skeleton } from '../registry/acongm/ui/skeleton';
import { ThemeToggle } from '../registry/acongm/ui/theme-toggle';

describe('Acongm UI accessibility', () => {
  it('has no axe violations in a representative primitive composition', async () => {
    const { container } = render(
      <main>
        <Label htmlFor="search">搜索</Label>
        <Input id="search" name="search" />
        <Button>提交</Button>
        <Separator />
        <Alert>
          <AlertDescription>内容已保存。</AlertDescription>
        </Alert>
        <Skeleton className="h-4 w-20" />
        <ThemeToggle showLabel={false} />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    expect(results.violations.map(({ id, help }) => ({ id, help }))).toEqual([]);
  });
});
