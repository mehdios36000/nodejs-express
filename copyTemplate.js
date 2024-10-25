#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');

// Display a banner
console.log(chalk.blue(figlet.textSync("Project Setup", { horizontalLayout: "full" })));

// Helper function to copy template files
const copyTemplate = async (targetDir) => {
    const templateDir = path.join(__dirname, 'template');
    await fs.copy(templateDir, targetDir);
    console.log(chalk.cyan(`Template files copied to ${targetDir}`));
};

// Helper function to run commands with interactive input enabled
const runCommand = (command, args, cwd) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow(`\nRunning: ${command} ${args.join(' ')}`));
        
        // Spawn process with stdio set to inherit to allow user interaction
        const process = spawn(command, args, { cwd, stdio: 'inherit' });

        process.on('error', (error) => {
            console.error(chalk.red(`Error executing ${command}:`), error.message);
            reject(error);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(chalk.red(`${command} exited with code ${code}`)));
            } else {
                resolve();
            }
        });
    });
};

// Main function to execute setup
const setup = async () => {
    try {
        // Use inquirer to prompt for the directory
        const { dirAnswer } = await inquirer.createPromptModule()({
            type: 'input',
            name: 'dirAnswer',
            message: chalk.green('Enter destination folder (use "." for current directory):'),
        });

        const targetDir = path.resolve(dirAnswer === '.' ? process.cwd() : path.join(process.cwd(), dirAnswer));
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
            await fs.mkdirp(targetDir);
        }

        await copyTemplate(targetDir);
        console.log(chalk.cyan('Template setup complete!'));

        // Run additional setup commands, allowing interaction for each command
        await runCommand('yarn', ['install'], targetDir);
        await runCommand('yarn', ['init:prisma'], targetDir);
        await runCommand('yarn', ['prisma:generate'], targetDir);
        await runCommand('yarn', ['prisma:migrate'], targetDir);
        await runCommand('yarn', ['fix:deps'], targetDir);

        console.log(chalk.green('Project setup complete with all commands run successfully!'));
    } catch (error) {
        console.error(chalk.red('Error during setup:'), error);
    }
};

setup();
