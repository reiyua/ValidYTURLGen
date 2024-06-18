// import required modules (npm install axios)
const fs = require('fs');
const axios = require('axios');
const path = require('path');

// set variables such as API and where the html file is stored
const API_KEY = 'YOUR_YOUTUBE_DATA_API_KEY';  // Replace with your actual YouTube Data API key
const htmlFilePath = path.join('/var/www/html', 'index.html'); // Set the file path to /var/www/html/index.html (or any other path you want, directory path and file name must be seperate in brackets)


// inital math by "SpiritAxolotl" on GitHub (https://github.com/SpiritAxolotl)
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTVWXYZ0123456789-_".split("");
const randomChar = () => {
  return chars[Math.floor(Math.random() * chars.length)];
};
const xRandomChars = (n) => {
  let out = "";
  for (let i = 0; i < n; i++)
    out += randomChar();
  return out;
};

// Create URL from above math, post it to YouTube API using a GET request and check if the video is public and embeddable.
const checkUrl = async (videoId) => {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=status`;
  try {
    const response = await axios.get(url);
    if (response.data.items && response.data.items.length > 0) {
      const videoStatus = response.data.items[0].status;
      // Check if the video is public and embeddable
      if (videoStatus.embeddable && videoStatus.privacyStatus === 'public') {
        return true;
      }
    }
    // If the bot is rate limited, produce an error message and wait for a while, otherwise continue
  } catch (error) {
    console.error('Error checking video ID:', error.message);
  }
  return false;
};
// print message in console listing each URL generated and if it is valid or not for debugging purposes.
const generateAndCheckUrl = async () => {
  while (true) {
    const videoId = xRandomChars(11);
    const url = `https://youtu.be/${videoId}`;
    const isValid = await checkUrl(videoId);
    if (isValid) {
      console.log(`Valid URL: ${url}`);
      appendToHtmlFile(url);
    } else {
      console.log(`Invalid URL: ${url}`);
    }
  }
};
// print message in console if the URL is appended to the HTML file or if an error occurs for debugging purposes.
const appendToHtmlFile = (url) => {
  const linkHtml = `<a href="${url}" target="_blank">${url}</a><br>\n`;
  fs.appendFile(htmlFilePath, linkHtml, (err) => {
    if (err) {
      console.error('Error writing to HTML file:', err);
    } else {
      console.log('URL appended to HTML file:', url);
    }
  });
};

// Initialize HTML file with basic structure and a header
fs.writeFile(htmlFilePath, '<!DOCTYPE html><html><head><title>Valid YouTube URLs</title></head><body>\n<h1>Valid Public YouTube URLs</h1>\n<p>for any concerns, contact rei@reiyua.lol\n<p>Valid URLs will be listed below:</p>\n', (err) => {
  if (err) {
    console.error('Error initializing HTML file:', err);
  } else {
    generateAndCheckUrl();
  }
});

// Ensure HTML file is properly closed with a </body> and </html> on process exit
process.on('exit', () => {
  fs.appendFileSync(htmlFilePath, '</body></html>');
});

process.on('SIGINT', () => {
  process.exit();
});
