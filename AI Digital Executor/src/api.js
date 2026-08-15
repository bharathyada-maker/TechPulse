// Centralized API client with dynamic local Express backend vs client-side offline simulation fallback
// This allows the app to be fully operational when hosted as a static site on GitHub Pages.

const defaultFiles = [
  { path: 'Downloads/invoice_draft_june.pdf', size: 100, modified: new Date().toISOString() },
  { path: 'Downloads/invoice_draft_june_copy.pdf', size: 100, modified: new Date().toISOString() },
  { path: 'Downloads/receipt_supermarket.txt', size: 43, modified: new Date().toISOString() },
  { path: 'Downloads/install_helper.exe', size: 240, modified: new Date().toISOString() },
  { path: 'Downloads/temp_session_cache.tmp', size: 512, modified: new Date().toISOString() },
  { path: 'Downloads/spam_ad_crypto.txt', size: 300, modified: new Date().toISOString() },
  { path: 'Documents/Taxes/tax_form_1040_2025.txt', size: 1450, modified: new Date().toISOString() },
  { path: 'Documents/kubernetes_notes.txt', size: 800, modified: new Date().toISOString() },
  { path: 'Documents/banana_bread_recipe.txt', size: 350, modified: new Date().toISOString() },
  { path: 'Documents/passport_scan_digital.txt', size: 600, modified: new Date().toISOString() },
  { path: 'Pictures/Family_Trip_2025/DSCN0012.jpg', size: 2048, modified: new Date().toISOString() },
  { path: 'Pictures/Family_Trip_2025/DSCN0012_copy.jpg', size: 2048, modified: new Date().toISOString() },
  { path: 'Pictures/Family_Trip_2025/DSCN0013.jpg', size: 1536, modified: new Date().toISOString() },
  { path: 'Pictures/Family_Trip_2025/blurred_photo.jpg', size: 900, modified: new Date().toISOString() },
  { path: 'System/Logs/app_start_log.txt', size: 400, modified: new Date().toISOString() },
  { path: 'System/Logs/error_trace.log', size: 120, modified: new Date().toISOString() },
  { path: 'System/Logs/temp_core_dump.tmp', size: 1024, modified: new Date().toISOString() },
];

const fileContents = {
  'Downloads/invoice_draft_june.pdf': 'INVOICE #98212 - Water Corp\nAmount Due: $150.00\nDue Date: July 15, 2026',
  'Downloads/invoice_draft_june_copy.pdf': 'INVOICE #98212 - Water Corp\nAmount Due: $150.00\nDue Date: July 15, 2026',
  'Downloads/receipt_supermarket.txt': 'Walmart Receipt - Total $43.20 - Date: 2026-06-12',
  'Downloads/install_helper.exe': 'Binary dummy content',
  'Downloads/temp_session_cache.tmp': 'temp session data 12345',
  'Downloads/spam_ad_crypto.txt': 'CONGRATULATIONS! You have been selected to claim 10.0 ETH! Click http://phish-secure-ether-claim.net/login now.',
  'Documents/Taxes/tax_form_1040_2025.txt': 'FORM 1040 - US Individual Income Tax Return\nTax Year: 2025\nDeadline Date: April 15, 2026\nEstimated Refund: $1,450.00\nStatus: Pending Signatures.',
  'Documents/kubernetes_notes.txt': 'Kubernetes is an open-source container orchestration system.\nUse kubectl apply -f deployment.yaml to deploy containers.\nKey components: Pods, Services, Deployments, ConfigMaps.',
  'Documents/banana_bread_recipe.txt': 'Banana Bread Recipe:\nIngredients:\n- 3 ripe bananas\n- 1/3 cup melted butter\n- 1 tsp baking soda\n- 1 cup sugar\n- 1 egg\n- 1.5 cups flour\nBake at 350F for 1 hour.',
  'Documents/passport_scan_digital.txt': 'DOCUMENT TYPE: PASSPORT\nISSUING STATE: UNITED STATES\nPASSPORT NO: A9823412B\nSURNAME: DOE\nGIVEN NAMES: JANE\nDATE OF BIRTH: 12 AUG 1995\nEXPIRY DATE: 20 DEC 2032',
  'Pictures/Family_Trip_2025/DSCN0012.jpg': 'fake image bytes - Sunset beach',
  'Pictures/Family_Trip_2025/DSCN0012_copy.jpg': 'fake image bytes - Sunset beach',
  'Pictures/Family_Trip_2025/DSCN0013.jpg': 'fake image bytes - Family lunch',
  'Pictures/Family_Trip_2025/blurred_photo.jpg': 'blurry pixels',
  'System/Logs/app_start_log.txt': '2026-06-10T12:00:00: App started successfully.\nSystem health OK.',
  'System/Logs/error_trace.log': '2026-06-11T14:32:10: ERROR NullPointerException in indexer.js',
  'System/Logs/temp_core_dump.tmp': 'heap crash dump contents'
};

