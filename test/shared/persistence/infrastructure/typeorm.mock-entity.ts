import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TypeORMMockEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  lastName: string;
}
