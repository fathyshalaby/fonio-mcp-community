import { DEFAULT_API_BASE_URL } from "./version";

export const FONIO_OPENAPI = {
  openapi: "3.0.0",
  info: {
    title: "Fonio Public API",
    description:
      "Public API for triggering fonio actions from external systems. Authenticate with a workspace API key from app.fonio.ai (Authorization: Bearer, or apiKey in the JSON body on outbound/test endpoints). Assistants are created in the app, not via this API — use the MCP build_assistant tool for paste-ready specs.",
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
          "Initiates an outbound call from one of your fonio phone numbers to a target number. Authenticate with your Fonio API key, either in the Authorization header or in the request body as apiKey. The fromNumber selects which of your numbers (and therefore which outbound assistant) places the call. Outbound calling requires an imported or SIP number, the Teams plan, and completed KYC.",
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
          "Verifies that a fonio workspace API key is valid. Provide the key in the Authorization header or as apiKey in the request body.",
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
    "/integrations/remote-registry/servers": {
      put: {
        operationId: "saveRemoteIntegrationServer",
        summary: "Register a remote integration server",
        description:
          "Registers a development server that serves integration manifests over the wire. The server must answer the manifest discovery route. Send authToken so fonio authenticates every call with that bearer token; re-registering replaces it. Up to 5 servers per company. Registration is rejected when a served manifest is shadowed by a checked-in integration or by an earlier server.",
        tags: ["Remote integration servers"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaveRemoteServerPayloadDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "The normalized base URL.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SaveRemoteServerResponseDto" },
              },
            },
          },
        },
      },
      get: {
        operationId: "listRemoteIntegrationServers",
        summary: "List registered remote integration servers",
        description:
          "Lists your registered remote integration servers in registration order.",
        tags: ["Remote integration servers"],
        responses: {
          "200": {
            description: "The registered servers.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/RemoteServerResponseDto" },
                },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteRemoteIntegrationServer",
        summary: "Delete a remote integration server",
        description:
          "Deletes a registered remote integration server by its id, as returned by the list endpoint.",
        tags: ["Remote integration servers"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteRemoteServerPayloadDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "Deletion result.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteRemoteServerResponseDto",
                },
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
          apiKey: {
            type: "string",
            description: "Optional alternative to the Authorization header.",
          },
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
          apiKey: { type: "string" },
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
      SaveRemoteServerPayloadDto: {
        type: "object",
        required: ["baseUrl", "authToken"],
        properties: {
          baseUrl: {
            type: "string",
            format: "uri",
            description: "Public base URL of the server that serves integration manifests.",
          },
          authToken: {
            type: "string",
            minLength: 1,
            maxLength: 512,
            description:
              "Bearer token fonio sends on every call to the server. Re-registering replaces it.",
          },
        },
      },
      SaveRemoteServerResponseDto: {
        type: "object",
        required: ["baseUrl"],
        properties: {
          baseUrl: { type: "string" },
        },
      },
      RemoteServerResponseDto: {
        type: "object",
        required: ["id", "baseUrl"],
        properties: {
          id: { type: "string", format: "uuid" },
          baseUrl: { type: "string" },
        },
      },
      DeleteRemoteServerPayloadDto: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string", format: "uuid" },
        },
      },
      DeleteRemoteServerResponseDto: {
        type: "object",
        required: ["success"],
        properties: {
          success: { type: "boolean" },
        },
      },
    },
  },
} as const;
