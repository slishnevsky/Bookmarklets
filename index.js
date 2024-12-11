import fs from 'fs';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

function createBookmarklets() {
  // Input and output file paths
  const inputFile = 'template.html'; // Replace with your input file path
  const outputFile = 'bookmarklets.html'; // Replace with your output file path

  // Build the full path to the file in the 'images' subfolder
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  // Read the file
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) console.error('Error reading the file:', err);

    // Split text into lines
    let lines = data.split(/\r?\n/);

    for (let index = 0; index < lines.length; index++) {
      // Extract the site name from the line
      const site = lines[index].split('ICON="{{base64}}">')[1].replace('</A>', '')
      const fileName1 = `${site.toLocaleLowerCase()}-512.png`;
      const fileName2 = `${site.toLocaleLowerCase()}-32.png`;

      createRoundedCorners(fileName1, fileName2);

      const filePath = path.join(__dirname, 'images', fileName2);
      const base64string = imageToBase64(filePath);
      lines[index] = lines[index].replace('{{base64}}', base64string);
      console.log(`${site} bookmarklet is created successfully.`)
    }

    data = lines.join('\n');

    // Write the text into a file named 'output.txt'
    fs.writeFile(outputFile, data, 'utf8', (err) => {
      if (err) console.error('Error writing to file:', err);
      console.log(`${outputFile} created successfully.`);
    });
  });
}

// Function to convert an image file to a Base64 string
function imageToBase64(filePath) {
  try {
    // Read the image file synchronously
    const imageBuffer = fs.readFileSync(filePath);

    // Convert the file buffer to a Base64 string
    const base64String = imageBuffer.toString('base64');

    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error('Error reading file:', error.message);
  }
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
    .toFile(outputImage)
}

createBookmarklets();

// console.log(imageToBase64('d:\\Projects\\Bookmarklets\\images\\kijiji-32.png'));