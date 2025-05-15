import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDeveloperRequest {
  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ required: false, description: 'Developer name to set' })
  name?: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ required: false, description: 'Developer last name to set' })
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({ required: false, description: 'Developer email to set' })
  email?: string;
}
