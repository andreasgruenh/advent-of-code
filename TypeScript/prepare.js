const fs = require('fs');
const path = require('path');

const day = process.argv[2];
const year = process.argv[3];

const content = `import getInput from '../lib/getInput'
import { stringToLines } from '../lib/ts-it/lines';

const input = getInput(${+day}, ${year});
const lines = stringToLines(input);

let result
for (const line of lines) {
  console.log(line)
}

console.log(result)

`;

fs.writeFileSync(path.join(__dirname, `src/${year}/${day}.ts`), content);
