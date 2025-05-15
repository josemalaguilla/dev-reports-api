const BASE_DEVELOPER_EXAMPLE = {
  id: '9adb3114-620e-433e-a3c9-0057cdfda097',
  name: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  status: 'ACTIVE',
};

export const DevelopersPOSTExamples = {
  'Complete developer': {
    value: {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
};

export const DevelopersPOSTResponseExamples = BASE_DEVELOPER_EXAMPLE;

export const DevelopersGETExamples = {
  'Filter by multiple fields': {
    value: {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
  'Filter by name': {
    value: {
      name: 'John',
    },
  },
  'Filter by last name': {
    value: {
      lastName: 'Doe',
    },
  },
  'Filter by email': {
    value: {
      email: 'john.doe@example.com',
    },
  },
};

export const DevelopersGETResponseExamples = {
  items: [
    {
      id: '9adb3114-620e-433e-a3c9-0057cdfda097',
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: 'ACTIVE',
    },
    {
      id: '8bdc4379-620e-433e-a3c9-0057cdfda098',
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      status: 'ACTIVE',
    },
  ],
  total: 40,
};

export const DevelopersGETByIdExamples = {
  'Basic fields': {
    value: ['id', 'name', 'lastName', 'email'],
  },
  'All fields': {
    value: ['id', 'name', 'lastName', 'email', 'status', 'deletedAt'],
  },
};

export const DevelopersGETByIdResponseExamples = BASE_DEVELOPER_EXAMPLE;

export const DevelopersPATCHExamples = {
  'Update multiple fields': {
    value: {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
  'Update name': {
    value: {
      name: 'John',
    },
  },
  'Update last name': {
    value: {
      lastName: 'Doe',
    },
  },
  'Update email': {
    value: {
      email: 'john.doe@example.com',
    },
  },
};

export const DevelopersPATCHResponseExamples = BASE_DEVELOPER_EXAMPLE;

export const DeveloperBadRequestErrorExamples = {
  'Invalid input': {
    summary: 'Invalid input',
    value: {
      message: [
        'name must be a string',
        'name should not be empty',
        'email must be an email',
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

export const DeveloperDuplicateEmailErrorExample = {
  'Duplicate email': {
    summary: 'Duplicate email',
    value: {
      message:
        'Already exists an instance for the given email john.doe@example.com',
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const DeveloperNotFoundErrorExample = {
  message: 'Developer with id 6cxy3114-620e-433e-a3c9-0057cdfda097 not found',
  error: 'Not Found',
  statusCode: 404,
};
