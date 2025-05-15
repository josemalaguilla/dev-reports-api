import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportStatuses } from '../../../../domain/value-objects/report.status';
import { ReportTargets } from '../../../../domain/value-objects/report.target';

export class ReportsFindFilter {
  @IsOptional()
  @IsEnum(ReportTargets)
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Target that must have the reports to retrieve',
    enum: ReportTargets,
  })
  target?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Developer ID that must have the reports to retrieve',
  })
  developerId?: string;

  @IsOptional()
  @IsEnum(ReportStatuses)
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Status that must have the reports to retrieve',
    enum: ReportStatuses,
  })
  status?: string;
}
