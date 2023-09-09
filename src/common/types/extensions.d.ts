// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace Express {
  // These open interfaces may be extended in an application-specific manner via declaration merging.
  // See for example method-override.d.ts
  // (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
  interface Request {
    user?: {
      uid: string
      email: string
    }
    // for multipart/form-data requests
    files: {
      [fieldName: string]: Array<{ name: string; buffer: Buffer }>
    }
    file?: { name: string; buffer: Buffer }
  }
}
