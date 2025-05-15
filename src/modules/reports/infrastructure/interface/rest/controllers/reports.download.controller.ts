import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DownloadReportUseCase } from 'src/modules/reports/application/use-cases/download-report.use-case';
import { ReportNotFoundError } from 'src/modules/reports/domain/errors/report-not-found.error';
import { ReportNotGeneratedError } from 'src/modules/reports/domain/errors/report-not-generated.error';
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
} from '../docs/reports.rest.examples';

@ApiTags('reports')
@Controller('reports')
export class ReportsDownloadController {
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.DOWNLOAD_REPORT_USE_CASE)
    private readonly downloadReportUseCase: DownloadReportUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the report to download',
  })
  @ApiResponse({
    status: 200,
    description: 'Report file downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
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
    description: 'Bad request - Report not generated yet',
    examples: ReportBadRequestErrorExamples,
  })
  async download(@Param('id') id: string, @Res() res: Response): Promise<void> {
    this.logger.log('GET /reports/:id/download', { id });
    try {
      const file = await this.downloadReportUseCase.run(new ReportId(id));
      this.logger.log('Report file downloaded successfully', { id });
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.fileName}"`,
      );
      res.send(file.buffer);
    } catch (error) {
      this.logger.error('Error downloading report file', {
        id,
        error: error.message,
      });
      if (error instanceof ReportNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReportNotGeneratedError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidArgumentError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
