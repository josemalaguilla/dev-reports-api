import { lookup } from 'mime-types';
import * as path from 'path';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Printable } from 'src/shared/core/domain/value-object/printable';

export class File implements Printable {
  private _buffer: Buffer;
  private _fileName: string;
  private _fileExtension: string;
  private _mimeType: string;

  constructor(buffer: Buffer, fileName: string) {
    this.ensureBufferIsValid(buffer);
    this.ensureFileNameIsValid(fileName);
    this._buffer = buffer;
    this._fileName = fileName;
    this.identifyFileExtension();
    this.identifyMimeType();
  }

  private ensureBufferIsValid(buffer: Buffer) {
    if (!buffer) {
      throw new InvalidArgumentError(
        `Buffer is required to build a file. Received ${buffer}`,
      );
    }
  }

  private ensureFileNameIsValid(fileName: string) {
    if (!fileName) {
      throw new InvalidArgumentError(
        `File name is required to build a file. Received ${fileName}`,
      );
    }
  }

  private identifyFileExtension() {
    this._fileExtension = path.extname(this._fileName)?.toLowerCase() || '.txt';
  }

  private identifyMimeType() {
    this._mimeType = lookup(this._fileName) || 'application/octet-stream';
  }

  public get buffer(): Buffer {
    return this._buffer;
  }

  public get fileName(): string {
    return this._fileName;
  }
  public get fileExtension(): string {
    return this._fileExtension;
  }
  public get mimeType(): string {
    return this._mimeType;
  }

  public equals(otherFile: File): boolean {
    return (
      this._buffer.compare(otherFile.buffer) === 0 &&
      this._fileName === otherFile.fileName
    );
  }

  public toString(): string {
    return `(${this.mimeType}) ${this.fileName}.${this.fileExtension}`;
  }
}
