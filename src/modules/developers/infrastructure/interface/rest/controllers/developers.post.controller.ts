import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDeveloperUseCase } from 'src/modules/developers/application/use-cases/create-developer.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
import { DuplicateEmailError } from 'src/modules/developers/domain/errors/duplicate.email.error';
import { DeveloperEmail } from 'src/modules/developers/domain/value-objects/developer.email';
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
  DevelopersPOSTExamples,
  DevelopersPOSTResponseExamples,
} from '../docs/developers.rest.examples';
import { CreateDeveloperRequest } from '../dtos/create.developer.request';

@ApiTags('developers')
@Controller('developers')
export class DevelopersPostController {
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.CREATE_DEVELOPER_USE_CASE)
    private readonly createDeveloperUseCase: CreateDeveloperUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.rest)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new developer' })
  @ApiBody({
    type: CreateDeveloperRequest,
    required: true,
    description: 'Developer data',
    examples: DevelopersPOSTExamples,
  })
  @ApiResponse({
    status: 201,
    description: 'Developer successfully created',
    content: {
      'application/json': {
        example: DevelopersPOSTResponseExamples,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    examples: {
      ...DeveloperDuplicateEmailErrorExample,
      ...DeveloperBadRequestErrorExamples,
    },
  })
  async create(
    @Body() request: CreateDeveloperRequest,
  ): Promise<DeveloperWithPrimitives> {
    this.logger.log('POST /developers', { body: request });
    try {
      const result = await this.createDeveloperUseCase.run(
        new DeveloperName(request.name),
        new DeveloperEmail(request.email),
        request.lastName && new DeveloperLastName(request.lastName),
      );
      this.logger.log('Developer created successfully', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Error creating developer', { error: error.message });
      if (
        error instanceof DuplicateEmailError ||
        error instanceof InvalidArgumentError
      ) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
