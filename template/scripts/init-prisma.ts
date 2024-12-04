import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";

// Define paths
const prismaSchemaPath = path.join(__dirname, "../prisma", "schema.prisma");
const routesIndex = path.join(__dirname, "../src/routes", "index.ts");
const envPath = path.join(__dirname, "../", ".env");
const envExamplePath = path.join(__dirname, "../", ".env.example");

// Keep track of changes for cleanup
interface Changes {
	originalPrismaSchema?: string;
	originalRoutesIndex?: string;
	createdEnvFile?: boolean;
}

const changes: Changes = {};

// Backup original files
async function backupFiles() {
	try {
		// Backup Prisma schema if it exists
		try {
			changes.originalPrismaSchema = await fs.readFile(
				prismaSchemaPath,
				"utf8",
			);
		} catch (error) {
			console.log(chalk.yellow("No existing Prisma schema to backup"));
		}

		// Backup routes index if it exists
		try {
			changes.originalRoutesIndex = await fs.readFile(routesIndex, "utf8");
		} catch (error) {
			console.log(chalk.yellow("No existing routes index to backup"));
		}

		// Check if .env was created by us
		try {
			await fs.access(envPath);
		} catch {
			changes.createdEnvFile = false;
		}
	} catch (error) {
		console.error(chalk.red("Error backing up files:"), error);
		throw error;
	}
}

// Cleanup function to revert changes
async function cleanup() {
	console.log(chalk.yellow("\nCleaning up changes..."));

	try {
		// Restore Prisma schema
		if (changes.originalPrismaSchema) {
			await fs.writeFile(
				prismaSchemaPath,
				changes.originalPrismaSchema,
				"utf8",
			);
			console.log(chalk.green("✓ Restored Prisma schema"));
		}

		// Restore routes index
		if (changes.originalRoutesIndex) {
			await fs.writeFile(routesIndex, changes.originalRoutesIndex, "utf8");
			console.log(chalk.green("✓ Restored routes index"));
		}

		// Remove .env if we created it
		if (changes.createdEnvFile) {
			await fs.unlink(envPath);
			console.log(chalk.green("✓ Removed created .env file"));
		}

		console.log(chalk.green("\nCleanup completed successfully"));
	} catch (error) {
		console.error(chalk.red("Error during cleanup:"), error);
		throw error;
	}
}

// Handle interruption signals
function setupCleanupHandlers() {
	for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
		process.on(signal, async () => {
			console.log(
				chalk.yellow("\n\nReceived interruption signal. Cleaning up..."),
			);
			try {
				await cleanup();
				process.exit(0);
			} catch (error) {
				console.error(chalk.red("Error during cleanup:"), error);
				process.exit(1);
			}
		});
	}

	// Handle uncaught exceptions
	process.on("uncaughtException", async (error) => {
		console.error(chalk.red("\nUncaught exception:"), error);
		await cleanup();
		process.exit(1);
	});

	// Handle unhandled rejections
	process.on("unhandledRejection", async (error) => {
		console.error(chalk.red("\nUnhandled rejection:"), error);
		await cleanup();
		process.exit(1);
	});
}

interface EnvVariable {
	name: string;
	message: string;
	default?: string;
	validate?: (input: string) => boolean | string;
}

const ENV_VARIABLES: EnvVariable[] = [
	{
		name: "NODE_ENV",
		message: "Enter the environment (development/production):",
		default: "development",
		validate: (input) =>
			["development", "production"].includes(input) ||
			"Environment must be either development or production",
	},
	{
		name: "PORT",
		message: "Enter the port number:",
		default: "3000",
		validate: (input) =>
			/^\d+$/.test(input) &&
			Number.parseInt(input) > 0 &&
			Number.parseInt(input) <= 65535
				? true
				: "Port must be a number between 1 and 65535",
	},
	{
		name: "HOST",
		message: "Enter the host:",
		default: "localhost",
	},
	{
		name: "DB_STRING",
		message: "Enter the database connection string:",
		validate: (input) =>
			input.startsWith("postgres://") ||
			"Database string must start with postgres://",
	},
	{
		name: "SMTP_HOST",
		message: "Enter the SMTP host:",
	},
	{
		name: "SMTP_PORT",
		message: "Enter the SMTP port:",
		validate: (input) =>
			/^\d+$/.test(input) &&
			Number.parseInt(input) > 0 &&
			Number.parseInt(input) <= 65535
				? true
				: "SMTP port must be a number between 1 and 65535",
	},
	{
		name: "SMTP_USER",
		message: "Enter the SMTP username:",
	},
	{
		name: "SMTP_PASS",
		message: "Enter the SMTP password:",
	},
	{
		name: "CORS_ORIGIN",
		message: "Enter allowed CORS origins (comma-separated):",
		default: "*",
	},
	{
		name: "API_RATE_LIMIT",
		message: "Enter API rate limit per minute:",
		default: "100",
		validate: (input) =>
			/^\d+$/.test(input) && Number.parseInt(input) > 0
				? true
				: "Rate limit must be a positive number",
	},
];

// Display a banner
console.log(
	chalk.blue(figlet.textSync("Project Setup", { horizontalLayout: "full" })),
);

const validateRoleName = (role: string): boolean => {
	// Role should be uppercase, no spaces, only letters and underscores
	return /^[A-Z][A-Z0-9_]*$/.test(role);
};

