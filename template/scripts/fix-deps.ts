import fs from "fs";
import path from "path";


const pathToDepHttpStatus = path.join(__dirname, "../node_modules/http-status-ts/package.json");



fs.readFile(pathToDepHttpStatus, (error, buff) => {
  const data = buff
    .toString()
    .replace(/"type": "module"/, '"type": "commonjs"');
  fs.writeFile(pathToDepHttpStatus
    , data, (err) => {
    if (err) console.log(err);
    console.log('Dependency fixed');
  });

}
);
