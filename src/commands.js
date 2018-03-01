const exec = require('child_process').exec;

const execute = command => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      reject(error);
      return;
    }
    console.log(stdout);
    resolve(stdout);
  });
});

module.exports = execute;
