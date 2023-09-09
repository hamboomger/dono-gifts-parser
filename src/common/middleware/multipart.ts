import { Request, RequestHandler } from 'express'
import Busboy from 'busboy'
import { Fls } from '@flares/pascal-case-code-flares'

const MAX_CONTENT_LENGTH_MB = 4

interface ParseOptions {
  filesNumber: 'single' | 'multiple'
  field: string
}

export class StorageFile {
  readonly buffer: Buffer
  readonly name: string
  readonly sizeInKb: number

  constructor(buffer: Buffer, name: string, sizeInKb?: number) {
    this.buffer = buffer
    this.name = name
    this.sizeInKb = sizeInKb ?? Buffer.byteLength(buffer) / 1024
  }
}

export function isStorageFile(obj: any): obj is StorageFile {
  return obj.name !== undefined && obj.sizeInKb !== undefined
}

function checkForMaxContentLength(req: Request) {
  // TODO find a reliable way to get request content length
  if (req.headers['Content-Length'] === undefined) {
    throw Fls.LengthRequired411()
  }

  const contentLengthBytes = parseInt(req.headers['Content-Length'] as string)
  const contentLengthKb = Math.ceil(contentLengthBytes / 1024)
  if (contentLengthKb > MAX_CONTENT_LENGTH_MB * 1024) {
    throw Fls.PayloadTooLarge413()
  }
}

const parseMultipartData = {
  singleFile: <P, ResBody, ReqBody, ReqQuery>(field: string) => {
    return _parseMultipartData<P, ResBody, ReqBody, ReqQuery>({
      filesNumber: 'single',
      field,
    })
  },
  multipleFiles: <P, ResBody, ReqBody, ReqQuery>(field: string) => {
    return _parseMultipartData<P, ResBody, ReqBody, ReqQuery>({
      filesNumber: 'multiple',
      field,
    })
  },
}

/**
 * This middleware handles multipart/form-data request payload and
 * behaves similarly to the multer library (which won't work with Google Cloud Functions):
 *  - all fields are mapped to the req.body
 *  - all files are mapped to the req.files
 *
 *  TODO create factory method to specify files fields and max number per request
 */
function _parseMultipartData<P, ResBody, ReqBody, ReqQuery>(
  options: ParseOptions,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, ers, next) => {
    if (!['POST', 'PUT'].includes(req.method)) {
      throw Fls.MethodNotAllowed405(
        `Failed to parse multipart/form-data as the request method(${req.method} is not POST/PUT`,
      )
    }
    const contentType = req.header('content-type')
    if (contentType === undefined) {
      throw Fls.BadRequest400('Content-Type is not provided')
    }
    if (!req.is('multipart/form-data')) {
      throw Fls.UnsupportedMediaType415(
        `Content-Type is not multipart/form-data (${contentType} instead)`,
      )
    }

    const fields: any = {}
    const files: { [field: string]: StorageFile[] } = {}
    let singleFile: StorageFile

    const busboy = new Busboy({ headers: req.headers })
    busboy.on('field', (fieldName, val) => {
      fields[fieldName] = val
    })
    busboy.on('file', (fieldName, file, filename) => {
      const buffers: Buffer[] = []
      file.on('data', (d) => buffers.push(d))
      file.on('end', () => {
        const fileBuffer = Buffer.concat(buffers)
        if (options.filesNumber === 'single') {
          if (singleFile !== undefined) {
            throw Fls.BadRequest400(
              'Single file expected, got multiple instead',
            )
          }
          singleFile = new StorageFile(fileBuffer, filename)
        } else {
          if (files[fieldName] !== undefined) {
            files[fieldName].push(new StorageFile(fileBuffer, filename))
          } else {
            files[fieldName] = [new StorageFile(fileBuffer, filename)]
          }
        }
      })
    })
    busboy.on('finish', () => {
      req.body = fields
      if (options.filesNumber === 'single') {
        req.file = singleFile
      } else {
        req.files = files
      }

      next()
    })
    // @ts-expect-error req.rawBody is produced by the cloud functions sdk and does not contain @type annotation
    busboy.end(req.rawBody)
  }
}

export default parseMultipartData
