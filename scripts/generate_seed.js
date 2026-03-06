const fs = require('fs');
const path = require('path');

const branches = ['Income Tax', 'VAT', 'Customs'];
const types = ['ACT', 'SRO', 'GO', 'SO', 'Circular'];

const bengaliWords = [
  'আইন', 'প্রজ্ঞাপন', 'নীতিমালা', 'পরিপত্র', 'আদেশ', 'খসড়া', 'সংশোধন', 
  'তালিকা', 'অব্যাহতি', 'শুল্ক', 'কর', 'আমদানি', 'রপ্তানি', 'ব্যবসায়',
  'শিল্প', 'উন্নয়ন', 'বাজেট', 'অর্থবছর', 'রাজস্ব', 'বোর্ড', 'জাতীয়'
];

function getRandomBengaliTitle(branch, type, index) {
  const words = [];
  for (let i = 0; i < 3; i++) {
    words.push(bengaliWords[Math.floor(Math.random() * bengaliWords.length)]);
  }
  const year = 2010 + Math.floor(Math.random() * 16);
  const refNo = Math.floor(Math.random() * 500) + 1;
  
  if (type === 'SRO') return `এসআরও নং-${refNo}-আইন/${year}/${index}`;
  if (type === 'ACT') return `${words.join(' ')} আইন, ${year}`;
  if (type === 'Circular') return `${branch} পরিপত্র (${year}-${year+1})`;
  if (type === 'GO') return `${branch} সাধারণ আদেশ নং-${refNo}/${year}`;
  if (type === 'SO') return `${branch} বিশেষ আদেশ নং-${refNo}/${year}`;
  return `${words.join(' ')} সংক্রান্ত নির্দেশিকা`;
}

function generateContent(title, branch) {
  return `# ${title}
  
## ভূমিকা
এই ${branch} সংক্রান্ত আইন/নির্দেশিকাটি যথাযথভাবে পালন করতে হইবে। 

### ধারা ১
সরকার কর্তৃক নির্ধারিত বিধি মোতাবেক এই কার্যক্রম পরিচালিত হইবে।

### ধারা ২
কোনো ব্যক্তি বা প্রতিষ্ঠান এই নিয়ম লঙ্ঘন করিলে প্রচলিত আইন অনুযায়ী দণ্ডিত হইবেন।

### ধারা ৩
এই আদেশ অবিলম্বে কার্যকর হইবে এবং পরবর্তী নির্দেশ না দেওয়া পর্যন্ত বলবৎ থাকিবে।`;
}

const allDocs = [];

// Base 210 documents (14 for each of the 15 combinations)
for (const branch of branches) {
  for (const type of types) {
    for (let i = 1; i <= 15; i++) {
      const index = allDocs.length + 1;
      const title = getRandomBengaliTitle(branch, type, index);
      const year = 2010 + Math.floor(Math.random() * 16);
      const content = generateContent(title, branch);
      const sectionRef = `Section ${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 10) + 1}`;
      const date = `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
      
      allDocs.push({
        title,
        branch,
        type,
        year,
        content: content.replace(/'/g, "''"),
        sectionRef,
        date,
        isLatest: i === 15
      });
    }
  }
}

let sql = `-- Seeding the legal_documents table with 200+ docs\n\n`;
sql += `INSERT INTO legal_documents (title, branch, type, year, content, section_reference, effective_date, is_latest)\nVALUES\n`;

const values = allDocs.map(doc => {
  return `  (
    '${doc.title}',
    '${doc.branch}',
    '${doc.type}',
    ${doc.year},
    '${doc.content}',
    '${doc.sectionRef}',
    '${doc.date}',
    ${doc.isLatest}
  )`;
});

sql += values.join(',\n') + ';\n';

const outputPath = path.join(__dirname, '../supabase/seed.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Successfully generated ${allDocs.length} documents in ${outputPath}`);
