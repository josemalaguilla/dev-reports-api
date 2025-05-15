import { File } from 'src/shared/file/domain/file';
import { FilePath } from 'src/shared/file/domain/file.path';

export interface ReportFileRepository {
  writeFile(file: File, filePath: FilePath): Promise<void>;
  readFile(filePath: FilePath): Promise<File>;
}
