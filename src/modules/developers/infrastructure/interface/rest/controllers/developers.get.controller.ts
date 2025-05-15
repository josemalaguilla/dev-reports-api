import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeveloperFilterQuery } from 'src/modules/developers/application/dtos/developer.filter.query';
import { DevelopersPaginatedList } from 'src/modules/developers/application/dtos/developers.paginated-list';
import { FindDevelopersUseCase } from 'src/modules/developers/application/use-cases/find-developers.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { Limit } from 'src/shared/persistence/domain/criteria/limit';
import { Offset } from 'src/shared/persistence/domain/criteria/offset';
import {
  DeveloperBadRequestErrorExamples,
  DevelopersGETExamples,
  DevelopersGETResponseExamples,
} from '../docs/developers.rest.examples';
import { DevelopersFindFilter } from '../dtos/developers.find.filter';

@ApiTags('developers')
@Controller('developers')
export class DevelopersGetController {
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.FIND_DEVELOPERS_USE_CASE)
    private readonly findDevelopersUseCase: FindDevelopersUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Find all developers' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of developers to retrieve',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset of the developers to retrieve',
  })
  @ApiQuery({
    name: 'where',
    required: false,
    type: DevelopersFindFilter,
    description: 'Filter for the results',
    examples: DevelopersGETExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'List of developers retrieved successfully',
    example: DevelopersGETResponseExamples,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: DeveloperBadRequestErrorExamples,
  })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('where') where?: DevelopersFindFilter | string,
  ): Promise<DevelopersPaginatedList> {
    this.logger.log('GET /developers', { limit, offset, where });
    try {
      const result = await this.findDevelopersUseCase.run(
        limit !== null && limit !== undefined && new Limit(parseInt(limit)),
        offset !== null && offset !== undefined && new Offset(parseInt(offset)),
        typeof where === 'string'
          ? where && DeveloperFilterQuery.fromStringWhere(where)
          : where && DeveloperFilterQuery.fromPrimitive(where),
      );
      this.logger.log('Developers retrieved successfully', {
        count: result.items.length,
        total: result.total,
      });
      return result;
    } catch (error) {
      this.logger.error('Error finding developers', { error: error.message });
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
