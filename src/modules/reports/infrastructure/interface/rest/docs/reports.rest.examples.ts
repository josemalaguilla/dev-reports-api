import { ReportStatuses } from '../../../../domain/value-objects/report.status';
import { ReportTargets } from '../../../../domain/value-objects/report.target';

const today = new Date();
const exampleDate = today.toISOString();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const ReportsPOSTExamples = {
  daily: {
    summary: 'Developer report',
    value: {
      target: ReportTargets.developer,
      targetId: {
        developerId: '123e4567-e89b-12d3-a456-426614174000',
      },
      startDate: yesterday.toISOString(),
      endDate: exampleDate,
    },
  },
};

export const ReportsPOSTResponseExamples = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  target: ReportTargets.developer,
  createdAt: exampleDate,
  status: ReportStatuses.PENDING,
  targetId: {
    developerId: '123e4567-e89b-12d3-a456-426614174000',
  },
  startDate: yesterday.toISOString(),
  endDate: exampleDate,
};

export const ReportsGETExamples = {
  byTarget: {
    summary: 'Filter by target',
    value: {
      target: ReportTargets.developer,
    },
  },
  byStatus: {
    summary: 'Filter by status',
    value: {
      status: ReportStatuses.COMPLETED,
    },
  },
  byTargetAndStatus: {
    summary: 'Filter by target and status',
    value: {
      target: ReportTargets.developer,
      status: ReportStatuses.PENDING,
    },
  },
  byDeveloperId: {
    summary: 'Filter by developer ID',
    value: {
      developerId: '123e4567-e89b-12d3-a456-426614174000',
    },
  },
  byDateRange: {
    summary: 'Filter by date range',
    value: {
      startDate: yesterday.toISOString(),
      endDate: exampleDate,
    },
  },
};

export const ReportsGETResponseExamples = {
  items: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      target: ReportTargets.developer,
      createdAt: exampleDate,
      status: ReportStatuses.PENDING,
      targetId: {
        developerId: '123e4567-e89b-12d3-a456-426614174000',
      },
      startDate: yesterday.toISOString(),
      endDate: exampleDate,
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      target: ReportTargets.developer,
      createdAt: exampleDate,
      status: ReportStatuses.COMPLETED,
      targetId: {
        developerId: '123e4567-e89b-12d3-a456-426614174001',
      },
      startDate: yesterday.toISOString(),
      endDate: exampleDate,
      generatedAt: exampleDate,
      generatedFile: 'reports/123e4567-e89b-12d3-a456-426614174001/report.pdf',
    },
  ],
  total: 2,
};

export const ReportNotFoundErrorExample = {
  notFound: {
    summary: 'Report not found',
    value: {
      statusCode: 404,
      message: 'Report with id 123e4567-e89b-12d3-a456-426614174000 not found',
      error: 'Not Found',
    },
  },
};

export const ReportBadRequestErrorExamples = {
  'Invalid input': {
    summary: 'Invalid input',
    value: {
      message: [
        'target must be a string',
        'target should not be empty',
        'startDate must be a date',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  'Invalid format': {
    summary: 'Invalid format',
    value: {
      message: 'The uuid 507f1f77bcf86cd799439011 is not valid',
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const ReportInvalidTargetErrorExample = {
  'Invalid target': {
    summary: 'Invalid target',
    value: {
      message:
        "The given target developer is not valid with the given target id { teamId: '123e4567-e89b-12d3-a456-427814174023'}",
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const ReportInvalidDatesErrorExample = {
  'Invalid dates': {
    summary: 'Invalid dates',
    value: {
      message:
        'The given dates are not valid 2025-02-03T17:39:33.443Z - 2024-12-23T08:30:22.362Z. End date must be after start date',
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};
