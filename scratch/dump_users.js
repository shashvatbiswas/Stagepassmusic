const fs = require('fs');
const path = require('path');

const dbContent = fs.readFileSync(path.join(__dirname, '../src/api/db.js'), 'utf8');

console.log('--- DB USER RECORDS & DATA ENGINE CHECK ---');
console.log('File size:', dbContent.length, 'bytes');

const masterAdminMatch = dbContent.match(/const masterAdminUser = (\{[\s\S]*?\});/);
if (masterAdminMatch) {
  console.log('\nMaster Admin Record:');
  console.log(masterAdminMatch[1]);
}
