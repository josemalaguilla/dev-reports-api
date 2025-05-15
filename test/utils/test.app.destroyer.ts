import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

export class TestAppDestroyer {
  public async destroyApp(app: NestExpressApplication): Promise<void> {
    const datasource = app.get<DataSource>(DataSource);
    datasource.destroy();
    await app.close();
  }
}
