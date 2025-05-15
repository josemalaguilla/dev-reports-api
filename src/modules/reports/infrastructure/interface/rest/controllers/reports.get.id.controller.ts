import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindReportByIdUseCase } from 'src/modules/reports/application/use-cases/find-report-by-id.use-case';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
import { ReportNotFoundError } from 'src/modules/reports/domain/errors/report-not-found.error';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import { REPORT_SYMBOLS } from 'src/modules/reports/reports.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import {
  ReportBadRequestErrorExamples,
  ReportNotFoundErrorExample,
  ReportsPOSTResponseExamples,
} from '../docs/reports.rest.examples';

@ApiTags('reports')
@Controller('reports')
export class ReportsGetIdController {
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.FIND_REPORT_BY_ID_USE_CASE)
    private readonly findReportByIdUseCase: FindReportByIdUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find report by id' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the report to find',
  })
  @ApiResponse({
    status: 200,
    description: 'Report found successfully',
    content: {
      'application/json': {
        example: ReportsPOSTResponseExamples,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
    examples: ReportNotFoundErrorExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid id',
    examples: ReportBadRequestErrorExamples,
  })
  async findById(@Param('id') id: string): Promise<ReportWithPrimitives> {
    this.logger.log('GET /reports/:id', { id });
    try {
      const result = await this.findReportByIdUseCase.run(new ReportId(id));
      this.logger.log('Report found successfully', { id });
      return result;
    } catch (error) {
      this.logger.error('Error finding report', { id, error: error.message });
      if (error instanceof ReportNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
