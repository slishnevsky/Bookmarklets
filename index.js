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
    const site = anchor.textContent.toLocaleLowerCase();
    const fileName = site + '.png'; // Image filename

    createRoundedCorners(fileName);

    // Build the full path to the file in the 'images' subfolder
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const filePath = path.join(__dirname, 'images2', fileName);

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
  const base64String = `data:image/png;base64,${fileBuffer.toString('base64')})`;
  return base64String;
}

// Function to create rounded corners
function createRoundedCorners(fileName) {
  const inputImage = 'images1/' + fileName;
  const outputImage = 'images2/' + fileName;
  sharp(inputImage)
    .resize(512) // Optional: Resize the image (you can skip this step if not needed)
    .composite([{
      input: Buffer.from('<svg width="512" height="512"><rect x="0" y="0" width="512" height="512" rx="70" ry="70" fill="white" /></svg>'),
      blend: 'dest-in'
    }])
    .toFile(outputImage);
}

createBookmarklets();