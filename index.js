import fs from 'fs';
import readline from 'readline';
import jsdom from 'jsdom';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

function createBookmarklets() {
  // Input and output file paths
  const inputFile = 'template.html'; // Replace with your input file path
  const outputFile = 'bookmarklets.html'; // Replace with your output file path

  // Create a read and write streams for the input and the output files
  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  // Create a readline interface
  const rl = readline.createInterface({
    input: readStream,
    output: process.stdout,
    terminal: false
  });

  // Process each line
  rl.on('line', (line) => {

    // Create a DOM from the HTML string
    const dom = new jsdom.JSDOM(line);

    // Find anchor element and get it's text
    const anchor = dom.window.document.querySelector('a');
    const site = anchor.textContent;
    const fileName1 = `${site.toLocaleLowerCase()}-512.png`;
    const fileName2 = `${site.toLocaleLowerCase()}-32.png`;

    createRoundedCorners(fileName1, fileName2);

    // Build the full path to the file in the 'images' subfolder
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const filePath = path.join(__dirname, 'images', fileName2);

    const base64string = imageToBase64(filePath);

    line = line.replace('{{base64}}', base64string);

    console.log(`${site} bookmarklet is created.`)

    // Write each line to the output file
    writeStream.write(line + '\n');
  });

  // Close the write stream when done
  rl.on('close', () => {
    console.log(`COMPLETED: ${writeStream.path} file is generated sucessfully.`);
    writeStream.end();
  });
}

// Function to convert an image to Base64
function imageToBase64(filePath) {
  // Read the file as a binary buffer
  const fileBuffer = fs.readFileSync(filePath);
  // Convert the buffer to a Base64 string
  const base64String = `data:image/png;base64,${fileBuffer.toString('base64')}`;
  return base64String;
}

// Function to create rounded corners
function createRoundedCorners(fileName1, fileName2) {
  const inputImage = 'images/' + fileName1;
  const outputImage = 'images/' + fileName2;
  sharp(inputImage)
    .resize(32) // Optional: Resize the image (you can skip this step if not needed)
    .composite([{
      input: Buffer.from('<svg width="32" height="32"><rect x="0" y="0" width="32" height="32" rx="5" ry="5" fill="white" /></svg>'),
      blend: 'dest-in'
    }])
    .toFile(outputImage);
}

createBookmarklets();