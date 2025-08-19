declare module "picomatch" {
  export interface PicomatchOptions {
    nocase?: boolean;
  }

  export type Matcher = (str: string) => boolean;

  function picomatch(
    glob: string | string[],
    options?: PicomatchOptions
  ): Matcher;
  export default picomatch;
}
