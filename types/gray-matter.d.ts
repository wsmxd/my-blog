/* eslint-disable @typescript-eslint/no-explicit-any */
// Local type shim for `gray-matter`
// There is no `@types/gray-matter` on npm; this file provides a minimal declaration
// to silence TypeScript module-not-found errors. Adjust types if you need stricter typing.

declare module "gray-matter" {
  type GrayMatterFile<T = any> = {
    content: string;
    data: T;
    excerpt?: string;
    isEmpty?: boolean;
    orig?: string;
    language?: string;
  };

  function matter<T = any>(input: string): GrayMatterFile<T>;

  export default matter;
}
