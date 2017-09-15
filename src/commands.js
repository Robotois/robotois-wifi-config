// const util = require('util');
const exec = require('child_process').exec;
// const exec = util.promisify(require('child_process').exec);

const execute = command => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      reject(error);
      return;
    }
    console.log(stdout);
    resolve(stdout);
    // console.log(`stderr: ${stderr}`);
  });
});


// const { exec } = require('child_process');

module.exports = execute;

// const { execSync } = require('child_process');
//
// const execute = (command) => {
//   console.log('Here!!', command);
//   execSync(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error [${command}]: ${error}`);
//       return;
//     }
//     console.log(`stdout [${command}]: ${stdout}`);
//     // console.log(`stderr [${command}]: ${stderr}`);
//   });
// };
//
// module.exports = execute;
