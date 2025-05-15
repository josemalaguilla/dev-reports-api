import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { File } from '../../../../src/shared/file/domain/file';

export class FileMother {
  public static random(): File {
    const randomizer = RandomizerStore.get();
    return new File(
      Buffer.from(JSON.stringify({ name: randomizer.alphaString() })),
      randomizer.fileName(),
    );
  }
}
