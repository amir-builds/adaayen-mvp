import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Usage: node upload-test.js --token=<ADMIN_TOKEN> --file=./image.jpg --url=http://localhost:5000
// Or set env: ADMIN_TOKEN and optionally API_URL

const argv = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, v] = arg.split('=');
  return [k.replace(/^--/, ''), v];
}));

const token = argv.token || process.env.ADMIN_TOKEN;
const filePath = argv.file || process.env.IMAGE_PATH;
const apiUrl = (argv.url || process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');

if (!token) {
  console.error('Error: admin token required. Provide --token=<TOKEN> or set ADMIN_TOKEN env var');
  process.exit(1);
}
if (!filePath) {
  console.error('Error: image file path required. Provide --file=./image.jpg or set IMAGE_PATH env var');
  process.exit(1);
}

const resolved = path.resolve(filePath);
if (!fs.existsSync(resolved)) {
  console.error('Error: file not found:', resolved);
  process.exit(1);
}

(async () => {
  try {
    const form = new FormData();
    form.append('name', 'Test Fabric via Script');
    form.append('price', '149.99');
    form.append('fabricType', 'Cotton');
    form.append('color', 'Blue');
    form.append('inStock', 'true');
    form.append('image', fs.createReadStream(resolved));

    const headers = {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    };

    console.log('Uploading to', `${apiUrl}/api/fabrics`);

    const resp = await axios.post(`${apiUrl}/api/fabrics`, form, { headers });

    console.log('Upload successful!');
    console.log(JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Upload failed, status', err.response.status);
      console.error(err.response.data);
    } else {
      console.error('Upload error:', err.message);
    }
    process.exit(1);
  }
})();
