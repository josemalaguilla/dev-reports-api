import { File } from './file';
import { FilePath } from './file.path';

export interface FileRepository {
  writeFile(file: File, filePath: FilePath): Promise<void>;
  readFile(filePath: FilePath): Promise<File>;
}
