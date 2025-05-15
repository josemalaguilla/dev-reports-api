import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { File } from '../../domain/file';
import { FilePath } from '../../domain/file.path';
import { FileRepository } from '../../domain/file.repository';

export class S3FileRepository implements FileRepository {
  constructor(
    private readonly client: S3Client,
    private readonly bucketName: string,
  ) {}

  public async writeFile(file: File, filePath: FilePath): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filePath.value(),
      Body: file.buffer,
      ContentType: file.mimeType,
    });
    await this.client.send(command);
  }

  public async readFile(filePath: FilePath): Promise<File> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: filePath.value(),
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as Readable) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return new File(buffer, filePath.value());
  }
}
