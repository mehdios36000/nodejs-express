import fs from "fs";

// HOW to use it:
// yarn create:crud __ENTITY__ field1:type1,field2:type2...

const entityName = process.argv[2];
const fields: string = process.argv[3];

const mongooseTypes = {
  string: '{ type: DataTypes.STRING }',
  int: '{ type: DataTypes.INTEGER }',
  date: '{ type: DataTypes.DATE, default: Date.now }',
  double: '{ type: DataTypes.DOUBLE }',
  boolean: '{ type: DataTypes.BOOLEAN }',
  id: '{ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }',
  fid: '{ type: DataTypes.UUID, allowNull: false }',
  array: '{ type: DataTypes.tsON, allowNull: false }',
  object: '{ type: DataTypes.tsON, allowNull: false }',
  text: '{ type: DataTypes.TEXT, allowNull: false }',
};

const joiTypes = {
  string: 'string()',
  int: 'number()',
  date: 'date()',
  double: 'number()',
  boolean: 'boolean()',
  id: 'string()',
  fid: 'string()',
  array: 'array()',
  text: 'string()',
  object: 'object()',
};

const generateModelFields = () => {
  let text = '';
  fields.split(',').forEach((field) => {
    text += `    ${field.split(':')[0]}: ${
      mongooseTypes[field.split(':')[1] as keyof typeof mongooseTypes]
    },\n`;
  });
  return text;
};

const generateSchemaFields = () => {
  let text = '';
  fields.split(',').forEach((field) => {
    text += `  ${field.split(':')[0]}: Joi.${joiTypes[field.split(':')[1] as keyof typeof joiTypes]}.required(),\n`;
  });
  return text;
};

// SERVICE
fs.readFile('./templates/crud-service-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName)
    .replace(
      /__MODEL__/g,
      entityName.charAt(0).toUpperCase() + entityName.slice(1),
    )
    .replace(/__SCHEMA__/g, generateSchemaFields());
  fs.writeFile(`./src/services/${entityName}.ts`, data, (err) => {
    if (err) console.log(err);
    console.log('Service created');
  });
});

fs.readFile('./templates/crud-controller-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName)
    .replace(
      /__MODEL__/g,
      entityName.charAt(0).toUpperCase() + entityName.slice(1),
    );
  fs.writeFile(`./src/controllers/${entityName}.ts`, data, (err) => {
    if (err) console.log(err);
    console.log('Controller created.');
  });
});



fs.readFile('./templates/crud-route-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName);
  fs.writeFile(`./src/routes/${entityName}.ts`, data, (err) => {
    if (err) console.log(err);
    console.log('Router created.');
  });
});

fs.readFile('./src/routes/index.ts', (error, buff) => {
  const data = buff
    .toString()
    .replace('// __IMPORT__', `import ${entityName} from '@routes/${entityName}'\n// __IMPORT__`)
    .replace('// __ROUTE__', `router.use('/${entityName}s', ${entityName});\n// __ROUTE__`);
  fs.writeFile('./src/routes/index.ts', data, (err) => {
    if (err) console.log(err);
    console.log('Route Added.');
  });
});
