import { MockAppModuleFactory } from 'test/utils/mock.app.module.factory';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { SwaggerGenerator } from './swagger.generator';

async function generateSwaggerJson() {
  const app = await new TestAppInitializer(new MockAppModuleFactory()).getApp();
  new SwaggerGenerator().withApp(app).withPackageJSON().saveOnDisk();
  await new TestAppDestroyer().destroyApp(app);
  console.log('Swagger JSON file generated successfully!');
}

generateSwaggerJson();
