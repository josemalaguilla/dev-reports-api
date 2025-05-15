import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class DevelopersFindFilter {
  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Name that must have the developers to retrieve',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Last name that must have the developers to retrieve',
  })
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({
    required: false,
    description: 'Email that must have the developers to retrieve',
  })
  email?: string;
}