// Prompt the user for roles
const askRoles = async (): Promise<string[]> => {
	const { roles } = await inquirer.prompt({
		type: "input",
		name: "roles",
		message: chalk.green(
			"Enter roles (comma-separated, uppercase, e.g., ADMIN,USER):",
		),
		validate: (input: string) => {
			const roles = input
				.split(",")
				.map((role) => role.trim())
				.filter(Boolean);

			if (roles.length === 0) {
				return "Please enter at least one role";
			}

			const invalidRoles = roles.filter((role) => !validateRoleName(role));
			if (invalidRoles.length > 0) {
				return `Invalid role names: ${invalidRoles.join(
					", ",
				)}. Use uppercase letters, numbers, and underscores only.`;
			}

			return true;
		},
	});

	return roles
		.split(",")
		.map((role: string) => role.trim())
		.filter(Boolean);
};

// Step 1: Update UserRolesEnum in Prisma schema
const updateUserRolesEnum = async (roles: string[]) => {
	try {
		const data = await fs.readFile(prismaSchemaPath, "utf8");
		const enumRegex = /enum UserRolesEnum \{([^}]*)\}/;
		const match = data.match(enumRegex);

		if (!match) {
			throw new Error("UserRolesEnum not found in schema.prisma");
		}

		const existingRoles = new Set(match[1].trim().split(/\s+/).filter(Boolean));
		for (const role of roles) {
			existingRoles.add(role);
		}

		const updatedEnum = `enum UserRolesEnum {\n  ${Array.from(
			existingRoles,
		).join("\n  ")}\n}`;
		const updatedSchema = data.replace(enumRegex, updatedEnum);

		await fs.writeFile(prismaSchemaPath, updatedSchema, "utf8");
		console.log(chalk.green("✓ UserRolesEnum updated successfully"));
	} catch (err) {
		console.error(chalk.red("Error updating Prisma schema file:"), err);
		await cleanup();
		process.exit(1);
	}
};

// Step 2: Update JWTCheck in routes/index.ts
const updateJWTCheck = async (roles: string[]) => {
	try {
		const data = await fs.readFile(routesIndex, "utf8");
		const jwtCheckRegex = /JWTCheck\(\[([^\]]*)\]\)/;
		const match = data.match(jwtCheckRegex);

		if (!match) {
			throw new Error("JWTCheck not found in routes/index.ts");
		}

		const existingRoles = new Set(
			match[1]
				.trim()
				.split(/\s*,\s*/)
				.filter(Boolean),
		);
		for (const role of roles) {
			existingRoles.add(`UserRolesEnum.${role}`);
		}

		const updatedJWTCheck = `JWTCheck([${Array.from(existingRoles).join(", ")}])`;
		const updatedData = data.replace(jwtCheckRegex, updatedJWTCheck);

		await fs.writeFile(routesIndex, updatedData, "utf8");
		console.log(chalk.green("✓ JWTCheck updated successfully"));
	} catch (err) {
		console.error(chalk.red("Error updating routes/index.ts file:"), err);
		await cleanup();
		process.exit(1);
	}
};

// Step 3: Setup environment variables
const setupEnvFile = async () => {
	try {
		// Check if .env exists, if not copy from .env.example
		try {
			await fs.access(envPath);
		} catch {
			await fs.copyFile(envExamplePath, envPath);
			changes.createdEnvFile = true;
			console.log(chalk.green("✓ Created .env file from .env.example"));
		}

		console.log(chalk.yellow("\n--- ENVIRONMENT SETUP ---"));
		console.log(
			chalk.cyan("Please fill in the required environment variables:"),
		);

		const envValues: Record<string, string> = {
			// Generate JWT secret automatically
			JWT_SECRET: crypto.randomBytes(32).toString("hex"),
		};

		console.log(chalk.green(`✓ Generated JWT_SECRET: ${envValues.JWT_SECRET}`));

		// Prompt for each environment variable
		for (const variable of ENV_VARIABLES) {
			const { value } = await inquirer.prompt({
				type: "input",
				name: "value",
				message: chalk.cyan(variable.message),
				default: variable.default,
				validate: variable.validate,
			});
			envValues[variable.name] = value;
		}

		const envContent = Object.entries(envValues)
			.map(([key, value]) => `${key}=${value}`)
			.join("\n");

		await fs.writeFile(envPath, envContent, "utf8");
		console.log(chalk.green("✓ Environment variables updated successfully"));
	} catch (err) {
		console.error(chalk.red("Error setting up environment variables:"), err);
		await cleanup();
		process.exit(1);
	}
};

// Execute tasks sequentially
const runSetup = async () => {
	try {
		console.log(chalk.cyan("\nStarting project setup...\n"));

		// Setup cleanup handlers
		setupCleanupHandlers();

		// Backup existing files
		await backupFiles();

		const roles = await askRoles();
		await updateUserRolesEnum(roles);
		await updateJWTCheck(roles);
		await setupEnvFile();

		console.log(chalk.green("\n✨ Project setup completed successfully!"));
		console.log(
			chalk.cyan("\nNext steps:"),
			"\n1. Review your .env file",
			"\n2. Run yarn prisma generate",
			"\n3. Run yarn prisma migrate dev",
			"\n4. Start your application with yarn dev",
		);
	} catch (error) {
		console.error(chalk.red("\nSetup failed:"), error);
		await cleanup();
		process.exit(1);
	}
};

// Run the setup
runSetup();
