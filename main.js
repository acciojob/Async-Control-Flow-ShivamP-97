const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function mergeCsvFiles(files, outputFile) {
  try {
    const results = await Promise.all(
      files.map(file => {
        return new Promise((resolve, reject) => {
          const rows = [];
          fs.createReadStream(file)
            .pipe(csv())
            .on('data', data => rows.push(data))
            .on('end', () => resolve(rows))
            .on('error', reject);
        });
      })
    );

    const mergedData = results.flat();

    if (mergedData.length === 0) {
      throw new Error("No data found");
    }

    const headers = Object.keys(mergedData[0]).map(key => ({
      id: key,
      title: key
    }));

    const csvWriter = createCsvWriter({
      path: outputFile,
      header: headers
    });

    await csvWriter.writeRecords(mergedData);
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = { mergeCsvFiles };
