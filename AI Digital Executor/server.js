import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const SANDBOX_DIR = path.join(__dirname, 'demo_sandbox');

// Helper to recursively list files
async function getFiles(dir) {
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

// Calculate MD5 of a file
async function getFileHash(filePath) {
  try {
    const content = await fsPromises.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (err) {
    return null;
  }
}

// Initialize/Reset Sandbox
async function resetSandbox() {
  // Clear sandbox directory
  if (fs.existsSync(SANDBOX_DIR)) {
    await fsPromises.rm(SANDBOX_DIR, { recursive: true, force: true });
  }
  await fsPromises.mkdir(SANDBOX_DIR, { recursive: true });

  // Create folder structure
  const folders = [
    'Downloads',
    'Documents/Taxes',
    'Pictures/Family_Trip_2025',
    'System/Logs',
    'Desktop'
  ];

  for (const f of folders) {
    await fsPromises.mkdir(path.join(SANDBOX_DIR, f), { recursive: true });
  }

  // Helper to write files
  const writeFile = async (relPath, content) => {
    await fsPromises.writeFile(path.join(SANDBOX_DIR, relPath), content);
  };

  // 1. Messy Downloads
  await writeFile('Downloads/invoice_draft_june.pdf', 'INVOICE #98212 - Water Corp\nAmount Due: $150.00\nDue Date: July 15, 2026');
  await writeFile('Downloads/invoice_draft_june_copy.pdf', 'INVOICE #98212 - Water Corp\nAmount Due: $150.00\nDue Date: July 15, 2026'); // Duplicate
  await writeFile('Downloads/receipt_supermarket.txt', 'Walmart Receipt - Total $43.20 - Date: 2026-06-12');
  await writeFile('Downloads/install_helper.exe', 'Binary dummy content');
  await writeFile('Downloads/temp_session_cache.tmp', 'temp session data 12345');
  await writeFile('Downloads/spam_ad_crypto.txt', 'CONGRATULATIONS! You have been selected to claim 10.0 ETH! Click http://phish-secure-ether-claim.net/login now.');

  // 2. Documents & Taxes
  await writeFile('Documents/Taxes/tax_form_1040_2025.txt', 'FORM 1040 - US Individual Income Tax Return\nTax Year: 2025\nDeadline Date: April 15, 2026\nEstimated Refund: $1,450.00\nStatus: Pending Signatures.');
  await writeFile('Documents/kubernetes_notes.txt', 'Kubernetes is an open-source container orchestration system.\nUse kubectl apply -f deployment.yaml to deploy containers.\nKey components: Pods, Services, Deployments, ConfigMaps.');
  await writeFile('Documents/banana_bread_recipe.txt', 'Banana Bread Recipe:\nIngredients:\n- 3 ripe bananas\n- 1/3 cup melted butter\n- 1 tsp baking soda\n- 1 cup sugar\n- 1 egg\n- 1.5 cups flour\nBake at 350F for 1 hour.');
  await writeFile('Documents/passport_scan_digital.txt', 'DOCUMENT TYPE: PASSPORT\nISSUING STATE: UNITED STATES\nPASSPORT NO: A9823412B\nSURNAME: DOE\nGIVEN NAMES: JANE\nDATE OF BIRTH: 12 AUG 1995\nEXPIRY DATE: 20 DEC 2032');

  // 3. Pictures
  await writeFile('Pictures/Family_Trip_2025/DSCN0012.jpg', 'fake image bytes - Sunset beach');
  await writeFile('Pictures/Family_Trip_2025/DSCN0012_copy.jpg', 'fake image bytes - Sunset beach'); // Duplicate
  await writeFile('Pictures/Family_Trip_2025/DSCN0013.jpg', 'fake image bytes - Family lunch');
  await writeFile('Pictures/Family_Trip_2025/blurred_photo.jpg', 'blurry pixels'); // Blur simulation

  // 4. System Logs & Temp files
  await writeFile('System/Logs/app_start_log.txt', '2026-06-10T12:00:00: App started successfully.\nSystem health OK.');
  await writeFile('System/Logs/error_trace.log', '2026-06-11T14:32:10: ERROR NullPointerException in indexer.js');
  await writeFile('System/Logs/temp_core_dump.tmp', 'heap crash dump contents');
}

// Reset Endpoint
app.post('/api/sandbox/reset', async (req, res) => {
  try {
    await resetSandbox();
    res.json({ success: true, message: 'Sandbox reset successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status Endpoint (File count, folders, total size, structure)
app.get('/api/sandbox/status', async (req, res) => {
  try {
    if (!fs.existsSync(SANDBOX_DIR)) {
      await resetSandbox();
    }

    const allFiles = await getFiles(SANDBOX_DIR);
    let totalSize = 0;
    const filesList = [];

    for (const f of allFiles) {
      const stats = await fsPromises.stat(f);
      totalSize += stats.size;
      filesList.push({
        path: path.relative(SANDBOX_DIR, f).replace(/\\/g, '/'),
        size: stats.size,
        modified: stats.mtime
      });
    }

    res.json({
      success: true,
      totalFiles: filesList.length,
      totalSize,
      files: filesList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Digital Executor endpoint: Run natural language requests
app.post('/api/execute', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const logs = [];
  const normalizedCmd = command.toLowerCase();

  try {
    if (!fs.existsSync(SANDBOX_DIR)) {
      await resetSandbox();
    }

    const allFiles = await getFiles(SANDBOX_DIR);

    if (normalizedCmd.includes('organize') || normalizedCmd.includes('tidy') || normalizedCmd.includes('group') || normalizedCmd.includes('sort')) {
      // Organize action
      logs.push({ step: 'Scanning files in sandbox...', status: 'done' });
      
      const organizedDir = path.join(SANDBOX_DIR, 'Organized');
      await fsPromises.mkdir(organizedDir, { recursive: true });
      
      const categories = {
        Images: ['.jpg', '.jpeg', '.png', '.gif'],
        Documents: ['.pdf', '.txt', '.docx', '.csv', '.xlsx'],
        Executables: ['.exe', '.msi', '.bat'],
        Archives: ['.zip', '.rar', '.tar', '.gz'],
        Temp: ['.tmp', '.log']
      };

      for (const cat of Object.keys(categories)) {
        await fsPromises.mkdir(path.join(organizedDir, cat), { recursive: true });
      }

      let movedCount = 0;
      let deletedCount = 0;

      for (const f of allFiles) {
        const ext = path.extname(f).toLowerCase();
        const base = path.basename(f);
        
        // Skip files already inside Organized folder
        if (f.includes(path.join(SANDBOX_DIR, 'Organized'))) {
          continue;
        }

        let matchedCat = null;
        for (const [cat, extensions] of Object.entries(categories)) {
          if (extensions.includes(ext)) {
            matchedCat = cat;
            break;
          }
        }

        if (matchedCat) {
          if (matchedCat === 'Temp') {
            // Delete temp files as part of organization
            await fsPromises.unlink(f);
            logs.push({ step: `Deleted temporary file: ${path.relative(SANDBOX_DIR, f).replace(/\\/g, '/')}`, status: 'success' });
            deletedCount++;
          } else {
            const destPath = path.join(organizedDir, matchedCat, base);
            // Handle name collision
            let finalDest = destPath;
            if (fs.existsSync(destPath)) {
              const parsed = path.parse(destPath);
              finalDest = path.join(parsed.dir, `${parsed.name}_organized${parsed.ext}`);
            }
            
            await fsPromises.rename(f, finalDest);
            logs.push({ 
              step: `Moved ${path.relative(SANDBOX_DIR, f).replace(/\\/g, '/')} to Organized/${matchedCat}/`, 
              status: 'success' 
            });
            movedCount++;
          }
        }
      }

      logs.push({ step: `Organization complete. Moved ${movedCount} files, deleted ${deletedCount} temp files.`, status: 'done' });
      return res.json({ success: true, logs, action: 'organize' });

    } else if (normalizedCmd.includes('duplicate') || normalizedCmd.includes('archive duplicates')) {
      // Find duplicates or move duplicates
      logs.push({ step: 'Scanning for duplicates by MD5 content hash...', status: 'done' });
      
      const fileHashMap = {};
      const duplicates = [];

      for (const f of allFiles) {
        // Skip already organized duplicates or files in archive
        if (f.includes('Archive_Duplicates')) continue;

        const hash = await getFileHash(f);
        if (hash) {
          if (fileHashMap[hash]) {
            duplicates.push(f);
          } else {
            fileHashMap[hash] = f;
          }
        }
      }

      if (duplicates.length === 0) {
        logs.push({ step: 'No duplicate files found.', status: 'info' });
        return res.json({ success: true, logs, action: 'find_duplicates' });
      }

      const archiveDir = path.join(SANDBOX_DIR, 'Archive_Duplicates');
      await fsPromises.mkdir(archiveDir, { recursive: true });

      for (const dup of duplicates) {
        const base = path.basename(dup);
        await fsPromises.rename(dup, path.join(archiveDir, base));
        logs.push({ step: `Archived duplicate: ${path.relative(SANDBOX_DIR, dup).replace(/\\/g, '/')} -> Archive_Duplicates/${base}`, status: 'success' });
      }

      logs.push({ step: `Successfully archived ${duplicates.length} duplicate files.`, status: 'done' });
      return res.json({ success: true, logs, action: 'archive_duplicates' });

    } else if (normalizedCmd.includes('clean') || normalizedCmd.includes('purge') || normalizedCmd.includes('temp') || normalizedCmd.includes('clear log')) {
      // Clean temp logs/files
      logs.push({ step: 'Searching for system logs and temporary cache files...', status: 'done' });
      
      let deletedCount = 0;
      for (const f of allFiles) {
        const ext = path.extname(f).toLowerCase();
        if (ext === '.tmp' || ext === '.log') {
          await fsPromises.unlink(f);
          logs.push({ step: `Deleted temp file: ${path.relative(SANDBOX_DIR, f).replace(/\\/g, '/')}`, status: 'success' });
          deletedCount++;
        }
      }

      logs.push({ step: `Clean up complete. Removed ${deletedCount} temp/log files.`, status: 'done' });
      return res.json({ success: true, logs, action: 'clean_temp' });

    } else if (normalizedCmd.includes('reset') || normalizedCmd.includes('restore') || normalizedCmd.includes('setup') || normalizedCmd.includes('populate')) {
      logs.push({ step: 'Reset request received.', status: 'info' });
      logs.push({ step: 'Clearing and rebuilding sandboxed filesystem...', status: 'loader' });
      await resetSandbox();
      logs.push({ step: 'Sandbox successfully reset to default messy state.', status: 'success' });
      return res.json({ success: true, logs, action: 'reset' });

    } else if (normalizedCmd.startsWith('search') || normalizedCmd.startsWith('find') || normalizedCmd.startsWith('locate')) {
      // Extract keyword
      const queryWord = command.split(' ').slice(1).join(' ').trim();
      if (!queryWord) {
        logs.push({ step: 'Please specify a keyword to search, e.g. "find Kubernetes"', status: 'warning' });
        return res.json({ success: true, logs, action: 'search' });
      }
      logs.push({ step: `Executing local index search for keyword: "${queryWord}"...`, status: 'loader' });
      let matchedCount = 0;
      for (const f of allFiles) {
        const ext = path.extname(f).toLowerCase();
        if (['.txt', '.pdf', '.json', '.log', '.csv'].includes(ext)) {
          const content = await fsPromises.readFile(f, 'utf8');
          if (content.toLowerCase().includes(queryWord.toLowerCase())) {
            matchedCount++;
            logs.push({ step: `Match found in: ${path.relative(SANDBOX_DIR, f).replace(/\\/g, '/')}`, status: 'success' });
            // find snippet
            const snippet = content.split('\n').find(line => line.toLowerCase().includes(queryWord.toLowerCase()))?.trim();
            if (snippet) {
              logs.push({ step: `  Snippet: "...${snippet}..."`, status: 'info' });
            }
          }
        }
      }
      logs.push({ step: `Search complete. Found ${matchedCount} matching documents.`, status: 'done' });
      return res.json({ success: true, logs, action: 'search' });

    } else if (normalizedCmd.includes('scam') || normalizedCmd.includes('phish') || normalizedCmd.includes('invest') || normalizedCmd.includes('congratulations') || normalizedCmd.includes('winner') || normalizedCmd.includes('ssn') || normalizedCmd.includes('gift card')) {
      // Check scam
      logs.push({ step: 'Running scam analyzer shield...', status: 'loader' });
      const scamCheckText = command;
      // run the heuristics logic
      let score = 100;
      const triggers = [];
      const rules = [
        { keywords: ['crypto', 'bitcoin', 'eth', 'btc', 'wallet', 'invest'], points: 25, reason: 'High-risk crypto assets mentioned.' },
        { keywords: ['congratulations', 'won', 'winner', 'prize', 'gift card'], points: 25, reason: 'Claims you won a lottery or prize.' },
        { keywords: ['urgent', 'immediately', 'action required', 'suspend'], points: 20, reason: 'Urgency elements used.' },
        { keywords: ['phish-secure', 'bit.ly', 'click here'], points: 25, reason: 'Suspicious redirect links.' }
      ];
      for (const r of rules) {
        const matched = r.keywords.filter(kw => scamCheckText.toLowerCase().includes(kw));
        if (matched.length > 0) {
          score -= r.points;
          triggers.push(r.reason);
        }
      }
      score = Math.max(score, 0);
      logs.push({ step: `Safety Trust Index Score: ${score}%`, status: score < 50 ? 'warning' : 'success' });
      logs.push({ step: `Analysis result: ${score < 50 ? 'High scam probability detected!' : score < 80 ? 'Warning issued.' : 'Document looks safe.'}`, status: 'done' });
      if (triggers.length > 0) {
        logs.push({ step: `Risk Indicators: ${triggers.join(' | ')}`, status: 'info' });
      }
      return res.json({ success: true, logs, action: 'scam_check' });

    } else if (normalizedCmd.includes('parse') || normalizedCmd.includes('fill') || normalizedCmd.includes('read') || normalizedCmd.includes('extract')) {
      // check if mentions tax or invoice
      let targetFile = null;
      if (normalizedCmd.includes('tax') || normalizedCmd.includes('1040')) {
        targetFile = 'Documents/Taxes/tax_form_1040_2025.txt';
      } else if (normalizedCmd.includes('invoice') || normalizedCmd.includes('water') || normalizedCmd.includes('bill')) {
        targetFile = 'Downloads/invoice_draft_june.pdf';
      }

      if (!targetFile) {
        logs.push({ step: 'Document name not recognized in your command. Try "parse tax form" or "read water bill".', status: 'warning' });
        return res.json({ success: true, logs, action: 'parse_doc' });
      }

      const filePath = path.join(SANDBOX_DIR, targetFile);
      if (!fs.existsSync(filePath)) {
        logs.push({ step: `File not found: ${targetFile}. Try resetting the sandbox.`, status: 'warning' });
        return res.json({ success: true, logs, action: 'parse_doc' });
      }

      logs.push({ step: `Opening ${targetFile} for extraction...`, status: 'info' });
      logs.push({ step: 'AI parsing text structure and finding deadlines...', status: 'loader' });
      
      const content = await fsPromises.readFile(filePath, 'utf8');
      let dueDate = 'Not found';
      let amount = 'N/A';
      if (targetFile.includes('1040')) {
        dueDate = 'April 15, 2026';
        amount = '$1,450.00 (Refund)';
      } else {
        dueDate = 'July 15, 2026';
        amount = '$150.00';
      }

      logs.push({ step: `Document identified: ${targetFile.includes('1040') ? 'Form 1040' : 'Utility Bill'}`, status: 'success' });
      logs.push({ step: `Extracted Due Date: ${dueDate}`, status: 'success' });
      logs.push({ step: `Extracted Total Value: ${amount}`, status: 'success' });
      logs.push({ step: 'Auto-completed profile fields successfully.', status: 'done' });
      return res.json({ success: true, logs, action: 'parse_doc' });

    } else if (normalizedCmd.startsWith('delete') || normalizedCmd.startsWith('remove')) {
      const fileName = command.split(' ').slice(1).join(' ').trim();
      if (!fileName) {
        logs.push({ step: 'Please specify a filename to delete, e.g. "delete spam_ad_crypto.txt"', status: 'warning' });
        return res.json({ success: true, logs, action: 'delete_file' });
      }

      let deletedFile = null;
      for (const f of allFiles) {
        if (path.basename(f).toLowerCase() === fileName.toLowerCase()) {
          deletedFile = f;
          break;
        }
      }

      if (deletedFile) {
        await fsPromises.unlink(deletedFile);
        logs.push({ step: `Successfully deleted file: ${path.relative(SANDBOX_DIR, deletedFile).replace(/\\/g, '/')}`, status: 'success' });
        logs.push({ step: 'Filesystem sync complete.', status: 'done' });
      } else {
        logs.push({ step: `File "${fileName}" not found in sandbox directory.`, status: 'warning' });
      }
      return res.json({ success: true, logs, action: 'delete_file' });

    } else {
      // Generic chatbot execution mock
      logs.push({ step: 'Analyzing instruction...', status: 'done' });
      logs.push({ step: `Understanding intent: "${command}"`, status: 'info' });
      logs.push({ step: 'Looking up local directories...', status: 'done' });
      
      // Look for keywords
      if (normalizedCmd.includes('recipe') || normalizedCmd.includes('banana')) {
        logs.push({ step: 'Found matches: Documents/banana_bread_recipe.txt', status: 'success' });
        logs.push({ step: 'Action: Displayed recipe content to user.', status: 'done' });
        return res.json({ 
          success: true, 
          logs, 
          action: 'read_recipe',
          data: 'Banana Bread Recipe found!' 
        });
      } else if (normalizedCmd.includes('passport') || normalizedCmd.includes('scan')) {
        logs.push({ step: 'Found passport file in Documents/passport_scan_digital.txt', status: 'success' });
        logs.push({ step: 'Safe action: Retrieved JANE DOE passport ID.', status: 'done' });
        return res.json({ 
          success: true, 
          logs, 
          action: 'read_passport',
          data: 'Passport details read.' 
        });
      }

      logs.push({ step: 'Executor simulation: Command understood, but sandbox action is not pre-mapped. Try "Organize my sandbox files" or "Archive duplicate files".', status: 'warning' });
      return res.json({ success: true, logs, action: 'none' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Clutter Doctor Scan API
app.get('/api/clutter/scan', async (req, res) => {
  try {
    if (!fs.existsSync(SANDBOX_DIR)) {
      await resetSandbox();
    }

    const allFiles = await getFiles(SANDBOX_DIR);
    const duplicates = [];
    const largeFiles = [];
    const tempFiles = [];

    const fileHashMap = {};

    for (const f of allFiles) {
      const stats = await fsPromises.stat(f);
      const relPath = path.relative(SANDBOX_DIR, f).replace(/\\/g, '/');
      const ext = path.extname(f).toLowerCase();

      // Check large files (> 500 bytes for our small demo files)
      if (stats.size > 1000) {
        largeFiles.push({ path: relPath, size: stats.size, modified: stats.mtime });
      }

      // Check temp/log
      if (ext === '.tmp' || ext === '.log') {
        tempFiles.push({ path: relPath, size: stats.size, modified: stats.mtime });
      }

      // Check duplicates
      const hash = await getFileHash(f);
      if (hash) {
        if (fileHashMap[hash]) {
          duplicates.push({
            original: path.relative(SANDBOX_DIR, fileHashMap[hash]).replace(/\\/g, '/'),
            duplicate: relPath,
            size: stats.size
          });
        } else {
          fileHashMap[hash] = f;
        }
      }
    }

    res.json({
      success: true,
      duplicates,
      largeFiles,
      tempFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clutter Clean API: Delete list of files
app.post('/api/clutter/clean', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'List of files is required' });
  }

  const results = [];
  for (const relPath of files) {
    const fullPath = path.join(SANDBOX_DIR, relPath);
    try {
      // Security check: ensure path is inside the sandbox folder
      const resolved = path.resolve(fullPath);
      if (!resolved.startsWith(SANDBOX_DIR)) {
        results.push({ path: relPath, status: 'denied', reason: 'Path outside sandbox' });
        continue;
      }

      if (fs.existsSync(fullPath)) {
        await fsPromises.unlink(fullPath);
        results.push({ path: relPath, status: 'deleted' });
      } else {
        results.push({ path: relPath, status: 'not_found' });
      }
    } catch (err) {
      results.push({ path: relPath, status: 'error', reason: err.message });
    }
  }

  res.json({ success: true, results });
});

// Scam Shield API: Text Heuristics Check
app.post('/api/scam/analyze', (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const text = content.toLowerCase();
  let score = 100; // start safe
  const triggers = [];

  // Rules & weights
  const rules = [
    { keywords: ['crypto', 'bitcoin', 'eth', 'btc', 'wallet', 'invest'], points: 25, reason: 'Mentions high-risk crypto assets or investment platforms.' },
    { keywords: ['congratulations', 'won', 'winner', 'selected', 'prize', 'gift card'], points: 25, reason: 'Claims you won a raffle, lottery, or gift prize you did not sign up for.' },
    { keywords: ['urgent', 'immediately', 'within 24 hours', 'action required', 'suspend', 'restricted'], points: 20, reason: 'Uses high urgency/fear elements to force immediate clicks.' },
    { keywords: ['phish-secure', 'bit.ly', 'tinyurl', 'click here', 'login-verify', 'update-account'], points: 25, reason: 'Contains suspicious redirection links or URL shorteners.' },
    { keywords: ['ssn', 'social security', 'bank details', 'credit card', 'password'], points: 15, reason: 'Asks for highly sensitive personal/financial credentials.' }
  ];

  for (const r of rules) {
    const matched = r.keywords.filter(keyword => text.includes(keyword));
    if (matched.length > 0) {
      score -= r.points;
      triggers.push({
        words: matched,
        reason: r.reason
      });
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(score, 0);

  let status = 'Safe';
  let color = '#10B981'; // Green
  if (score < 50) {
    status = 'Critical Hazard (High Scam Probability)';
    color = '#EF4444'; // Red
  } else if (score < 80) {
    status = 'Moderate Warning (Verify Authenticity)';
    color = '#F59E0B'; // Amber
  }

  res.json({
    success: true,
    score,
    status,
    color,
    triggers,
    recommendations: score < 80 ? [
      'Do NOT click any links in this message.',
      'Check the sender\'s official email domain name (e.g. support@company.com).',
      'Never send personal credentials or cryptocurrency.',
      'Report and block this sender on your device.'
    ] : [
      'This message seems safe, but always double-check link URLs before logging in.'
    ]
  });
});

// Life Search API: Full Text search
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json({ success: true, results: [] });
  }

  try {
    if (!fs.existsSync(SANDBOX_DIR)) {
      await resetSandbox();
    }

    const allFiles = await getFiles(SANDBOX_DIR);
    const results = [];
    const searchRegex = new RegExp(query, 'gi');

    for (const f of allFiles) {
      const ext = path.extname(f).toLowerCase();
      // Only search text-readable files
      if (['.txt', '.pdf', '.json', '.log', '.csv'].includes(ext)) {
        const content = await fsPromises.readFile(f, 'utf8');
        if (content.match(searchRegex)) {
          const lines = content.split('\n');
          const snippets = [];
          
          lines.forEach((line, index) => {
            if (line.match(searchRegex)) {
              snippets.push({
                lineNumber: index + 1,
                text: line.trim()
              });
            }
          });

          results.push({
            filename: path.basename(f),
            path: path.relative(SANDBOX_DIR, f).replace(/\\/g, '/'),
            snippets: snippets.slice(0, 3) // max 3 snippets per file
          });
        }
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bureaucracy Assistant Parse API
app.post('/api/bureaucracy/analyze', async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const fullPath = path.join(SANDBOX_DIR, filename);
  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: `File ${filename} not found` });
    }

    const content = await fsPromises.readFile(fullPath, 'utf8');
    const lines = content.split('\n');

    let dueDate = 'Not found';
    let amount = 'N/A';
    let actionRequired = 'Review document details';
    let documentType = 'Unknown Institutional Notice';
    let prefilledFields = {};

    // Analyze content with regex
    if (content.includes('1040') || content.includes('Tax Return')) {
      documentType = 'IRS Form 1040 (Tax Return)';
      dueDate = 'April 15, 2026';
      amount = '$1,450.00 (Refund)';
      actionRequired = 'Submit pending signatures to official IRS portal.';
      prefilledFields = {
        'Tax Year': '2025',
        'Taxpayer Name': 'Jane Doe (auto-fetched from profiles)',
        'Estimated Refund': '$1,450.00',
        'Filing Status': 'Single'
      };
    } else if (content.includes('Water Corp') || content.includes('INVOICE')) {
      documentType = 'Utility Bill (Water Corp)';
      dueDate = 'July 15, 2026';
      amount = '$150.00';
      actionRequired = 'Pay outstanding balance via Water Corp online billpay.';
      prefilledFields = {
        'Account Number': '98212',
        'Billed To': 'Jane Doe',
        'Balance Due': '$150.00'
      };
    } else {
      // Basic scanning
      for (const line of lines) {
        if (line.match(/due date|deadline/i)) {
          dueDate = line.split(':')[1]?.trim() || line;
        }
        if (line.match(/amount|total|refund/i)) {
          amount = line.split(':')[1]?.trim() || line;
        }
      }
      prefilledFields = {
        'Extracted Text Info': 'Generic field parsing completed successfully.'
      };
    }

    res.json({
      success: true,
      documentType,
      dueDate,
      amount,
      actionRequired,
      prefilledFields,
      contentSnippet: content.slice(0, 300)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
