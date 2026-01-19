const fs = require('fs');
const { promisify } = require('util');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const readFileAsync = promisify(fs.readFile);

/**
 * Reads multiple CSV files and merges them into a single file.
 * @param {string[]} files - An array of file paths to read.
 * @param {string} outputFile - The file path to write the merged data to.
 * @returns {Promise<void>}
 */
async function mergeCsvFiles(files, outputFile) {
  try {
    const results = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const data = [];
          fs.createReadStream(file)
            .pipe(csv())
            .on('data', (row) => {
              Object.keys(row).forEach(key => {
                row[key] = row[key].trim();
              });
              data.push(row);
            })
            .on('end', () => resolve(data))
            .on('error', reject);
        });
      })
    );

    const mergedData = results.flat();

    if (mergedData.length === 0) {
      throw new Error("No data to write");
    }

    const csvWriter = createCsvWriter({
      path: outputFile,
      header: Object.keys(mergedData[0]).map(key => ({
        id: key,
        title: key
      }))
    });

    await csvWriter.writeRecords(mergedData);

  } catch (error) {
    throw new Error(`Error merging CSV files: ${error.message}`);
  }
}

module.exports = { mergeCsvFiles };
