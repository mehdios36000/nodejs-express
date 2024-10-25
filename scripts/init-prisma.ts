import * as fs from 'fs';
import * as path from 'path';

// Get roles from terminal arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide roles as terminal arguments, e.g., role1,role2,...\n');
    process.exit(1);
}
const roles = args[0].split(',');

// Define the path to your Prisma schema file
const prismaSchemaPath = path.join(__dirname, '../prisma', 'schema.prisma');

// Read the current Prisma schema file
fs.readFile(prismaSchemaPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading Prisma schema file:', err, '\n');
        process.exit(1);
    }

    // Find the enum block for UserRolesEnum
    const enumRegex = /enum UserRolesEnum \{([^}]*)\}/;
    const match = data.match(enumRegex);

    if (!match) {
        console.error('UserRolesEnum not found in schema.prisma\n');
        process.exit(1);
    }

    // Get the existing roles from the enum
    let existingRoles = match[1].trim().split(/\s+/).filter(Boolean);

    // Add the new roles, avoiding duplicates
    roles.forEach(role => {
        if (!existingRoles.includes(role)) {
            existingRoles.push(role);
        }
    });

    // Create the updated enum block
    const updatedEnum = `enum UserRolesEnum {\n  ${existingRoles.join('\n  ')}\n}`;

    // Replace the old enum block with the updated one
    const updatedSchema = data.replace(enumRegex, updatedEnum);

    // Write the updated schema back to the file
    fs.writeFile(prismaSchemaPath, updatedSchema, 'utf8', (err) => {
        if (err) {
            console.error('Error writing updated Prisma schema file:', err, '\n');
            process.exit(1);
        }
        console.log('UserRolesEnum updated successfully!\n');
    });
});

const routesIndex = path.join(__dirname, '../src/routes', 'index.ts');
fs.readFile(routesIndex, 'utf8', (err, data) => {
        if (err) {
                console.error('Error reading routes/index.ts file:', err, '\n');
                process.exit(1);
        }

        // Find the JWTCheck line
        const jwtCheckRegex = /JWTCheck\(\[([^\]]*)\]\)/;
        const match = data.match(jwtCheckRegex);

        if (!match) {
                console.error('JWTCheck not found in routes/index.ts\n');
                process.exit(1);
        }

        // Get the existing roles from the JWTCheck line
        let existingRoles = match[1].trim().split(/\s*,\s*/).filter(Boolean);

        // Add the new roles, avoiding duplicates and prefixing with UserRolesEnum.
        roles.forEach(role => {
                const prefixedRole = `UserRolesEnum.${role}`;
                if (!existingRoles.includes(prefixedRole)) {
                        existingRoles.push(prefixedRole);
                }
        });

        // Create the updated JWTCheck line
        const updatedJWTCheck = `JWTCheck([${existingRoles.join(', ')}])`;

        // Replace the old JWTCheck line with the updated one
        const updatedData = data.replace(jwtCheckRegex, updatedJWTCheck);

        // Write the updated file back to the file
        fs.writeFile(routesIndex, updatedData, 'utf8', (err) => {
                if (err) {
                        console.error('Error writing updated routes/index.ts file:', err, '\n');
                        process.exit(1);
                }
                console.log('JWTCheck updated successfully!\n');
        });
});


const envPath = path.join(__dirname, '../', '.env');
const envExamplePath = path.join(__dirname, '../', '.env.example');

fs.copyFile(envExamplePath, envPath, (err) => {
        if (err) {
                console.error('Error copying .env.example to .env:', err, '\n');
                process.exit(1);
        }
        console.log('.env file created successfully!\n');
});

//prompt the user to fill the values of the .env file
const readline = require('readline');

const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

const envValues: { [key: string]: string } = {};

const questions = [
        'PORT',
        'JWT_SECRET',
        'DB_STRING',
        'HOST'
];

const askQuestion = (index: number) => {
        if (index >= questions.length) {
                rl.close();
                return;
        }

        const question = questions[index];
        rl.question(`${question}: `, (answer: string) => {
                envValues[question] = answer;
                askQuestion(index + 1);
        });
};

for (let i = 0; i < questions.length; i++) {
        askQuestion(i);
}

rl.on('close', () => {
        let envContent = '';
        for (const key in envValues) {
                envContent += `${key}=${envValues[key]}\n`;
        }

        fs.writeFile(envPath, envContent, 'utf8', (err) => {
                if (err) {
                        console.error('Error writing .env file:', err, '\n');
                        process.exit(1);
                }
                console.log('.env file updated successfully!\n');
        });
});
