import { mockContext, MockedContext } from '../contextMocker';
import FunctionMocker from '../FunctionMocker';
import { MockedRequest, mockRequest } from '../requestMocker';

describe('FunctionMocker', () => {
  const genericFunc = (context: MockedContext) => context.done();

  /**
   * Dies if Request-object is missing, resolves if not
   * @param context
   * @param req
   */
  const httpFuncWithReq = (context: MockedContext, req: MockedRequest) => {
    if (!req) { throw new Error('Cannot find Request Object'); }

    context.res = { status: 200, body: { message: 'Success' } };
    context.done();
  };

  /**
   * Test-function which requires the Request object as second argument,
   * and returns a Promise (implicit through async/await).
   * @param {*} context
   * @param {*} req
   */
  const httpFuncWithReqUsingAsyncAwait = async (context: MockedContext, req: MockedRequest) => {
    if (!req) { throw new Error('Cannot find Request Object'); }

    context.res = { status: 200, body: { message: 'Success' } };
    return;
  };

  it('Resolves functions when bindings is not required', async () => {
    const func = new FunctionMocker(genericFunc);

    const runner = func.run();

    await expect(runner).resolves.toBeTruthy();
  });

  /**
   * Including a Request-object on an HttpTriggered function is optional.
   * We must therefore ensure that FunctionMocker fails gracefully if the function
   * requires the object, but it's undefined.
   */
  it('Rejects HttpTriggered function without a required Request-object', async () => {
    const func = new FunctionMocker(httpFuncWithReq);

    const runner = func.run();

    await expect(runner).rejects.toBeTruthy();
  });

  it('Resolves HttpTriggered function with a required Request-object', async () => {
    const func = new FunctionMocker(httpFuncWithReq);

    const runner = func.run(mockRequest('GET'));

    await expect(runner).resolves.toBeTruthy();
  });

  it('Resolves when function uses `context.done()` to complete', async () => {
    const func = new FunctionMocker(httpFuncWithReq);

    const runner = func.run(mockRequest('GET'));

    await expect(runner).resolves.toBeTruthy();
  });

  it('Resolves when function uses `async/await` to complete', async () => {
    const func = new FunctionMocker(httpFuncWithReqUsingAsyncAwait);

    const runner = func.run(mockRequest('GET'));

    await expect(runner).resolves.toBeTruthy();
  });
});
