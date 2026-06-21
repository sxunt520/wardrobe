import { ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';

import { OperlogInterceptor } from './operlog.interceptor';

describe('OperlogInterceptor', () => {
  it('uses the handler name when swagger operation metadata is missing', async () => {
    const logService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };
    const interceptor = new OperlogInterceptor(logService as any);
    const undecoratedHandler = () => undefined;
    const context = {
      getHandler: () => undecoratedHandler,
    } as unknown as ExecutionContext;

    await expect(lastValueFrom(interceptor.intercept(context, { handle: () => of({ code: 200 }) }))).resolves.toEqual({ code: 200 });
    expect(logService.logAction).toHaveBeenCalledWith(expect.objectContaining({ title: 'undecoratedHandler' }));
  });
});
