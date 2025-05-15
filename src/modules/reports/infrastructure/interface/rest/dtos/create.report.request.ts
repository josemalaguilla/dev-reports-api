import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RequestBody } from 'src/shared/core/infrastructure/rest/request.body';
import { ReportTargets } from '../../../../domain/value-objects/report.target';

export class TargetIdRequest {
  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Developer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  developerId?: string;
}

export class CreateReportRequest implements RequestBody {
  @IsNotEmpty()
  @IsEnum(ReportTargets)
  @Type(() => String)
  @ApiProperty({
    required: true,
    description: 'Report target',
    enum: ReportTargets,
    example: ReportTargets.developer,
  })
  target: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => TargetIdRequest)
  @ApiProperty({
    required: true,
    description: 'Report target ID',
    type: TargetIdRequest,
    example: {
      developerId: '123e4567-e89b-12d3-a456-426614174000',
    },
  })
  targetId: TargetIdRequest;

  @IsNotEmpty()
  @IsDateString()
  @Type(() => String)
  @ApiProperty({
    required: true,
    description: 'Report start date',
    example: new Date().toISOString(),
  })
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @Type(() => String)
  @ApiProperty({
    required: true,
    description: 'Report end date',
    example: new Date().toISOString(),
  })
  endDate: string;
}
