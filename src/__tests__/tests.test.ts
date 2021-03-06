import * as ts from 'typescript';
import transformer from '../index';

const fakeProgram = {} as any;

describe('ts-transform-define', () => {
  it('should replace string literal', () => {
    const actual = ts.transpileModule(
      `
      if (process.env.NODE_ENV === 'development') {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`process.env.NODE_ENV`]: '"development"',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (\\"development\\" === 'development') {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace boolean literal', () => {
    const actual = ts.transpileModule(
      `
      if (__SERVER__) {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`__SERVER__`]: true,
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (true) {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace expression', () => {
    const actual = ts.transpileModule(
      `
      if (typeof window === 'undefined') {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`typeof window`]: '"undefined"',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (\\"undefined\\" === 'undefined') {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace with environment variable from boolean', () => {
    process.env.LMAO = 'true';

    const actual = ts.transpileModule(
      `
      if (process.env.LMAO === true) {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`process.env.LMAO`]: 'process.env.LMAO',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
          "if (true === true) {
              console.log('hello world');
          }
          "
      `);
  });

  it('should replace with environment variable from string', () => {
    process.env.ENVY_ENV = '"production"';

    const actual = ts.transpileModule(
      `
      if (process.env.NODE_ENV === 'production') {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`process.env.NODE_ENV`]: 'process.env.ENVY_ENV',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (\\"production\\" === 'production') {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace with environment variable from expression', () => {
    process.env.ENVY_ENV = 'typeof window';

    const actual = ts.transpileModule(
      `
      if (typeof window === 'production') {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                [`typeof window`]: 'process.env.ENVY_ENV',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (typeof window === 'production') {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace function expression', () => {
    process.env.ENVY_ENV = 'true';

    const actual = ts.transpileModule(
      `
      if (isNodeEnvironment()) {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                'isNodeEnvironment()': 'process.env.ENVY_ENV',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (true) {
          console.log('hello world');
      }
      "
    `);
  });

  it('should replace function expression with false', () => {
    process.env.ENVY_ENV = 'false';

    const actual = ts.transpileModule(
      `
      if (isNodeEnvironment()) {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                'isNodeEnvironment()': 'process.env.ENVY_ENV',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (false) {
          console.log('hello world');
      }
      "
    `);
  });

  it('should do nothing if env isnt set', () => {
    const actual = ts.transpileModule(
      `
      if (isNodeEnvironment()) {
        console.log('hello world');
      }
    `,
      {
        transformers: {
          before: [
            transformer(fakeProgram, {
              replace: {
                'isNodeEnvironment()': 'process.env.NOT_EXIST',
              },
            }),
          ],
        },
      }
    );

    expect(actual.outputText).toMatchInlineSnapshot(`
      "if (isNodeEnvironment()) {
          console.log('hello world');
      }
      "
    `);
  });
});
