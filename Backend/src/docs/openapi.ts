/**
 * OpenAPI 3.0 specification for the Captiq AI / AIScan API.
 * Served via Swagger UI at /api/docs.
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Captiq AI API',
    version: '1.0.0',
    description: [
      'REST API for Captiq AI (AIScan): account auth, image caption scans, and follow-up chat.',
      '',
      '## Authentication',
      'Protected routes require `Authorization: Bearer <accessToken>`.',
      'Obtain tokens via **Register** or **Login**. Use **Refresh** when the access token expires.',
      '',
      '## Response envelope',
      '- Success: `{ "success": true, "data": ... }`',
      '- Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`',
      '',
      '## Rate limits',
      '- Global: 200 req / 15 min (production), 1000 in development',
      '- Login: 30 / IP / 15 min and 10 / account / 15 min',
      '- Register: 10 / IP / hour',
      '- Password reset: 5 / IP / 15 min',
      '- Refresh: 60 / IP / 15 min',
      '',
      '## AI quotas (UTC day)',
      'Daily scan and follow-up message caps are enforced server-side (env defaults: 20 scans, 50 messages).',
    ].join('\n'),
    contact: {
      name: 'Captiq AI',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local development',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Service health checks',
    },
    {
      name: 'Auth',
      description: 'Registration, login, tokens, password, consent, and account',
    },
    {
      name: 'Scans',
      description: 'Image uploads, captions, and per-scan message threads (requires auth)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from register, login, or refresh',
      },
    },
    schemas: {
      ErrorEnvelope: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            required: ['message'],
            properties: {
              code: {
                type: 'string',
                description: 'Machine-readable error code when available',
                enum: [
                  'UNAUTHORIZED',
                  'FORBIDDEN',
                  'NOT_FOUND',
                  'CONFLICT',
                  'VALIDATION_ERROR',
                  'RATE_LIMITED',
                  'SCAN_QUOTA_EXCEEDED',
                  'MESSAGE_QUOTA_EXCEEDED',
                  'EMAIL_DELIVERY_FAILED',
                  'INTERNAL_SERVER_ERROR',
                ],
              },
              message: { type: 'string' },
            },
          },
        },
      },
      MessageOnly: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
        },
      },
      AuthUser: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
        },
      },
      AuthTokens: {
        type: 'object',
        required: ['accessToken', 'refreshToken', 'user'],
        properties: {
          accessToken: {
            type: 'string',
            description: 'Short-lived JWT for Authorization header',
          },
          refreshToken: {
            type: 'string',
            description: 'Long-lived opaque token for refresh / logout',
          },
          user: { $ref: '#/components/schemas/AuthUser' },
        },
      },
      AuthTokensResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/AuthTokens' },
        },
      },
      UserProfile: {
        type: 'object',
        required: [
          'id',
          'email',
          'createdAt',
          'needsConsent',
          'currentConsentVersion',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          consentVersion: {
            type: 'string',
            nullable: true,
            description: 'Last accepted consent version, if any',
          },
          consentedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          needsConsent: {
            type: 'boolean',
            description: 'True when client must accept currentConsentVersion before AI use',
          },
          currentConsentVersion: {
            type: 'string',
            example: '2026-04-23',
          },
        },
      },
      UserProfileResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/UserProfile' },
        },
      },
      ConsentResult: {
        type: 'object',
        required: [
          'consentVersion',
          'consentedAt',
          'needsConsent',
          'currentConsentVersion',
        ],
        properties: {
          consentVersion: { type: 'string' },
          consentedAt: { type: 'string', format: 'date-time' },
          needsConsent: { type: 'boolean', example: false },
          currentConsentVersion: { type: 'string' },
        },
      },
      HealthData: {
        type: 'object',
        required: ['status', 'timestamp'],
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/HealthData' },
        },
      },
      Scan: {
        type: 'object',
        required: ['id', 'caption', 'imageUrl', 'thumbnailUrl', 'model', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          caption: { type: 'string', description: 'AI-generated caption' },
          imageUrl: { type: 'string', format: 'uri' },
          thumbnailUrl: { type: 'string', format: 'uri' },
          model: { type: 'string', example: 'gpt-4o-mini' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ScanResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Scan' },
        },
      },
      ScanList: {
        type: 'object',
        required: ['items', 'nextCursor', 'hasMore'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Scan' },
          },
          nextCursor: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'Pass as cursor on the next list request when hasMore is true',
          },
          hasMore: { type: 'boolean' },
        },
      },
      ScanListResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/ScanList' },
        },
      },
      Message: {
        type: 'object',
        required: ['id', 'role', 'content', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          role: {
            type: 'string',
            enum: ['user', 'assistant', 'system'],
          },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MessageListResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          },
        },
      },
      SendMessageResult: {
        type: 'object',
        required: ['userMessage', 'assistantMessage'],
        properties: {
          userMessage: { $ref: '#/components/schemas/Message' },
          assistantMessage: { $ref: '#/components/schemas/Message' },
        },
      },
      SendMessageResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/SendMessageResult' },
        },
      },
      MessageDataResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/MessageOnly' },
        },
      },
      RegisterBody: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 72,
            format: 'password',
          },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
          password: {
            type: 'string',
            minLength: 1,
            maxLength: 72,
            format: 'password',
          },
        },
      },
      RefreshBody: {
        type: 'object',
        required: ['refreshToken'],
        additionalProperties: false,
        properties: {
          refreshToken: { type: 'string', minLength: 1 },
        },
      },
      ForgotPasswordBody: {
        type: 'object',
        required: ['email'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      ResetPasswordBody: {
        type: 'object',
        required: ['email', 'code', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
          code: {
            type: 'string',
            pattern: '^\\d{6}$',
            description: '6-digit code from the password-reset email',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 72,
            format: 'password',
          },
        },
      },
      ChangePasswordBody: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        additionalProperties: false,
        properties: {
          currentPassword: {
            type: 'string',
            minLength: 1,
            maxLength: 72,
            format: 'password',
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            maxLength: 72,
            format: 'password',
          },
        },
      },
      ConsentBody: {
        type: 'object',
        required: ['version'],
        additionalProperties: false,
        properties: {
          version: {
            type: 'string',
            minLength: 1,
            maxLength: 32,
            description: 'Must match the server currentConsentVersion',
            example: '2026-04-23',
          },
        },
      },
      CreateMessageBody: {
        type: 'object',
        required: ['content'],
        additionalProperties: false,
        properties: {
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 4000,
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
            example: {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
              },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Missing or invalid access token / credentials',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
            example: {
              success: false,
              error: {
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
            example: {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: 'Not found',
              },
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict (e.g. email already registered)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
            example: {
              success: false,
              error: {
                code: 'CONFLICT',
                message: 'Email already registered',
              },
            },
          },
        },
      },
      TooManyRequests: {
        description:
          'Rate limit or daily AI quota exceeded (`RATE_LIMITED`, `SCAN_QUOTA_EXCEEDED`, or `MESSAGE_QUOTA_EXCEEDED`)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorEnvelope' },
            example: {
              success: false,
              error: {
                code: 'RATE_LIMITED',
                message: 'Too many attempts. Please try again later.',
              },
            },
          },
        },
      },
    },
    parameters: {
      ScanId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Scan UUID',
        schema: { type: 'string', format: 'uuid' },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns service liveness status. No authentication required.',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created; tokens returned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset code',
        description:
          'Emails a 6-digit code (15 min expiry) when the account exists. Always returns a generic success message to avoid email enumeration.',
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Acknowledgement (sent or not)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: {
                    message:
                      'If an account exists with that email, a reset code has been sent.',
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with email code',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: { message: 'Password updated successfully' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        operationId: 'refreshToken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'New token pair',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (revoke refresh token)',
        operationId: 'logout',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Refresh token revoked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: { message: 'Logged out successfully' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/api/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password',
        description: 'Requires a valid access token. Refresh tokens are revoked; sign in again.',
        operationId: 'changePassword',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password changed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: {
                    message: 'Password updated successfully. Please sign in again.',
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        operationId: 'getMe',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile including consent flags',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfileResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/auth/quota': {
      get: {
        tags: ['Auth'],
        summary: 'Get daily AI quota usage',
        description: 'UTC-day scan and follow-up message usage for the authenticated user.',
        operationId: 'getQuota',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current daily quota counters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'usageDate',
                        'scansUsed',
                        'scansLimit',
                        'scansRemaining',
                        'messagesUsed',
                        'messagesLimit',
                        'messagesRemaining',
                      ],
                      properties: {
                        usageDate: { type: 'string', example: '2026-04-23' },
                        scansUsed: { type: 'integer' },
                        scansLimit: { type: 'integer' },
                        scansRemaining: { type: 'integer' },
                        messagesUsed: { type: 'integer' },
                        messagesLimit: { type: 'integer' },
                        messagesRemaining: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/consent': {
      post: {
        tags: ['Auth'],
        summary: 'Record AI / privacy consent',
        description:
          'Required before creating scans or sending follow-up messages. `version` must match `currentConsentVersion` from GET /api/auth/me.',
        operationId: 'recordConsent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConsentBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Consent recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ConsentResult' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/account': {
      delete: {
        tags: ['Auth'],
        summary: 'Delete account',
        description:
          'Permanently deletes the authenticated user and associated data. Requires a valid access token.',
        operationId: 'deleteAccount',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Account deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: { message: 'Account deleted successfully' },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/scans': {
      post: {
        tags: ['Scans'],
        summary: 'Create a scan from an image',
        description:
          'Upload a single image (`multipart/form-data`, field name `image`). Max 10MB. Requires prior AI consent and available daily scan quota.',
        operationId: 'createScan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (image/*), max 10MB',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Scan created with caption',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScanResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      get: {
        tags: ['Scans'],
        summary: 'List scans',
        description: 'Cursor-paginated list of the authenticated user\'s scans (newest first).',
        operationId: 'listScans',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'cursor',
            in: 'query',
            required: false,
            description: 'Scan id from a previous response `nextCursor`',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Page size (1–50)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              default: 20,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated scans',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScanListResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/scans/{id}': {
      get: {
        tags: ['Scans'],
        summary: 'Get scan by id',
        operationId: 'getScan',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ScanId' }],
        responses: {
          '200': {
            description: 'Scan details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ScanResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Scans'],
        summary: 'Delete scan',
        operationId: 'deleteScan',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ScanId' }],
        responses: {
          '200': {
            description: 'Scan deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageDataResponse' },
                example: {
                  success: true,
                  data: { message: 'Scan deleted' },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/scans/{id}/messages': {
      get: {
        tags: ['Scans'],
        summary: 'Get message thread for a scan',
        operationId: 'getScanMessages',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ScanId' }],
        responses: {
          '200': {
            description: 'Messages ordered by createdAt ascending',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageListResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Scans'],
        summary: 'Send a follow-up message about a scan',
        description:
          'Requires AI consent and available daily message quota. Returns both the user and assistant messages.',
        operationId: 'sendScanMessage',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/ScanId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMessageBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User and assistant messages',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SendMessageResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
  },
} as const;
