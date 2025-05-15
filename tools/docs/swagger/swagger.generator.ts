import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

declare type PackageJSON = {
  name: string;
  description: string;
  author: string;
  contactEmail: string;
  version: string;
  license: string;
};

export class SwaggerGenerator {
  private app: NestExpressApplication;
  private config: DocumentBuilder;

  constructor() {
    this.config = new DocumentBuilder();
  }

  public withApp(app: NestExpressApplication) {
    this.app = app;
    return this;
  }

  public withPackageJSON() {
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json file not found');
    }
    const packageFileContent = fs.readFileSync('package.json', 'utf8');
    const packageJson: PackageJSON = JSON.parse(packageFileContent);
    this.config
      .setVersion(packageJson.version)
      .setTitle(packageJson.name)
      .setDescription(packageJson.description)
      .setContact(packageJson.author, '', packageJson.contactEmail)
      .setLicense(packageJson.license, '');
    return this;
  }

  public saveOnDisk(): OpenAPIObject {
    const document = SwaggerModule.createDocument(
      this.app,
      this.config.build(),
    );
    fs.writeFileSync('docs/swagger.json', JSON.stringify(document, null, 2));
    return document;
  }
}
