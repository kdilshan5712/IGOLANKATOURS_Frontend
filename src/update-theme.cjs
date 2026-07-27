const fs = require('fs');
const path = require('path');

const srcDir = __dirname;

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.css')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const replacements = [
  // Backgrounds
  { pattern: /background-color:\s*(#ffffff|#fff|white|#f9fafb|#f8fafc);/gi, replacement: 'background-color: var(--color-bg-card);' },
  { pattern: /background:\s*(#ffffff|#fff|white|#f9fafb|#f8fafc);/gi, replacement: 'background: var(--color-bg-card);' },
  { pattern: /background-color:\s*var\(--color-bg-page\);/gi, replacement: 'background-color: var(--color-bg-page);' },
  
  // Borders
  { pattern: /border:\s*1px\s*solid\s*(#e5e7eb|#d1d5db|#cbd5e1|#e2e8f0);/gi, replacement: 'border: 1px solid var(--glass-border);' },
  { pattern: /border-top:\s*1px\s*solid\s*(#e5e7eb|#d1d5db|#cbd5e1|#e2e8f0);/gi, replacement: 'border-top: 1px solid var(--glass-border);' },
  { pattern: /border-bottom:\s*1px\s*solid\s*(#e5e7eb|#d1d5db|#cbd5e1|#e2e8f0);/gi, replacement: 'border-bottom: 1px solid var(--glass-border);' },
  { pattern: /border-color:\s*(#e5e7eb|#d1d5db|#cbd5e1|#e2e8f0);/gi, replacement: 'border-color: var(--glass-border);' },

  // Text colors (Dark -> Light)
  { pattern: /color:\s*(#111827|#1f2937|#000|#000000|black|#0f172a|#1e293b|var\(--color-primary\));/gi, replacement: 'color: var(--color-text-primary);' },
  { pattern: /color:\s*(#374151|#4b5563|#334155|#475569);/gi, replacement: 'color: var(--color-text-secondary);' },
  { pattern: /color:\s*(#6b7280|#9ca3af|#64748b|#94a3b8);/gi, replacement: 'color: var(--color-text-muted);' },

  // Box Shadows (Make them darker)
  { pattern: /box-shadow:\s*0\s+4px\s+6px\s+-1px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/gi, replacement: 'box-shadow: var(--shadow-md)' },
  { pattern: /box-shadow:\s*0\s+10px\s+15px\s+-3px\s+rgba\(0,\s*0,\s*0,\s*0\.1\)/gi, replacement: 'box-shadow: var(--shadow-lg)' }
];

walk(srcDir, (err, results) => {
  if (err) throw err;
  
  // Exclude index.css as we already updated it manually
  const filesToProcess = results.filter(f => !f.includes('index.css') && !f.includes('AboutPage.css') && !f.includes('ChatAgentPage.css') && !f.includes('Footer.css') && !f.includes('HeroSection.css'));

  console.log(`Found ${filesToProcess.length} CSS files to process...`);
  
  let modifiedCount = 0;

  filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      modifiedCount++;
      console.log(`Updated: ${path.basename(file)}`);
    }
  });

  console.log(`\nTheme conversion complete! Modified ${modifiedCount} files.`);
});
