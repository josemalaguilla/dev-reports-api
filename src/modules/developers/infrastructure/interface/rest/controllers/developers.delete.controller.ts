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
import { DeleteDeveloperUseCase } from 'src/modules/developers/application/use-cases/delete-developer.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { DeveloperNotFoundError } from 'src/modules/developers/domain/errors/developer.not-found.error';
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
} from '../docs/developers.rest.examples';

@ApiTags('developers')
@Controller('developers')
export class DevelopersDeleteController {
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.DELETE_DEVELOPER_USE_CASE)
    private readonly deleteDeveloperUseCase: DeleteDeveloperUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete developer' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the developer to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Developer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Developer not found',
    example: DeveloperNotFoundErrorExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid id',
    examples: DeveloperBadRequestErrorExamples,
  })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log('DELETE /developers/:id', { id });
    try {
      await this.deleteDeveloperUseCase.run(new DeveloperId(id));
      this.logger.log('Developer deleted successfully', { id });
    } catch (error) {
      this.logger.error('Error deleting developer', {
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
