import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportFilterQuery } from 'src/modules/reports/application/dtos/report.filter.query';
import { ReportsPaginatedList } from 'src/modules/reports/application/dtos/reports.paginated-list';
import { FindReportsUseCase } from 'src/modules/reports/application/use-cases/find-reports.use-case';
import { ReportStatus } from 'src/modules/reports/domain/value-objects/report.status';
import { ReportTarget } from 'src/modules/reports/domain/value-objects/report.target';
import { REPORT_SYMBOLS } from 'src/modules/reports/reports.symbols';
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
  ReportBadRequestErrorExamples,
  ReportsGETExamples,
  ReportsGETResponseExamples,
} from '../docs/reports.rest.examples';
import { ReportsFindFilter } from '../dtos/reports.find.filter';

@ApiTags('reports')
@Controller('reports')
export class ReportsGetController {
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.FIND_REPORTS_USE_CASE)
    private readonly findReportsUseCase: FindReportsUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Find all reports' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of reports to retrieve',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset of the reports to retrieve',
  })
  @ApiQuery({
    name: 'where',
    required: false,
    type: ReportsFindFilter,
    description: 'Filter for the results',
    examples: ReportsGETExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'List of reports retrieved successfully',
    example: ReportsGETResponseExamples,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: ReportBadRequestErrorExamples,
  })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('where') where?: ReportsFindFilter | string,
  ): Promise<ReportsPaginatedList> {
    this.logger.log('GET /reports', { limit, offset, where });
    try {
      const filterQuery = this.parseWhereFilter(where);
      const result = await this.findReportsUseCase.run(
        limit !== null && limit !== undefined && new Limit(parseInt(limit)),
        offset !== null && offset !== undefined && new Offset(parseInt(offset)),
        filterQuery,
      );
      this.logger.log('Reports retrieved successfully', {
        count: result.items.length,
        total: result.total,
      });
      return result;
    } catch (error) {
      this.logger.error('Error finding reports', { error: error.message });
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  private parseWhereFilter(
    where?: ReportsFindFilter | string,
  ): ReportFilterQuery | undefined {
    if (!where) return undefined;

    let parsedWhere: ReportsFindFilter;
    if (typeof where === 'string') {
      try {
        parsedWhere = JSON.parse(where);
      } catch (error) {
        this.logger.error('Error parsing where reports', {
          error: error.message,
        });
        throw new BadRequestException('Invalid where filter format');
      }
    } else {
      parsedWhere = where;
    }

    return new ReportFilterQuery(
      parsedWhere.target && new ReportTarget(parsedWhere.target),
      parsedWhere.status && new ReportStatus(parsedWhere.status),
      parsedWhere.developerId && new DeveloperId(parsedWhere.developerId),
    );
  }
}
