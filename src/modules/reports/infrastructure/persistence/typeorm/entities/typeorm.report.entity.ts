import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { ReportStatuses } from '../../../../domain/value-objects/report.status';
import { ReportTargets } from '../../../../domain/value-objects/report.target';

@Entity('report')
export class TypeORMReportEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    enum: Object.values(ReportTargets),
    nullable: false,
  })
  target: string;

  @Column({ nullable: false })
  createdAt: DateString;

  @Column({
    enum: Object.values(ReportStatuses),
    default: ReportStatuses.PENDING,
    nullable: false,
  })
  status: string;

  @Column({ nullable: true })
  developerId?: string;

  @Column({ nullable: false })
  startDate: DateString;

  @Column({ nullable: false })
  endDate: DateString;

  @Column({ nullable: true })
  generatedAt?: DateString;

  @Column({ nullable: true })
  generatedFile?: string;

  @Column({ nullable: true })
  errorMessages?: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: DateString;
}
