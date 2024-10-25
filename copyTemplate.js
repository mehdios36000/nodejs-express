#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

// Create readline interface for prompting
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt for directory
const askDirectory = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

// Function to copy template files
const copyTemplate = async (targetDir) => {
    const templateDir = path.join(__dirname, 'template');
    await fs.copy(templateDir, targetDir);
    console.log(`Template files copied to ${targetDir}`);
};

// Main function to execute setup
const setup = async () => {
    try {
        const dirAnswer = await askDirectory('Enter destination folder (use "." for current directory): ');
        rl.close();

        const targetDir = path.resolve(dirAnswer === '.' ? process.cwd() : path.join(process.cwd(), dirAnswer));
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
            await fs.mkdirp(targetDir);
        }

        await copyTemplate(targetDir);
        console.log('Template setup complete!');
    } catch (error) {
        console.error('Error during setup:', error);
    }
};

setup();
