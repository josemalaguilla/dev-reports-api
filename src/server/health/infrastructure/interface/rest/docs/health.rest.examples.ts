export const HealthGETResponseSuccessExamples = {
  status: 'ok',
  details: {
    database: {
      status: 'up',
    },
  },
};

export const HealthGETResponseErrorExamples = {
  status: 'error',
  details: {
    database: {
      status: 'down',
      message: 'Could not connect',
    },
  },
};
