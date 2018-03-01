const fs = require('fs');

const fileWriter = (filePath, dataProcessor) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const newData = dataProcessor(data);
    fs.writeFile(filePath, newData, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`"${filePath}" processed correctly!`);
    });
  });
};

module.exports = fileWriter;
