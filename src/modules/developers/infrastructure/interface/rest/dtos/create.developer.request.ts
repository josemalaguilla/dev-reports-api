import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RequestBody } from 'src/shared/core/infrastructure/rest/request.body';

export class CreateDeveloperRequest implements RequestBody {
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  @ApiProperty({ required: true, description: 'Developer name' })
  name: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiProperty({ required: false, description: 'Developer last name' })
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({ required: true, description: 'Developer email' })
  email: string;
}
