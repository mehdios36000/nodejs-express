import fs from "node:fs";
import chalk from "chalk";
import inquirer from "inquirer";

const mongooseTypes = {
	string: "{ type: DataTypes.STRING }",
	int: "{ type: DataTypes.INTEGER }",
	date: "{ type: DataTypes.DATE, default: Date.now }",
	double: "{ type: DataTypes.DOUBLE }",
	boolean: "{ type: DataTypes.BOOLEAN }",
	id: "{ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }",
	fid: "{ type: DataTypes.UUID, allowNull: false }",
	array: "{ type: DataTypes.JSON, allowNull: false }",
	object: "{ type: DataTypes.JSON, allowNull: false }",
	text: "{ type: DataTypes.TEXT, allowNull: false }",
};

const joiTypes = {
	string: "string()",
	int: "number()",
	date: "date()",
	double: "number()",
	boolean: "boolean()",
	id: "string()",
	fid: "string()",
	array: "array()",
	text: "string()",
	object: "object()",
};

interface Field {
	name: string;
	type: keyof typeof mongooseTypes;
}

async function promptForEntityDetails() {
	const questions = [
		{
			type: "input",
			name: "entityName",
			message: "What is the name of your entity?",
			validate: (input: string) => {
				if (input.trim() === "") {
					return "Entity name cannot be empty";
				}
				return true;
			},
		},
	];

	const { entityName } = await inquirer.prompt(questions);
	return entityName;
}

async function promptForFields(): Promise<Field[]> {
	const fields: Field[] = [];
	let addMore = true;

	while (addMore) {
		const fieldQuestions = [
			{
				type: "input",
				name: "name",
				message: "Enter field name:",
				validate: (input: string) => {
					if (input.trim() === "") {
						return "Field name cannot be empty";
					}
					return true;
				},
			},
			{
				type: "list",
				name: "type",
				message: "Choose field type:",
				choices: Object.keys(mongooseTypes),
			},
			{
				type: "confirm",
				name: "addAnother",
				message: "Would you like to add another field?",
				default: true,
			},
		];

		const answers = await inquirer.prompt(fieldQuestions);
		fields.push({ name: answers.name, type: answers.type });
		addMore = answers.addAnother;
	}

	return fields;
}

function generateModelFields(fields: Field[]): string {
	return fields
		.map((field) => `    ${field.name}: ${mongooseTypes[field.type]},`)
		.join("\n");
}

function generateSchemaFields(fields: Field[]): string {
	return fields
		.map((field) => `  ${field.name}: Joi.${joiTypes[field.type]}.required(),`)
		.join("\n");
}

async function createFiles(entityName: string, fields: Field[]) {
	try {
		// Create Service
		const serviceTemplate = await fs.promises.readFile(
			"./templates/crud-service-template.txt",
			"utf8",
		);
		const serviceData = serviceTemplate
			.replace(/__ENTITY__/g, entityName)
			.replace(
				/__MODEL__/g,
				entityName.charAt(0).toUpperCase() + entityName.slice(1),
			)
			.replace(/__SCHEMA__/g, generateSchemaFields(fields));
		await fs.promises.writeFile(`./src/services/${entityName}.ts`, serviceData);
		console.log(chalk.green("✓ Service created"));

		// Create Controller
		const controllerTemplate = await fs.promises.readFile(
			"./templates/crud-controller-template.txt",
			"utf8",
		);
		const controllerData = controllerTemplate
			.replace(/__ENTITY__/g, entityName)
			.replace(
				/__MODEL__/g,
				entityName.charAt(0).toUpperCase() + entityName.slice(1),
			);
		await fs.promises.writeFile(
			`./src/controllers/${entityName}.ts`,
			controllerData,
		);
		console.log(chalk.green("✓ Controller created"));

		// Create Route
		const routeTemplate = await fs.promises.readFile(
			"./templates/crud-route-template.txt",
			"utf8",
		);
		const routeData = routeTemplate.replace(/__ENTITY__/g, entityName);
		await fs.promises.writeFile(`./src/routes/${entityName}.ts`, routeData);
		console.log(chalk.green("✓ Router created"));

		// Update index.ts
		const indexContent = await fs.promises.readFile(
			"./src/routes/index.ts",
			"utf8",
		);
		const updatedIndexContent = indexContent
			.replace(
				"// __IMPORT__",
				`import ${entityName} from '@routes/${entityName}'\n// __IMPORT__`,
			)
			.replace(
				"// __ROUTE__",
				`router.use('/${entityName}s', ${entityName});\n// __ROUTE__`,
			);
		await fs.promises.writeFile("./src/routes/index.ts", updatedIndexContent);
		console.log(chalk.green("✓ Route added to index"));

		console.log(chalk.blue("\nCRUD operations created successfully! 🚀"));
	} catch (error) {
		console.error(chalk.red("Error creating files:"), error);
	}
}

async function main() {
	console.log(chalk.blue("🚀 Welcome to the Interactive CRUD Generator 🚀\n"));

	const entityName = await promptForEntityDetails();
	console.log(
		chalk.yellow("\nNow, let's define the fields for your entity:\n"),
	);
	const fields = await promptForFields();

	console.log(chalk.yellow("\nGenerating CRUD files...\n"));
	await createFiles(entityName, fields);
}

main().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
