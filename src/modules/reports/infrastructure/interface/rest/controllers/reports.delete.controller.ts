import {
  BadRequestException,
  Controller,
  Delete,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteReportUseCase } from 'src/modules/reports/application/use-cases/delete-report.use-case';
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
} from '../docs/reports.rest.examples';

@ApiTags('reports')
@Controller('reports')
export class ReportsDeleteController {
  private readonly logger: Logger;

  constructor(
    @Inject(REPORT_SYMBOLS.DELETE_REPORT_USE_CASE)
    private readonly deleteReportUseCase: DeleteReportUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the report to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully',
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
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log('DELETE /reports/:id', { id });
    try {
      await this.deleteReportUseCase.run(new ReportId(id));
      this.logger.log('Report deleted successfully', { id });
    } catch (error) {
      this.logger.error('Error deleting report', {
        id,
        error: error.message,
      });
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
