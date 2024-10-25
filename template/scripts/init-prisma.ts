import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

// Define paths
const prismaSchemaPath = path.join(__dirname, '../prisma', 'schema.prisma');
const routesIndex = path.join(__dirname, '../src/routes', 'index.ts');
const envPath = path.join(__dirname, '../', '.env');
const envExamplePath = path.join(__dirname, '../', '.env.example');

// Create a readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt the user for roles
const askRoles = (callback: (roles: string[]) => void) => {
    rl.question("\nEnter roles (separated by commas): ", (answer) => {
        const roles = answer.split(',').map(role => role.trim()).filter(Boolean);
        if (roles.length === 0) {
            console.error('No roles provided. Please enter at least one role.\n');
            askRoles(callback); // Re-prompt if no roles are entered
        } else {
            callback(roles); // Proceed with roles
        }
    });
};

// Step 1: Update UserRolesEnum in Prisma schema
const updateUserRolesEnum = (roles: string[], callback: () => void) => {
    fs.readFile(prismaSchemaPath, 'utf8', (err, data) => {
        if (err) return console.error('Error reading Prisma schema file:', err, '\n');

        const enumRegex = /enum UserRolesEnum \{([^}]*)\}/;
        const match = data.match(enumRegex);

        if (!match) return console.error('UserRolesEnum not found in schema.prisma\n');

        let existingRoles = match[1].trim().split(/\s+/).filter(Boolean);
        roles.forEach(role => {
            if (!existingRoles.includes(role)) existingRoles.push(role);
        });

        const updatedEnum = `enum UserRolesEnum {\n  ${existingRoles.join('\n  ')}\n}`;
        const updatedSchema = data.replace(enumRegex, updatedEnum);

        fs.writeFile(prismaSchemaPath, updatedSchema, 'utf8', (err) => {
            if (err) return console.error('Error writing updated Prisma schema file:', err, '\n');
            console.log('UserRolesEnum updated successfully!\n');
            callback(); // Proceed to the next task
        });
    });
};

// Step 2: Update JWTCheck in routes/index.ts
const updateJWTCheck = (roles: string[], callback: () => void) => {
    fs.readFile(routesIndex, 'utf8', (err, data) => {
        if (err) return console.error('Error reading routes/index.ts file:', err, '\n');

        const jwtCheckRegex = /JWTCheck\(\[([^\]]*)\]\)/;
        const match = data.match(jwtCheckRegex);

        if (!match) return console.error('JWTCheck not found in routes/index.ts\n');

        let existingRoles = match[1].trim().split(/\s*,\s*/).filter(Boolean);
        roles.forEach(role => {
            const prefixedRole = `UserRolesEnum.${role}`;
            if (!existingRoles.includes(prefixedRole)) existingRoles.push(prefixedRole);
        });

        const updatedJWTCheck = `JWTCheck([${existingRoles.join(', ')}])`;
        const updatedData = data.replace(jwtCheckRegex, updatedJWTCheck);

        fs.writeFile(routesIndex, updatedData, 'utf8', (err) => {
            if (err) return console.error('Error writing updated routes/index.ts file:', err, '\n');
            console.log('JWTCheck updated successfully!\n');
            callback(); // Proceed to the next task
        });
    });
};

// Step 3: Copy .env.example to .env if not present and prompt for values
const setupEnvFile = () => {
    fs.copyFile(envExamplePath, envPath, (err) => {
        if (err) return console.error('Error copying .env.example to .env:', err, '\n');
        console.log('.env file created successfully!\n');

        // Prompt for environment variable values
        const envValues: { [key: string]: string } = {};
        const questions = ['PORT', 'JWT_SECRET', 'DB_STRING', 'HOST'];

        const askQuestion = (index: number) => {
            if (index >= questions.length) {
                rl.close();
                return;
            }

            const question = questions[index];
            rl.question(`\nPlease enter the value for \x1b[1m${question}\x1b[0m (required): `, (answer: string) => {
                envValues[question] = answer;
                askQuestion(index + 1);
            });
        };

        console.log('\n--- ENVIRONMENT SETUP ---');
        console.log('Please fill in the required environment variables below:');
        askQuestion(0);

        rl.on('close', () => {
            let envContent = '';
            for (const key in envValues) {
                envContent += `${key}=${envValues[key]}\n`;
            }

            fs.writeFile(envPath, envContent, 'utf8', (err) => {
                if (err) return console.error('Error writing .env file:', err, '\n');
                console.log('\n.env file updated successfully!\n');
            });
        });
    });
};

// Execute tasks sequentially with user-provided roles
askRoles((roles) => {
    updateUserRolesEnum(roles, () => {
        updateJWTCheck(roles, () => {
            setupEnvFile();
        });
    });
});