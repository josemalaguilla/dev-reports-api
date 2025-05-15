import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeORMTestMemoryDatabase = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: ['**/typeorm.*.entity.ts'],
  synchronize: true,
});
