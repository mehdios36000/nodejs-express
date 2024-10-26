import fs from "fs";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";

interface FieldOptions {
  isId: boolean;
  isUnique: boolean;
  default?: string;
  map?: string;
  length?: number;
  dbType?: string;
}

const prismaSchemaPath = path.join(__dirname, "../prisma", "schema.prisma");

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const generatePrismaField = (
  name: string,
  type: string,
  options: FieldOptions
): string => {
  let fieldLine = `  ${name} ${type}`;

  if (options.isId) {
    fieldLine += " @id";
    if (type.toLowerCase() === "string") {
      fieldLine += " @default(cuid())";
    } else if (type.toLowerCase() === "int") {
      fieldLine += " @default(autoincrement())";
    }
  } else {
    if (options.isUnique) fieldLine += " @unique";
    if (options.default) fieldLine += ` @default(${options.default})`;
    if (options.map) fieldLine += ` @map("${options.map}")`;
    if (options.length) fieldLine += ` @db.VarChar(${options.length})`;
    if (options.dbType) fieldLine += ` @db.${options.dbType}`;
  }

  return fieldLine;
};

const createSchema = async (): Promise<void> => {
  console.log(
    chalk.blue(
      figlet.textSync("Prisma Schema Builder", { horizontalLayout: "full" })
    )
  );

  const { tableName } = await inquirer.prompt({
    type: "input",
    name: "tableName",
    message: chalk.green("Enter table name:"),
  });

  const attributes: string[] = [];
  let addMoreFields = true;

  while (addMoreFields) {
    const {
      fieldName,
      fieldType,
      isId,
      isUnique,
      defaultValue,
      mapValue,
      length,
      dbType,
    } = await inquirer.prompt([
      {
        type: "input",
        name: "fieldName",
        message: chalk.green("Enter attribute name:"),
      },
      {
        type: "input",
        name: "fieldType",
        message: chalk.green("Enter attribute type (Int, String, DateTime, Float, etc.):"),
      },
      {
        type: "confirm",
        name: "isId",
        message: chalk.green("Is this field an ID?"),
        default: false,
      },
      {
        type: "confirm",
        name: "isUnique",
        message: chalk.green("Is this field unique?"),
        default: false,
        when: (answers) => !answers.isId,
      },
      {
        type: "input",
        name: "defaultValue",
        message: chalk.green("Enter default value (or leave blank if none):"),
      },
      {
        type: "input",
        name: "mapValue",
        message: chalk.green("Enter mapped name (or leave blank if none):"),
      },
      {
        type: "input",
        name: "length",
        message: chalk.green("Enter length for VarChar (if applicable, leave blank otherwise):"),
        filter: (value) => (value ? parseInt(value) : undefined),
        when: (answers) => answers.fieldType.toLowerCase() === "string" && !answers.isId,
      },
      {
        type: "input",
        name: "dbType",
        message: chalk.green("Enter custom database type (e.g., 'VarChar', 'Text', etc., or leave blank):"),
        when: (answers) => (answers.fieldType.toLowerCase() === "string" || answers.fieldType.toLowerCase() === "int") && !answers.isId,
      },
    ]);

    attributes.push(
      generatePrismaField(fieldName, fieldType, {
        isId,
        isUnique,
        default: defaultValue || undefined,
        map: mapValue || undefined,
        length,
        dbType: dbType || undefined,
      })
    );

    const { addAnother } = await inquirer.prompt({
      type: "confirm",
      name: "addAnother",
      message: chalk.green("Add another attribute?"),
      default: true,
    });

    addMoreFields = addAnother;
  }

  const schemaContent = `model ${capitalize(tableName)} {
${attributes.join("\n")}
}`;

  fs.appendFile(prismaSchemaPath, `\n${schemaContent}\n`, (err) => {
    if (err) {
      console.error(chalk.red("Error writing to schema.prisma:"), err);
    } else {
      console.log(chalk.cyan("Schema successfully added to schema.prisma!"));
    }
  });
};

// Execute the script
createSchema().catch((error) => {
  console.error(chalk.red("An error occurred:"), error);
});
