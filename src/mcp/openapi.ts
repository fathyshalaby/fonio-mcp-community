import { DEFAULT_API_BASE_URL } from "./version";

export const FONIO_OPENAPI = {
  openapi: "3.0.0",
  info: {
    title: "Fonio Public API",
    description:
      "Public API for triggering fonio actions from external systems. Authenticate with a workspace API key from app.fonio.ai.",
    version: "1.0",
  },
  servers: [
    {
      url: DEFAULT_API_BASE_URL,
      description: "Production",
    },
  ],
  paths: {
    "/public/v1/outbound_call": {
      post: {
        operationId: "triggerOutboundCall",
        summary: "Trigger an outbound call",
        description:
          "Initiates an outbound call from one of your fonio phone numbers to a target number. The fromNumber selects which of your numbers (and therefore which outbound assistant) places the call. Authenticate with your workspace API key in the Authorization header (Bearer). Outbound calling requires an imported or SIP number, the Teams plan, and completed KYC.",
        tags: ["Outbound calls"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OutboundCallPayloadDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "Outbound call trigger result.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OutboundCallResponseDto",
                },
              },
            },
          },
        },
      },
    },
    "/public/v1/test-api-key": {
      post: {
        operationId: "testApiKey",
        summary: "Test an API key",
        description:
          "Verifies that a fonio workspace API key is valid. Provide the key in the Authorization header (Bearer).",
        tags: ["API key"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TestApiKeyPayloadDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "API key is valid.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TestApiKeyResponseDto" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: "http",
        scheme: "bearer",
        description: "Your fonio API key from the workspace.",
      },
    },
    schemas: {
      OutboundCallPayloadDto: {
        type: "object",
        required: ["fromNumber", "toNumber"],
        properties: {
          fromNumber: {
            type: "string",
            description:
              "Your fonio number that places the call. This also selects the outbound assistant assigned to that number.",
          },
          toNumber: {
            type: "string",
            pattern: "^\\+\\d+$",
            description: "Destination number in E.164 format, e.g. +4915123456789.",
          },
          context: {
            type: "object",
            additionalProperties: true,
            description:
              "Optional variables passed into the assistant prompt as {{context.fieldName}} or Handlebars object values.",
          },
        },
      },
      OutboundCallResponseDto: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: { type: "string", enum: ["success", "error"] },
          message: { type: "string" },
        },
      },
      TestApiKeyPayloadDto: {
        type: "object",
        properties: {
        },
      },
      TestApiKeyResponseDto: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: { type: "string", enum: ["success"] },
          message: { type: "string" },
        },
      },
    },
  },
} as const;
