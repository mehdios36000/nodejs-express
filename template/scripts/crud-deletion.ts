import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";

async function getExistingEntities(): Promise<string[]> {
	try {
		const controllersDir = path.join(process.cwd(), "src", "controllers");
		const files = await fs.readdir(controllersDir);
		return files
			.filter((file) => file.endsWith(".ts") && file !== "index.ts")
			.map((file) => file.replace(".ts", ""));
	} catch (error) {
		console.error(chalk.red("Error reading controllers directory:"), error);
		return [];
	}
}

async function confirmDeletion(entityName: string): Promise<boolean> {
	const { confirm } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: chalk.yellow(
				`Are you sure you want to delete the ${entityName} CRUD module? This action cannot be undone.`,
			),
			default: false,
		},
	]);
	return confirm;
}

async function deleteFiles(entityName: string) {
	const filesToDelete = [
		`src/controllers/${entityName}.ts`,
		`src/services/${entityName}.ts`,
		`src/routes/${entityName}.ts`,
	];

	console.log(chalk.yellow("\nDeleting files..."));

	for (const file of filesToDelete) {
		try {
			await fs.unlink(file);
			console.log(chalk.green(`✓ Deleted ${file}`));
		} catch (error) {
			console.error(chalk.red(`Error deleting ${file}:`), error);
		}
	}
}

async function updateRouteIndex(entityName: string) {
	const indexPath = "src/routes/index.ts";
	try {
		const content = await fs.readFile(indexPath, "utf-8");

		// Remove the import line
		const importRegex = new RegExp(
			`import ${entityName} from ['"]@routes/${entityName}['"];\n?`,
		);
		let updatedContent = content.replace(importRegex, "");

		// Remove the route line
		const routeRegex = new RegExp(
			`router\\.use\\('/${entityName}s', ${entityName}\\);\n?`,
		);
		updatedContent = updatedContent.replace(routeRegex, "");

		await fs.writeFile(indexPath, updatedContent);
		console.log(chalk.green(`✓ Updated ${indexPath}`));
	} catch (error) {
		console.error(chalk.red(`Error updating ${indexPath}:`), error);
	}
}

async function main() {
	console.log(chalk.blue("🗑️  CRUD Deletion Utility 🗑️\n"));

	// Get list of existing entities
	const entities = await getExistingEntities();

	if (entities.length === 0) {
		console.log(chalk.yellow("No CRUD modules found to delete."));
		return;
	}

	// Ask which entity to delete
	const { entityName } = await inquirer.prompt([
		{
			type: "list",
			name: "entityName",
			message: "Which CRUD module would you like to delete?",
			choices: entities,
		},
	]);

	// Confirm deletion
	const confirmed = await confirmDeletion(entityName);

	if (!confirmed) {
		console.log(chalk.blue("\nDeletion cancelled."));
		return;
	}

	// Delete files
	await deleteFiles(entityName);

	// Update routes/index.ts
	await updateRouteIndex(entityName);

	console.log(chalk.blue("\n✨ CRUD module deleted successfully!"));
}

main().catch((error) => {
	console.error(chalk.red("\nAn error occurred:"), error);
	process.exit(1);
});
