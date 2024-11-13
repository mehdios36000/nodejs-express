import fs from "fs";
import path from "path";
import readline from "readline";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import crypto from "crypto";

// Define paths
const prismaSchemaPath = path.join(__dirname, '../prisma', 'schema.prisma');
const routesIndex = path.join(__dirname, '../src/routes', 'index.ts');
const envPath = path.join(__dirname, '../', '.env');
const envExamplePath = path.join(__dirname, '../', '.env.example');

// Display a banner
console.log(chalk.blue(figlet.textSync("Project Setup", { horizontalLayout: "full" })));

// Prompt the user for roles
const askRoles = async () => {
    const { roles } = await inquirer.prompt({
        type: "input",
        name: "roles",
        message: chalk.green("Enter roles (separated by commas):"),
    });
    return roles.split(",").map((role: string) => role.trim()).filter(Boolean);
};

// Step 1: Update UserRolesEnum in Prisma schema
const updateUserRolesEnum = async (roles: string[]) => {
    try {
        const data = fs.readFileSync(prismaSchemaPath, "utf8");
        const enumRegex = /enum UserRolesEnum \{([^}]*)\}/;
        const match = data.match(enumRegex);

        if (!match) {
            console.error(chalk.red("UserRolesEnum not found in schema.prisma"));
            return;
        }

        let existingRoles = match[1].trim().split(/\s+/).filter(Boolean);
        roles.forEach(role => {
            if (!existingRoles.includes(role)) existingRoles.push(role);
        });

        const updatedEnum = `enum UserRolesEnum {\n  ${existingRoles.join("\n  ")}\n}`;
        const updatedSchema = data.replace(enumRegex, updatedEnum);

        fs.writeFileSync(prismaSchemaPath, updatedSchema, "utf8");
        console.log(chalk.cyan("UserRolesEnum updated successfully!\n"));
    } catch (err) {
        console.error(chalk.red("Error updating Prisma schema file:"), err);
    }
};

// Step 2: Update JWTCheck in routes/index.ts
const updateJWTCheck = async (roles: string[]) => {
    try {
        const data = fs.readFileSync(routesIndex, "utf8");
        const jwtCheckRegex = /JWTCheck\(\[([^\]]*)\]\)/;
        const match = data.match(jwtCheckRegex);

        if (!match) {
            console.error(chalk.red("JWTCheck not found in routes/index.ts"));
            return;
        }

        let existingRoles = match[1].trim().split(/\s*,\s*/).filter(Boolean);
        roles.forEach(role => {
            const prefixedRole = `UserRolesEnum.${role}`;
            if (!existingRoles.includes(prefixedRole)) existingRoles.push(prefixedRole);
        });

        const updatedJWTCheck = `JWTCheck([${existingRoles.join(", ")}])`;
        const updatedData = data.replace(jwtCheckRegex, updatedJWTCheck);

        fs.writeFileSync(routesIndex, updatedData, "utf8");
        console.log(chalk.cyan("JWTCheck updated successfully!\n"));
    } catch (err) {
        console.error(chalk.red("Error updating routes/index.ts file:"), err);
    }
};

// Step 3: Copy .env.example to .env if not present and prompt for values
const setupEnvFile = async () => {
    try {
        if (!fs.existsSync(envPath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log(chalk.cyan(".env file created successfully!\n"));
        }

        const envVariables = ["PORT", "JWT_SECRET", "DB_STRING", "HOST","SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS"];
        const envValues: { [key: string]: string } = {};

        console.log(chalk.yellow("\n--- ENVIRONMENT SETUP ---"));
        console.log("Please fill in the required environment variables below:");

        for (const variable of envVariables) {
            if (variable === "JWT_SECRET") {
                envValues[variable] = crypto.randomBytes(32).toString('hex');
                console.log(chalk.green(`Generated JWT_SECRET: ${envValues[variable]}`));
                continue;
            }

            const { value } = await inquirer.prompt({
                type: "input",
                name: "value",
                message: chalk.green(`Please enter the value for ${variable}:`),
            });
            envValues[variable] = value;
        }

        const envContent = Object.entries(envValues)
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        fs.writeFileSync(envPath, envContent, "utf8");
        console.log(chalk.cyan("\n.env file updated successfully!\n"));
    } catch (err) {
        console.error(chalk.red("Error setting up .env file:"), err);
    }
};

// Execute tasks sequentially with user-provided roles
const runSetup = async () => {
    const roles = await askRoles();
    if (roles.length > 0) {
        await updateUserRolesEnum(roles);
        await updateJWTCheck(roles);
        await setupEnvFile();
    } else {
        console.log(chalk.red("No roles provided. Please enter at least one role."));
    }
};

// Run the setup
runSetup().catch(error => {
    console.error(chalk.red("An unexpected error occurred:"), error);
});
