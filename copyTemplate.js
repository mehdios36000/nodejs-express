#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

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

// Helper function to run commands with interactive input enabled
const runCommand = (command, args, cwd) => {
    return new Promise((resolve, reject) => {
        console.log(`\nRunning: ${command} ${args.join(' ')}`);
        
        // Spawn process with stdio set to inherit to allow user interaction
        const process = spawn(command, args, { cwd, stdio: 'inherit' });

        process.on('error', (error) => {
            console.error(`Error executing ${command}:`, error.message);
            reject(error);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${command} exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
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

        // Run additional setup commands, allowing interaction for each command
        await runCommand('yarn', ['install'], targetDir);
        await runCommand('yarn', ['init:prisma'], targetDir);
        await runCommand('yarn', ['prisma:generate'], targetDir);
        await runCommand('yarn', ['prisma:migrate'], targetDir);

        console.log('Project setup complete with all commands run successfully!');
    } catch (error) {
        console.error('Error during setup:', error);
    }
};

setup();
