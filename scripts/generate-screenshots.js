/*
 Generates real screenshots from the local demo video using ffmpeg-static.
 Output files are written to docs/screenshots and renamed to the expected names.
*/

const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

if (!ffmpegStatic) {
  console.error('ffmpeg-static binary not found. Please ensure ffmpeg-static is installed.');
  process.exit(1);
}

ffmpeg.setFfmpegPath(ffmpegStatic);

const projectRoot = path.resolve(__dirname, '..');
const inputVideoPath = path.resolve(projectRoot, 'navi_s.mp4');
const outputDirectoryPath = path.resolve(projectRoot, 'docs', 'screenshots');

if (!fs.existsSync(inputVideoPath)) {
  console.error(`Input video not found: ${inputVideoPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDirectoryPath, { recursive: true });

const tempPattern = 'frame-%i.png';
const targetNames = [
  'enhanced-gaming-dashboard.png',
  'ai-interview-preparation.png',
  'ai-modal-system.png',
  'ai-resume-builder.png',
  'enhanced-job-board.png',
];

console.log('Generating screenshots...');

ffmpeg(inputVideoPath)
  .on('error', (err) => {
    console.error('Failed to generate screenshots:', err && err.message ? err.message : err);
    process.exit(1);
  })
  .on('end', () => {
    try {
      const created = [];
      for (let index = 1; index <= targetNames.length; index += 1) {
        const sourceFilePath = path.join(outputDirectoryPath, tempPattern.replace('%i', String(index)));
        const destinationFilePath = path.join(outputDirectoryPath, targetNames[index - 1]);
        if (fs.existsSync(sourceFilePath)) {
          if (fs.existsSync(destinationFilePath)) {
            fs.rmSync(destinationFilePath);
          }
          fs.renameSync(sourceFilePath, destinationFilePath);
          created.push(destinationFilePath);
        }
      }
      console.log('Created screenshots:');
      created.forEach((filePath) => console.log(` - ${path.relative(projectRoot, filePath)}`));
      process.exit(0);
    } catch (renameError) {
      console.error('Error while renaming screenshots:', renameError && renameError.message ? renameError.message : renameError);
      process.exit(1);
    }
  })
  .screenshots({
    count: targetNames.length,
    filename: tempPattern,
    folder: outputDirectoryPath,
    size: '1280x?'
  });

