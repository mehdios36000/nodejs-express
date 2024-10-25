import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

// Get roles from terminal arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide roles as terminal arguments, e.g., role1,role2,...\n');
    process.exit(1);
}
const roles = args[0].split(',');

// Define paths
const prismaSchemaPath = path.join(__dirname, '../prisma', 'schema.prisma');
const routesIndex = path.join(__dirname, '../src/routes', 'index.ts');
const envPath = path.join(__dirname, '../', '.env');
const envExamplePath = path.join(__dirname, '../', '.env.example');

// Step 1: Update UserRolesEnum in Prisma schema
const updateUserRolesEnum = (callback: () => void) => {
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
const updateJWTCheck = (callback: () => void) => {
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
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

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

// Execute tasks sequentially
updateUserRolesEnum(() => {
    updateJWTCheck(() => {
        setupEnvFile();
    });
});
