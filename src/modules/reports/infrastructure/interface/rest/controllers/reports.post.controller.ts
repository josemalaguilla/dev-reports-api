import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateReportUseCase } from 'src/modules/reports/application/use-cases/create-report.use-case';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
import { ReportDatesInvalidError } from 'src/modules/reports/domain/errors/report-dates-invalid.error';
import { ReportTargetInvalidError } from 'src/modules/reports/domain/errors/report-target-invalid.error';
import { ReportEndDate } from 'src/modules/reports/domain/value-objects/report.end.date';
import { ReportStartDate } from 'src/modules/reports/domain/value-objects/report.start.date';
import { ReportTarget } from 'src/modules/reports/domain/value-objects/report.target';
import { ReportTargetId } from 'src/modules/reports/domain/value-objects/report.target.id';
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
  ReportInvalidDatesErrorExample,
  ReportInvalidTargetErrorExample,
  ReportsPOSTExamples,
  ReportsPOSTResponseExamples,
} from '../docs/reports.rest.examples';
import { CreateReportRequest } from '../dtos/create.report.request';

@ApiTags('reports')
@Controller('reports')
export class ReportsPostController {
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.CREATE_REPORT_USE_CASE)
    private readonly createReportUseCase: CreateReportUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiBody({
    type: CreateReportRequest,
    required: true,
    description: 'Report data',
    examples: ReportsPOSTExamples,
  })
  @ApiResponse({
    status: 201,
    description: 'Report successfully created',
    content: {
      'application/json': {
        example: ReportsPOSTResponseExamples,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: {
      ...ReportBadRequestErrorExamples,
      ...ReportInvalidTargetErrorExample,
      ...ReportInvalidDatesErrorExample,
    },
  })
  async create(
    @Body() request: CreateReportRequest,
  ): Promise<ReportWithPrimitives> {
    this.logger.log('POST /reports', { body: request });
    try {
      const result = await this.createReportUseCase.run(
        new ReportTarget(request.target),
        new ReportTargetId(request.targetId),
        new ReportStartDate(request.startDate),
        new ReportEndDate(request.endDate),
      );
      this.logger.log('Report created successfully', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Error creating report', { error: error.message });
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ReportTargetInvalidError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ReportDatesInvalidError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
