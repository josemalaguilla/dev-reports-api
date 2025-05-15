import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FindOneDeveloperUseCase,
  ProjectedDeveloper,
} from 'src/modules/developers/application/use-cases/find-one-developer.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { DeveloperNotFoundError } from 'src/modules/developers/domain/errors/developer.not-found.error';
import { DeveloperFields } from 'src/modules/developers/domain/value-objects/developer.fields';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import {
  DeveloperBadRequestErrorExamples,
  DeveloperNotFoundErrorExample,
  DevelopersGETByIdExamples,
  DevelopersGETByIdResponseExamples,
} from '../docs/developers.rest.examples';

@ApiTags('developers')
@Controller('developers')
export class DevelopersGetIdController {
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.FIND_ONE_DEVELOPER_USE_CASE)
    private readonly findOneDeveloperUseCase: FindOneDeveloperUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find developer by id' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the developer to retrieve',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    isArray: true,
    type: [String],
    description: 'Fields to retrieve',
    examples: DevelopersGETByIdExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'Developer found with all fields or only the requested',
    example: DevelopersGETByIdResponseExamples,
  })
  @ApiResponse({
    status: 404,
    description: 'Developer not found',
    example: DeveloperNotFoundErrorExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: DeveloperBadRequestErrorExamples,
  })
  async findOne(
    @Param('id') id: string,
    @Query('fields') fields?: string[] | string,
  ): Promise<ProjectedDeveloper> {
    this.logger.log('GET /developers/:id', { id, fields });
    try {
      const result = await this.findOneDeveloperUseCase.run(
        new DeveloperId(id),
        fields && Array.isArray(fields)
          ? new DeveloperFields(fields)
          : fields && new DeveloperFields(JSON.parse(fields as string)),
      );
      this.logger.log('Developer found successfully', { id });
      return result;
    } catch (error) {
      this.logger.error('Error finding developer', {
        id,
        error: error.message,
      });
      if (error instanceof DeveloperNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
