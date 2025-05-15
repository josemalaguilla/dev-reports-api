import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { DeveloperStatuses } from '../../../../domain/value-objects/developer.status';

@Entity('developer')
export class TypeORMDeveloperEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column({
    enum: Object.values(DeveloperStatuses),
    default: DeveloperStatuses.ACTIVE,
    nullable: false,
  })
  status: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: DateString;
}
