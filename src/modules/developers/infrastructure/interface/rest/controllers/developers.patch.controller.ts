import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeveloperUpdateQuery } from 'src/modules/developers/application/dtos/developer.update.query';
import { UpdateDeveloperUseCase } from 'src/modules/developers/application/use-cases/update-developer.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
import { DeveloperNotFoundError } from 'src/modules/developers/domain/errors/developer.not-found.error';
import { DuplicateEmailError } from 'src/modules/developers/domain/errors/duplicate.email.error';
import { DeveloperEmail } from 'src/modules/developers/domain/value-objects/developer.email';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { DeveloperLastName } from 'src/modules/developers/domain/value-objects/developer.last.name';
import { DeveloperName } from 'src/modules/developers/domain/value-objects/developer.name';
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
  DeveloperDuplicateEmailErrorExample,
  DeveloperNotFoundErrorExample,
  DevelopersPATCHExamples,
  DevelopersPATCHResponseExamples,
} from '../docs/developers.rest.examples';
import { UpdateDeveloperRequest } from '../dtos/update.developer.request';

@ApiTags('developers')
@Controller('developers')
export class DevelopersPatchController {
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.UPDATE_DEVELOPER_USE_CASE)
    private readonly updateDeveloperUseCase: UpdateDeveloperUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update developer' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Id of the developer to update',
  })
  @ApiBody({
    type: UpdateDeveloperRequest,
    required: true,
    description: 'Values to set on the developer',
    examples: DevelopersPATCHExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'Developer updated successfully',
    example: DevelopersPATCHResponseExamples,
  })
  @ApiResponse({
    status: 404,
    description: 'Developer not found',
    example: DeveloperNotFoundErrorExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: {
      ...DeveloperDuplicateEmailErrorExample,
      ...DeveloperBadRequestErrorExamples,
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateQuery: UpdateDeveloperRequest,
  ): Promise<DeveloperWithPrimitives> {
    this.logger.log('PATCH /developers/:id', { id, body: updateQuery });
    try {
      const result = await this.updateDeveloperUseCase.run(
        new DeveloperId(id),
        new DeveloperUpdateQuery(
          updateQuery.name && new DeveloperName(updateQuery.name),
          updateQuery.lastName && new DeveloperLastName(updateQuery.lastName),
          updateQuery.email && new DeveloperEmail(updateQuery.email),
        ),
      );
      this.logger.log('Developer updated successfully', { id });
      return result;
    } catch (error) {
      this.logger.error('Error updating developer', {
        id,
        error: error.message,
      });
      if (error instanceof DeveloperNotFoundError) {
        throw new NotFoundException(error.message);
      } else if (
        error instanceof DuplicateEmailError ||
        error instanceof InvalidArgumentError
      ) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
