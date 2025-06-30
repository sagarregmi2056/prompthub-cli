export const promptSchema = {
  type: 'object',
  required: ['id', 'prompt', 'model', 'created_at'],
  properties: {
    id: {
      type: 'string',
      description: 'Unique identifier for the prompt',
    },
    prompt: {
      type: 'string',
      description: 'The prompt text',
    },
    response: {
      type: 'string',
      description: 'The model\'s response (if executed)',
    },
    model: {
      type: 'string',
      description: 'The AI model used',
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'Creation timestamp',
    },
    parent_id: {
      type: ['string', 'null'],
      description: 'ID of the parent prompt (null for root prompts)',
    },
    branch: {
      type: 'string',
      default: 'main',
      description: 'Branch name for collaborative work',
    },
    metadata: {
      type: 'object',
      properties: {
        executed: {
          type: 'boolean',
          description: 'Whether the prompt was executed',
        },
        source: {
          type: 'string',
          enum: ['cli', 'file', 'api'],
          description: 'Source of the prompt',
        },
        metrics: {
          type: 'object',
          description: 'Performance metrics',
          properties: {
            tokens: {
              type: 'number',
              description: 'Token count',
            },
            latency: {
              type: 'number',
              description: 'Response time in ms',
            },
            cost: {
              type: 'number',
              description: 'Cost in USD',
            },
          },
        },
        test_results: {
          type: 'array',
          description: 'A/B test results',
          items: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              comparison_id: {
                type: 'string',
              },
              metrics: {
                type: 'object',
                properties: {
                  accuracy: {
                    type: 'number',
                  },
                  latency: {
                    type: 'number',
                  },
                  tokens: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        ci: {
          type: 'object',
          description: 'CI/CD information',
          properties: {
            pipeline: {
              type: 'string',
            },
            run_id: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['passed', 'failed', 'skipped'],
            },
          },
        },
      },
    },
  },
}; 