function getLocalFiles() {
  const stored = localStorage.getItem('sandbox_files');
  if (!stored) {
    localStorage.setItem('sandbox_files', JSON.stringify(defaultFiles));
    return defaultFiles;
  }
  return JSON.parse(stored);
}

function setLocalFiles(files) {
  localStorage.setItem('sandbox_files', JSON.stringify(files));
}

// Client-side simulation of express endpoints
function simulate(endpoint, options = {}) {
  console.log(`[API Sim] Resolving endpoint: ${endpoint}`);
  const files = getLocalFiles();

  // 1. GET /api/sandbox/status
  if (endpoint === '/api/sandbox/status') {
    const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
    return {
      success: true,
      totalFiles: files.length,
      totalSize,
      files
    };
  }

  // 2. POST /api/sandbox/reset
  if (endpoint === '/api/sandbox/reset') {
    setLocalFiles(defaultFiles);
    return { success: true, message: 'Sandbox reset successfully.' };
  }

  // 3. GET /api/clutter/scan
  if (endpoint === '/api/clutter/scan') {
    const duplicates = [];
    const largeFiles = [];
    const tempFiles = [];

    // Simple hash/size duplicate mapping for simulation
    const seenSizes = {};
    files.forEach(f => {
      const ext = f.path.split('.').pop().toLowerCase();
      
      // Large files (> 1000 bytes)
      if (f.size > 1000) {
        largeFiles.push({ path: f.path, size: f.size, modified: f.modified });
      }

      // Temp logs
      if (ext === 'tmp' || ext === 'log') {
        tempFiles.push({ path: f.path, size: f.size, modified: f.modified });
      }

      // Duplicates
      if (f.path.includes('_copy') || f.path === 'Downloads/invoice_draft_june_copy.pdf' || f.path === 'Pictures/Family_Trip_2025/DSCN0012_copy.jpg') {
        let original = f.path.replace('_copy', '');
        if (f.path === 'Downloads/invoice_draft_june_copy.pdf') original = 'Downloads/invoice_draft_june.pdf';
        duplicates.push({
          original,
          duplicate: f.path,
          size: f.size
        });
      }
    });

    return {
      success: true,
      duplicates,
      largeFiles,
      tempFiles
    };
  }

  // 4. POST /api/clutter/clean
  if (endpoint === '/api/clutter/clean') {
    const { files: filesToClean } = JSON.parse(options.body || '{}');
    const filtered = files.filter(f => !filesToClean.includes(f.path));
    setLocalFiles(filtered);
    const results = filesToClean.map(path => ({ path, status: 'deleted' }));
    return { success: true, results };
  }

  // 5. POST /api/execute
  if (endpoint === '/api/execute') {
    const { command } = JSON.parse(options.body || '{}');
    if (!command) return { error: 'Command is required' };

    const logs = [];
    const normalizedCmd = command.toLowerCase();

    // organize
    if (normalizedCmd.includes('organize') || normalizedCmd.includes('tidy') || normalizedCmd.includes('group') || normalizedCmd.includes('sort')) {
      logs.push({ step: 'Scanning files in sandbox...', status: 'done' });
      
      const categories = {
        Images: ['jpg', 'jpeg', 'png', 'gif'],
        Documents: ['pdf', 'txt', 'docx', 'csv', 'xlsx'],
        Executables: ['exe', 'msi', 'bat'],
        Archives: ['zip', 'rar', 'tar', 'gz'],
        Temp: ['tmp', 'log']
      };

      let movedCount = 0;
      let deletedCount = 0;
      const updatedFiles = [];

      files.forEach(f => {
        const ext = f.path.split('.').pop().toLowerCase();
        const base = f.path.split('/').pop();
        
        if (f.path.includes('Organized/')) {
          updatedFiles.push(f);
          return;
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
            logs.push({ step: `Deleted temporary file: ${f.path}`, status: 'success' });
            deletedCount++;
          } else {
            const destPath = `Organized/${matchedCat}/${base}`;
            updatedFiles.push({
              path: destPath,
              size: f.size,
              modified: new Date().toISOString()
            });
            logs.push({ step: `Moved ${f.path} to Organized/${matchedCat}/`, status: 'success' });
            movedCount++;
          }
        } else {
          updatedFiles.push(f);
        }
      });

      setLocalFiles(updatedFiles);
      logs.push({ step: `Organization complete. Moved ${movedCount} files, deleted ${deletedCount} temp files.`, status: 'done' });
      return { success: true, logs, action: 'organize' };
    }

    // duplicates
    if (normalizedCmd.includes('duplicate') || normalizedCmd.includes('archive duplicates')) {
      logs.push({ step: 'Scanning for duplicates by content...', status: 'done' });
      
      const duplicates = files.filter(f => f.path.includes('_copy') || f.path === 'Downloads/invoice_draft_june_copy.pdf' || f.path === 'Pictures/Family_Trip_2025/DSCN0012_copy.jpg');
      
      if (duplicates.length === 0) {
        logs.push({ step: 'No duplicate files found.', status: 'info' });
        return { success: true, logs, action: 'find_duplicates' };
      }

      const updatedFiles = files.map(f => {
        const isDup = duplicates.some(d => d.path === f.path);
        if (isDup) {
          const base = f.path.split('/').pop();
          logs.push({ step: `Archived duplicate: ${f.path} -> Archive_Duplicates/${base}`, status: 'success' });
          return {
            path: `Archive_Duplicates/${base}`,
            size: f.size,
            modified: new Date().toISOString()
          };
        }
        return f;
      });

      setLocalFiles(updatedFiles);
      logs.push({ step: `Successfully archived ${duplicates.length} duplicate files.`, status: 'done' });
      return { success: true, logs, action: 'archive_duplicates' };
    }

    // clean logs
    if (normalizedCmd.includes('clean') || normalizedCmd.includes('purge') || normalizedCmd.includes('temp') || normalizedCmd.includes('clear log')) {
      logs.push({ step: 'Searching for system logs and temporary cache files...', status: 'done' });
      let deletedCount = 0;
      const filtered = files.filter(f => {
        const ext = f.path.split('.').pop().toLowerCase();
        if (ext === 'tmp' || ext === 'log') {
          logs.push({ step: `Deleted temp file: ${f.path}`, status: 'success' });
          deletedCount++;
          return false;
        }
        return true;
      });
      setLocalFiles(filtered);
      logs.push({ step: `Clean up complete. Removed ${deletedCount} temp/log files.`, status: 'done' });
      return { success: true, logs, action: 'clean_temp' };
    }

    // reset
    if (normalizedCmd.includes('reset') || normalizedCmd.includes('restore') || normalizedCmd.includes('setup') || normalizedCmd.includes('populate')) {
      logs.push({ step: 'Reset request received.', status: 'info' });
      logs.push({ step: 'Clearing and rebuilding sandboxed filesystem...', status: 'loader' });
      setLocalFiles(defaultFiles);
      logs.push({ step: 'Sandbox successfully reset to default messy state.', status: 'success' });
      return { success: true, logs, action: 'reset' };
    }

    // search keyword
    if (normalizedCmd.startsWith('search') || normalizedCmd.startsWith('find') || normalizedCmd.startsWith('locate')) {
      const queryWord = command.split(' ').slice(1).join(' ').trim();
      if (!queryWord) {
        logs.push({ step: 'Please specify a keyword to search, e.g. "find Kubernetes"', status: 'warning' });
        return { success: true, logs, action: 'search' };
      }
      logs.push({ step: `Executing local index search for keyword: "${queryWord}"...`, status: 'loader' });
      let matchedCount = 0;

      files.forEach(f => {
        const content = fileContents[f.path] || '';
        if (content.toLowerCase().includes(queryWord.toLowerCase())) {
          matchedCount++;
          logs.push({ step: `Match found in: ${f.path}`, status: 'success' });
          const snippet = content.split('\n').find(line => line.toLowerCase().includes(queryWord.toLowerCase()))?.trim();
          if (snippet) {
            logs.push({ step: `  Snippet: "...${snippet}..."`, status: 'info' });
          }
        }
      });
      logs.push({ step: `Search complete. Found ${matchedCount} matching documents.`, status: 'done' });
      return { success: true, logs, action: 'search' };
    }

    // scam analyzer
    if (normalizedCmd.includes('scam') || normalizedCmd.includes('phish') || normalizedCmd.includes('invest') || normalizedCmd.includes('congratulations') || normalizedCmd.includes('winner') || normalizedCmd.includes('ssn') || normalizedCmd.includes('gift card')) {
      logs.push({ step: 'Running scam analyzer shield...', status: 'loader' });
      const scamRes = simulate('/api/scam/analyze', { body: JSON.stringify({ content: command }) });
      logs.push({ step: `Safety Trust Index Score: ${scamRes.score}%`, status: scamRes.score < 50 ? 'warning' : 'success' });
      logs.push({ step: `Analysis result: ${scamRes.status}`, status: 'done' });
      scamRes.triggers.forEach(t => {
        logs.push({ step: `Risk Indicator: ${t.reason} (Keyword: ${t.words.join(', ')})`, status: 'info' });
      });
      return { success: true, logs, action: 'scam_check' };
    }

    // parse / read
    if (normalizedCmd.includes('parse') || normalizedCmd.includes('fill') || normalizedCmd.includes('read') || normalizedCmd.includes('extract')) {
      let targetFile = null;
      if (normalizedCmd.includes('tax') || normalizedCmd.includes('1040')) {
        targetFile = 'Documents/Taxes/tax_form_1040_2025.txt';
      } else if (normalizedCmd.includes('invoice') || normalizedCmd.includes('water') || normalizedCmd.includes('bill')) {
        targetFile = 'Downloads/invoice_draft_june.pdf';
      }

      if (!targetFile) {
        logs.push({ step: 'Document name not recognized in your command. Try "parse tax form" or "read water bill".', status: 'warning' });
        return { success: true, logs, action: 'parse_doc' };
      }

      const fileExists = files.some(f => f.path === targetFile);
      if (!fileExists) {
        logs.push({ step: `File not found: ${targetFile}. Try resetting the sandbox.`, status: 'warning' });
        return { success: true, logs, action: 'parse_doc' };
      }

      logs.push({ step: `Opening ${targetFile} for extraction...`, status: 'info' });
      logs.push({ step: 'AI parsing text structure and finding deadlines...', status: 'loader' });
      
      const docRes = simulate('/api/bureaucracy/analyze', { body: JSON.stringify({ filename: targetFile }) });
      logs.push({ step: `Document identified: ${docRes.documentType}`, status: 'success' });
      logs.push({ step: `Extracted Due Date: ${docRes.dueDate}`, status: 'success' });
      logs.push({ step: `Extracted Total Value: ${docRes.amount}`, status: 'success' });
      logs.push({ step: 'Auto-completed profile fields successfully.', status: 'done' });
      return { success: true, logs, action: 'parse_doc' };
    }

    // delete file
    if (normalizedCmd.startsWith('delete') || normalizedCmd.startsWith('remove')) {
      const fileName = command.split(' ').slice(1).join(' ').trim();
      if (!fileName) {
        logs.push({ step: 'Please specify a filename to delete, e.g. "delete spam_ad_crypto.txt"', status: 'warning' });
        return { success: true, logs, action: 'delete_file' };
      }

      const fileExists = files.some(f => f.path.split('/').pop().toLowerCase() === fileName.toLowerCase());
      if (fileExists) {
        const filtered = files.filter(f => f.path.split('/').pop().toLowerCase() !== fileName.toLowerCase());
        setLocalFiles(filtered);
        logs.push({ step: `Successfully deleted file: ${fileName}`, status: 'success' });
        logs.push({ step: 'Filesystem sync complete.', status: 'done' });
      } else {
        logs.push({ step: `File "${fileName}" not found in sandbox directory.`, status: 'warning' });
      }
      return { success: true, logs, action: 'delete_file' };
    }

    // generic chatbot message
    logs.push({ step: 'Analyzing instruction...', status: 'done' });
    logs.push({ step: `Understanding intent: "${command}"`, status: 'info' });
    logs.push({ step: 'Looking up local directories...', status: 'done' });

    if (normalizedCmd.includes('recipe') || normalizedCmd.includes('banana')) {
      logs.push({ step: 'Found matches: Documents/banana_bread_recipe.txt', status: 'success' });
      logs.push({ step: 'Action: Displayed recipe content to user.', status: 'done' });
      return { success: true, logs, action: 'read_recipe', data: 'Banana Bread Recipe found!' };
    } else if (normalizedCmd.includes('passport') || normalizedCmd.includes('scan')) {
      logs.push({ step: 'Found passport file in Documents/passport_scan_digital.txt', status: 'success' });
      logs.push({ step: 'Safe action: Retrieved JANE DOE passport ID.', status: 'done' });
      return { success: true, logs, action: 'read_passport', data: 'Passport details read.' };
    }

    logs.push({ step: 'Executor simulation: Command understood, but sandbox action is not pre-mapped. Try "Organize my sandbox files" or "Archive duplicate files".', status: 'warning' });
    return { success: true, logs, action: 'none' };
  }

  // 6. POST /api/scam/analyze
  if (endpoint === '/api/scam/analyze') {
    const { content } = JSON.parse(options.body || '{}');
    if (!content) return { error: 'Content is required' };

    const text = content.toLowerCase();
    let score = 100;
    const triggers = [];

    const rules = [
      { keywords: ['crypto', 'bitcoin', 'eth', 'btc', 'wallet', 'invest'], points: 25, reason: 'Mentions high-risk crypto assets or investment platforms.' },
      { keywords: ['congratulations', 'won', 'winner', 'selected', 'prize', 'gift card'], points: 25, reason: 'Claims you won a raffle, lottery, or gift prize you did not sign up for.' },
      { keywords: ['urgent', 'immediately', 'within 24 hours', 'action required', 'suspend', 'restricted'], points: 20, reason: 'Uses high urgency/fear elements to force immediate clicks.' },
      { keywords: ['phish-secure', 'bit.ly', 'tinyurl', 'click here', 'login-verify', 'update-account'], points: 25, reason: 'Contains suspicious redirection links or URL shorteners.' },
      { keywords: ['ssn', 'social security', 'bank details', 'credit card', 'password'], points: 15, reason: 'Asks for highly sensitive personal/financial credentials.' }
    ];

    rules.forEach(r => {
      const matched = r.keywords.filter(keyword => text.includes(keyword));
      if (matched.length > 0) {
        score -= r.points;
        triggers.push({
          words: matched,
          reason: r.reason
        });
      }
    });

    score = Math.max(score, 0);

    let status = 'Safe';
    let color = '#10B981';
    if (score < 50) {
      status = 'Critical Hazard (High Scam Probability)';
      color = '#EF4444';
    } else if (score < 80) {
      status = 'Moderate Warning (Verify Authenticity)';
      color = '#F59E0B';
    }

    return {
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
    };
  }

  // 7. GET /api/search
  if (endpoint.startsWith('/api/search')) {
    const url = new URL(`http://localhost${endpoint}`);
    const query = url.searchParams.get('query') || '';
    const results = [];
    if (!query) return { success: true, results };

    const searchRegex = new RegExp(query, 'gi');

    files.forEach(f => {
      const content = fileContents[f.path] || '';
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
          filename: f.path.split('/').pop(),
          path: f.path,
          snippets: snippets.slice(0, 3)
        });
      }
    });

    return { success: true, results };
  }

  // 8. POST /api/bureaucracy/analyze
  if (endpoint === '/api/bureaucracy/analyze') {
    const { filename } = JSON.parse(options.body || '{}');
    if (!filename) return { error: 'Filename is required' };

    let dueDate = 'Not found';
    let amount = 'N/A';
    let actionRequired = 'Review document details';
    let documentType = 'Unknown Institutional Notice';
    let prefilledFields = {};

    if (filename.includes('1040') || filename.includes('Tax')) {
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
    } else if (filename.includes('invoice') || filename.includes('Water Corp') || filename.includes('bill')) {
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
      prefilledFields = {
        'Extracted Text Info': 'Generic field parsing completed successfully.'
      };
    }

    return {
      success: true,
      documentType,
      dueDate,
      amount,
      actionRequired,
      prefilledFields
    };
  }

  return { error: `Endpoint ${endpoint} not mocked.` };
}

// Primary request sender that routes to express or simulates offline
export async function sendRequest(endpoint, method = 'GET', body = null) {
  const options = { method };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const isGithubPages = window.location.hostname.includes('github.io');
  if (isGithubPages || localStorage.getItem('force_offline_sim') === 'true') {
    // Artificial small delay for simulation realism
    await new Promise(resolve => setTimeout(resolve, 350));
    return simulate(endpoint, options);
  }

  try {
    const res = await fetch(`http://localhost:3001${endpoint}`, options);
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Local Express server not running or connection failed, falling back to simulated browser sandbox.`, err);
    await new Promise(resolve => setTimeout(resolve, 350));
    return simulate(endpoint, options);
  }
}
