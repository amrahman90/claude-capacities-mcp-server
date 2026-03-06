declare module 'unzipper' {
  import { Readable, Writable } from 'stream';

  export interface Entry extends Readable {
    path: string;
    type: 'File' | 'Directory';
    size: number;
    buffer(): Promise<Buffer>;
    autodrain(): void;
  }

  export class ParseStream extends Writable {
    on(event: 'entry', listener: (entry: Entry) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }

  export function Parse(): ParseStream;
}
