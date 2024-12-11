import fs from 'fs';
import path from 'path';
import url from 'url';
import sharp from 'sharp';

function createBookmarklets() {
  // Build the full path to the file in the 'images' subfolder
  const scriptFolder = path.dirname(url.fileURLToPath(import.meta.url));
  // Define the paths to the input and output files
  const templateFile = path.join(scriptFolder, 'template.html');
  const bookmarkletsFile = path.join(scriptFolder, 'bookmarklets.html');

  // Read the content of the input file
  fs.readFile(templateFile, 'utf8', async (err, data) => {
    if (err) console.error('Error reading the file:', err);

    // Split text into lines
    let lines = data.split(/\r?\n/);

    // Process each line to create bookmarklets and save them to the output file
    for (let index = 0; index < lines.length; index++) {
      // Extract the site name from the line
      const site = lines[index].split('ICON="{{base64}}">')[1].replace('</A>', '')
      const imageFile = path.join(scriptFolder, 'images', `${site.toLocaleLowerCase()}.png`);

      // Create a rounded corners version of the image using Sharp
      const imageBuffer = await sharp(imageFile)
      .resize(32) // Resize to 32x32 pixels
      .composite([{ // Create a rounded corner rect using SVG
        input: Buffer.from('<svg width="32" height="32"><rect x="0" y="0" width="32" height="32" rx="5" ry="5" fill="white" /></svg>'), // Input the rounded corner rect as a buffer
        blend: 'dest-in' // Combine the original image with the rounded corner rect using the 'dest-in' blend mode
      }])
      .toBuffer();

      // Check if the image creation was successful
      if (!imageBuffer) {
        console.error(`Error creating rounded corners for ${site}`);
        return;
      }
      // Convert the image buffer to a Base64 string for embedding in the HTML file
      const base64String = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      // Replace the icon in the HTML file with the Base64 string
      lines[index] = lines[index].replace('{{base64}}', base64String);

      console.log(`${site} bookmarklet is created successfully.`)
    }

    // Join the lines back into a single string and write it to the output file
    data = lines.join('\n');

    fs.writeFile(bookmarkletsFile, data, 'utf8', (err) => {
      if (err) console.error('Error writing to file:', err);
      console.log(`${bookmarkletsFile} created successfully.`);
    });
  });
}

createBookmarklets();
