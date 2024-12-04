import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Node.js Express API Documentation",
			version,
			description: "API documentation for the Node.js Express Template",
			license: {
				name: "MIT",
				url: "https://opensource.org/licenses/MIT",
			},
			contact: {
				name: "API Support",
				email: "your-email@example.com",
			},
		},
		servers: [
			{
				url: "http://{host}:{port}/api",
				description: "API Server",
				variables: {
					host: {
						default: "localhost",
						description: "API host",
					},
					port: {
						default: "3000",
						description: "API port",
					},
				},
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			responses: {
				UnauthorizedError: {
					description: "Access token is missing or invalid",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									message: {
										type: "string",
										example: "Unauthorized access",
									},
								},
							},
						},
					},
				},
			},
			schemas: {
				Error: {
					type: "object",
					properties: {
						message: {
							type: "string",
						},
						internal_code: {
							type: "string",
						},
					},
				},
				User: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "User ID",
						},
						email: {
							type: "string",
							format: "email",
							description: "User email",
						},
						role: {
							type: "string",
							enum: ["ADMIN", "USER"],
							description: "User role",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "User creation date",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "User last update date",
						},
					},
				},
			},
		},
		tags: [
			{
				name: "Auth",
				description: "Authentication endpoints",
			},
			{
				name: "Users",
				description: "User management endpoints",
			},
		],
	},
	apis: ["./src/routes/*.ts", "./src/docs/*.yml"], // files containing annotations
};

export const swaggerSpec = swaggerJsdoc(options);
