// App State
let state = {
  xp: 40,
  xpGoal: 100,
  streak: 5,
  level: 1,
  completedModules: new Set(),
  currentTrack: 'all',
  activeCareer: null,
  theme: 'dark',
  soundEnabled: true,
  tutorMode: 'chat',
  activeRoleplayScenario: 'pitch',
  activeView: 'home',
  unlockedBadges: new Set(['streak-master']), // Streak of 5 unlocked by default
  exploreOtherCollapsed: true,
  diagnosticsRunning: false,
  roleplayAttempts: {}
};

// Web Audio API Synthesizer
class SynthEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, type, duration, delay = 0) {
    if (!state.soundEnabled) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime + delay);
    // Smooth decay
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.15, 0); // C5
    this.playTone(783.99, 'sine', 0.3, 0.08); // G5
  }

  playLevelUp() {
    // Beautiful ascending arpeggio chimes
    const tones = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    tones.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.35, idx * 0.08);
    });
  }

  playFlip() {
    this.init();
    if (!state.soundEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playError() {
    this.playTone(130.81, 'sawtooth', 0.25); // C3
  }
}

const synth = new SynthEngine();

// HTML5 Canvas Particle / Confetti System
class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    }
  }

  spawnExplosion(x, y, count = 25) {
    this.resize();
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#a855f7', '#fbbf24', '#10b981'];
    const emojis = ['🎉', '🚀', '✨', '💡', '🏆', '🔥', '👑'];
    
    for (let i = 0; i < count; i++) {
      const isEmoji = Math.random() > 0.8;
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.7) * 12 - 3, // upwards bias
        size: isEmoji ? 18 : Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }

    if (!this.animationId) {
      this.tick();
    }
  }

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.98; // air resistance
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.emoji) {
        this.ctx.font = `${p.size}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.emoji, 0, 0);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.tick());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
}

let particles;

// Upgraded Modules Content (AI Infused & Content Creator Deepened)
const BITES = [
  {
    id: 'ai-copilot',
    track: 'ai',
    icon: '🤖',
    tag: 'AI Co-piloting',
    tagClass: 'tag-blue',
    title: 'AI Co-pilot Mastery: 10x Your Daily Output',
    desc: 'How to structure multi-agent workflows, code alongside agents, and delegate admin work.',
    bar: 'var(--color-ai)',
    pct: 40,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "AI Co-pilots will replace coders/writers entirely in 2026.",
      reality: "AI Co-pilots automate writing/boilerplate. Outstanding developers and writers upgrade to **system orchestrators** who direct agents and review files."
    },
    leverage: "💡 **Career Leverage Formula**: Use Claude Code or Cursor to index your target codebase. Ask: `Draft a test suite for the auth controller` instead of writing lines. **Time saved: 2 hours daily.**",
    challenge: {
      q: "When delegating a task to an AI coding agent, what provides the highest success rate?",
      opts: [
        "A simple one-line prompt like 'fix my database code'",
        "Detailed step-by-step logic, boundaries, and context maps",
        "Pasting the entire 10,000 line database file in a single prompt",
        "Letting the agent guess the programming language used"
      ],
      answer: 1
    },
    version2026: {
      version: 'Agentic AI 2026',
      status: 'Adopt',
      headline: 'LangGraph Multi-Agent Swarms & MCP Integration',
      legacy: 'Single prompt-response chatbots, manual copy-pasting of generated code.',
      modern: 'Multi-agent coding swarms: orchestrator, coder, test runner, reviewer communicating over Model Context Protocol (MCP).',
      codeSnippet: '// MCP Multi-Agent Flow 2026\nconst swarm = new AgentSwarm({\n  agents: [coder, reviewer, tester],\n  protocol: "MCP-2026",\n  autoIterate: true\n});\nawait swarm.resolveIssue("#142");',
      output: '>>> Issue resolved: 3 files changed, 14 unit tests passing\n>>> Time: 12 seconds'
    },
    modal: {
      title: 'AI Co-pilot Mastery',
      desc: 'Top professionals do not compete with AI — they orchestrate it. Master code/document generation, file translation, and research loops.',
      points: [
        '**The Delegation Blueprint**: Learn how to write actionable, structured instructions for AI agents.',
        '**Sandbox Code Execution**: Understanding tools like Claude Code to automate project builds.',
        '**Memory & Context Pools**: How to upload directory maps and documentation to save context tokens.',
        '**Productivity Loop**: Automating formatting, documentation, and draft edits in seconds.'
      ]
    }
  },
  {
    id: 'prompt-eng',
    track: 'ai',
    icon: '💡',
    tag: 'AI Prompting',
    tagClass: 'tag-blue',
    title: 'Prompt Engineering for Strategy',
    desc: 'Structuring system prompts and context injection to solve complex business queries.',
    bar: 'var(--color-ai)',
    pct: 0,
    time: '4 min',
    xpValue: 20,
    myth: {
      text: "Prompt engineering is just adding 'please think step-by-step' to prompts.",
      reality: "True prompting is software-like configuration: injecting structured context XML, declaring strict boundary formats, and applying few-shot examples."
    },
    leverage: "💡 **Career Leverage Formula**: Create custom System Prompts that enforce formatting (e.g., Markdown Tables). Input raw meeting transcripts and output structured Action Items in 10 seconds. **Time saved: 45 min per meeting.**",
    challenge: {
      q: "What is the purpose of using XML tags (like <context>) in structured prompts?",
      opts: [
        "It compiles the prompt into high-performance machine code",
        "It clearly separates parameters, instructions, and target data for the LLM",
        "It acts as an HTML visualizer for the browser",
        "It encrypts the message payload to ensure user privacy"
      ],
      answer: 1
    },
    modal: {
      title: 'Prompt Engineering for Strategy',
      desc: 'Mastering prompts turns AI into a tailorable consultant for marketing, operations, and analysis.',
      points: [
        '**Role-Based Constraints**: Assigning persona, expertise level, and boundary rules to the model.',
        '**Few-Shot Examples**: Providing input/output pairs directly inside prompts for precise formats.',
        '**Chain of Thought**: Explicitly instructing the model to think step-by-step before final answers.',
        '**Delimiter Structuring**: Using XML tags (e.g., `<context>`) to separate prompts from variables.'
      ]
    }
  },
  {
    id: 'build-public',
    track: 'creator',
    icon: '🚀',
    tag: 'Solopreneur',
    tagClass: 'tag-purple',
    title: 'Building in Public: Grow Your Digital Brand',
    desc: 'Establishing career authority, leveraging social ecosystems, and generating organic career inbound.',
    bar: 'var(--color-creator)',
    pct: 60,
    time: '6 min',
    xpValue: 30,
    myth: {
      text: "You should only share your completed, perfect projects online.",
      reality: "Sharing the raw process, bugs, errors, and daily struggles builds high trust and creates a much more engaging narrative."
    },
    leverage: "💡 **Career Leverage Formula**: Share 1 bug you solved today on LinkedIn/X with a simple screenshot. It builds direct proof of work and drives recruiting inbound. **Conversion: 5x higher outreach response.**",
    challenge: {
      q: "What is the primary benefit of building in public compared to sending standard resumes?",
      opts: [
        "It guarantees your codebase remains completely secure and hidden",
        "It provides live, public, chronological proof of your capabilities and consistency",
        "It pays you immediate advertising royalties on every social impression",
        "It automates your code compilations through cloud servers"
      ],
      answer: 1
    },
    modal: {
      title: 'Building in Public',
      desc: 'The best resume in 2026 is a live portfolio of what you build, shared transparently with the world.',
      points: [
        '**Digital Leverage**: Turning daily learnings, struggles, and solutions into digital content.',
        '**Audience Magnet**: Sharing code, designs, or business ideas while they are in progress.',
        '**Community Ecosystem**: Meeting collaborators and stakeholders directly on social hubs.',
        '**High Inbound**: Attracting jobs, freelance gigs, and angel funding without cold applications.'
      ]
    }
  },
  {
    id: 'solo-stack',
    track: 'creator',
    icon: '🏗️',
    tag: 'Creator',
    tagClass: 'tag-purple',
    title: 'The Solopreneur Stack: One-Person Ventures',
    desc: 'Automating customer acquisition, stripe integrations, and hosting using no-code/low-code tech.',
    bar: 'var(--color-creator)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "Launching a tech startup requires a large team of developers and huge funding.",
      reality: "One person can run a profitable global SaaS by snapping together serverless functions, Stripe links, and no-code builders."
    },
    leverage: "💡 **Career Leverage Formula**: Snap together a landing page in Framer, hook a Stripe payment link, and use Zapier to email access tokens. **Time to validation: 24 hours instead of 3 months.**",
    challenge: {
      q: "What design pattern defines the Solopreneur Tech Stack?",
      opts: [
        "Building massive, complex monoliths hosted on local server racks",
        "Using lightweight, serverless lego-blocks linked via standard API integrations",
        "Employing a 10-person support desk to manage client calls",
        "Deploying database nodes manually inside physical data centers"
      ],
      answer: 1
    },
    modal: {
      title: 'The Solopreneur Stack',
      desc: 'How to build, deploy, and monetize micro-services or creative products without hiring large teams.',
      points: [
        '**Deploy in Minutes**: Using platforms like Vercel, Netlify, or Replit to launch web apps instantly.',
        '**Sub-1$ SaaS Architecture**: Combining serverless functions, SQLite, and Stripe to run low-overhead apps.',
        '**No-Code Pipelines**: Hooking up forms, database records, and emails via webhooks.',
        '**Viral Loop Engineering**: Integrating share buttons and referral schemes directly into products.'
      ]
    }
  },
  {
    id: 'sys-thinking',
    track: 'cognitive',
    icon: '🧬',
    tag: 'Systems Thinking',
    tagClass: 'tag-teal',
    title: 'Systems Thinking: Decode Complex Problems',
    desc: 'Understanding feedback loops, leverage points, and non-linear logic in organizations.',
    bar: 'var(--color-cog)',
    pct: 80,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "To fix a failing department, you should focus on blaming or training the specific individuals involved.",
      reality: "Individual errors are usually symptoms of **broken systems loops**. Correcting systemic incentives changes behaviors instantly."
    },
    leverage: "💡 **Career Leverage Formula**: When facing operational delays, map out the workflow queue as a bottleneck loop. Fix the single bottleneck point instead of rushing the whole team. **Workforce efficiency: +30%.**",
    challenge: {
      q: "In Systems Thinking, what represents a 'reinforcing loop'?",
      opts: [
        "A system that constantly neutralizes and returns to a baseline level",
        "An action that triggers more of the same action, driving compounding growth or collapse",
        "A program execution thread that loops infinitely until a server crashes",
        "A process where feedback is blocked entirely to maintain security"
      ],
      answer: 1
    },
    modal: {
      title: 'Systems Thinking',
      desc: 'Standard thinking looks at cause and effect. Systems thinking maps the entire interconnected web to find real leverage points.',
      points: [
        '**Feedback Loops**: Identifying reinforcing loops (vicious/virtuous cycles) vs. balancing loops.',
        '**The Iceberg Model**: Looking below surface events to discover underlying patterns and system structures.',
        '**Leverage Points**: Finding small places in a system where minor shifts yield massive structural improvements.',
        '**Delayed Response**: Anticipating delayed effects of actions to prevent unintended consequences.'
      ]
    }
  },
  {
    id: 'data-literacy',
    track: 'cognitive',
    icon: '📊',
    tag: 'Data Literacy',
    tagClass: 'tag-teal',
    title: 'Data Literacy in the AI-Infused Age',
    desc: 'Reading telemetry, spotting statistical bias, and driving business choices with hard indicators.',
    bar: 'var(--color-cog)',
    pct: 10,
    time: '4 min',
    xpValue: 20,
    myth: {
      text: "AI summaries are 100% accurate because they look at all datasets.",
      reality: "AI summaries are highly prone to hallucinating connections, ignoring sample size deficits, or missing statistical relevance."
    },
    leverage: "💡 **Career Leverage Formula**: When pitched with data, ask: `What was the control group sample size?` It highlights critical thinking and safeguards against bad investments. **Error avoidance: 90%.**",
    challenge: {
      q: "What is the difference between Correlation and Causation?",
      opts: [
        "Correlation is conceptual; Causation is electrical",
        "Correlation means two things change together; Causation proves one change triggers the other",
        "There is no difference in modern telemetry data statistics",
        "Correlation applies only to small datasets; Causation applies to large systems"
      ],
      answer: 1
    },
    modal: {
      title: 'Data Literacy',
      desc: 'In the era of AI summaries, the ability to query data directly and spot flaws is a superpower.',
      points: [
        '**Correlations vs Causations**: Differentiating matching patterns from physical cause-and-effect.',
        '**Confirmation & Selection Bias**: Spotting charts designed to confirm a specific narrative.',
        '**Key Metrics Dashboards**: Reading and building analytics dashboards that monitor real operations.',
        '**SQL & Vector Querying**: Asking raw databases the correct questions to retrieve actionable truths.'
      ]
    }
  },
  {
    id: 'quantum-comp',
    track: 'frontier',
    icon: '🔮',
    tag: 'Quantum Tech',
    tagClass: 'tag-purple',
    title: 'Quantum Computing: Next-Gen Compute',
    desc: 'Superposition, entanglement, and what qubits mean for future security and physics.',
    bar: 'var(--color-frontier)',
    pct: 0,
    time: '6 min',
    xpValue: 30,
    myth: {
      text: "Quantum computers will soon replace your home laptop for gaming.",
      reality: "Quantum systems are highly specialized accelerators meant for deep math, chemistry simulation, encryption keys, and complex route planning."
    },
    leverage: "💡 **Career Leverage Formula**: Stay ahead by understanding when to pitch Quantum algorithms for logistics optimization or cryptographic security strategies. **Competitive edge: High.**",
    challenge: {
      q: "How does superposition benefit calculation speeds in quantum systems?",
      opts: [
        "It increases the processor clock speed from GHz to THz",
        "It allows a qubit to represent multiple states simultaneously, evaluating combinations in parallel",
        "It shuts down secondary CPU cores to conserve energy and reduce heat",
        "It enables classical bits to double their memory capacities"
      ],
      answer: 1
    },
    modal: {
      title: 'Quantum Computing Decoded',
      desc: 'A gentle dive into how next-gen systems handle calculations that would take classical computers billions of years.',
      points: [
        '**The Qubit Difference**: Classical bits are 0 or 1. Qubits exist in superposition, holding both states at once.',
        '**Entanglement**: Linking qubits together so that changing one instantly influences the other, speeding calculations.',
        '**Quantum Cryptography**: How post-quantum encryption protocols will protect data from future decryption cracks.',
        '**Industry Disruption**: How quantum speeds up molecular simulation for medical drug discovery and logistics.'
      ]
    }
  },
  {
    id: 'biotech',
    track: 'frontier',
    icon: '🧬',
    tag: 'Biotech',
    tagClass: 'tag-purple',
    title: 'CRISPR & Biotech: Re-coding Longevity',
    desc: 'Understanding genetic edits, mRNA custom therapies, and the interface of AI and biology.',
    bar: 'var(--color-frontier)',
    pct: 25,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "Biology is a slow, manual science completely isolated from digital technology.",
      reality: "AI models (like AlphaFold) have turned biology into a computational field where we edit DNA like code and simulate protein designs."
    },
    leverage: "💡 **Career Leverage Formula**: Position yourself at the intersection of AI and healthcare by understanding molecular sequencing structures and biological APIs. **Career growth: Exponential.**",
    challenge: {
      q: "How has AI disrupted the field of molecular biological designs?",
      opts: [
        "It automates microscope cleaning cycles using physical robotic arms",
        "It simulates and predicts complex 3D protein folding structures in seconds instead of years",
        "It prints synthetic cells using standard desktop paper printers",
        "It translates biological names into different languages"
      ],
      answer: 1
    },
    modal: {
      title: 'CRISPR & Biotech Revolution',
      desc: 'Biology has become digital. AI algorithms are now folding proteins and designing custom biological cells.',
      points: [
        '**Gene Editing (CRISPR)**: Targeting and editing specific strands of DNA to eliminate hereditary issues.',
        '**Protein Fold Modeling**: AI systems (like AlphaFold) mapping 3D protein shapes in seconds instead of years.',
        '**Personalized Medicine**: Designing therapies tailored to an individual\'s specific cellular profile.',
        '**Bioreactors & Clean Foods**: Replicating organic structures to produce green food and materials.'
      ]
    }
  },
  {
    id: 'zero-trust',
    track: 'tech',
    icon: '🛡️',
    tag: 'Security',
    tagClass: 'tag-amber',
    title: 'Zero-Trust Security: Remote Work Shield',
    desc: 'Identity verification, micro-segments, and protecting repositories from digital breaches.',
    bar: 'var(--color-tech)',
    pct: 50,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "Having a strong firewall means your internal company network is completely safe.",
      reality: "If a firewall is breached, attackers can access everything. Zero-Trust treats all internal requests as hostile until verified."
    },
    leverage: "💡 **Career Leverage Formula**: Pitch biometric passkeys and token segments to your management. Preventing a single breach saves millions. **Risk reduction: 99%.**",
    challenge: {
      q: "What is the core principle of Zero-Trust security?",
      opts: [
        "Trust everyone on your office Wi-Fi, verify external guests",
        "Never trust, always verify every request regardless of location",
        "Block all external web requests completely from the office",
        "Use simple text passwords on all database nodes"
      ],
      answer: 1
    },
    version2026: {
      version: 'Zero-Trust 2026 Architecture',
      status: 'Adopt',
      headline: 'Passkeys, WebAuthn & Ephemeral Cryptographic Proofs',
      legacy: 'Static passwords, SMS 2FA, long-lived JWT tokens (vulnerable to session theft).',
      modern: 'Passkeys with biometric hardware keys, continuous posture checking every 30s, ephemeral short-lived tokens.',
      codeSnippet: '// WebAuthn 2026 Passkey Assertion\nconst credential = await navigator.credentials.get({\n  publicKey: { challenge: new Uint8Array(32), userVerification: "required" }\n});',
      output: '>>> Passkey verified with Secure Enclave\n>>> Session token TTL: 30 seconds'
    },
    modal: {
      title: 'Zero-Trust Security',
      desc: 'Traditional firewalls are obsolete. Zero-Trust requires continuous validation of every user and device.',
      points: [
        '**Never Trust, Always Verify**: Authentic requests must verify identity, location, and device posture.',
        '**Micro-segmentation**: Splitting server resources so a single breach cannot spread to other services.',
        '**Least Privilege Access**: Users receive access only to the exact files they need, for the duration needed.',
        '**Biometric Passkeys**: Replacing standard text passwords with cryptographic keys signed on-device.'
      ]
    }
  },
  {
    id: 'wasm-web',
    track: 'tech',
    icon: '🌐',
    tag: 'Web Tech',
    tagClass: 'tag-amber',
    title: 'WebAssembly 3.0: High-Speed Web Apps',
    desc: 'Running heavy gaming, video editors, and AI locally inside standard browser tabs.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "WebAssembly is designed to replace JavaScript completely.",
      reality: "Wasm works *alongside* JavaScript, running heavy calculations (like gaming, 3D, and local AI) at near-native speeds."
    },
    leverage: "💡 **Career Leverage Formula**: Build browser-based tools that process audio, video, or data locally using Wasm. It saves server fees entirely. **Server overhead: -80%.**",
    challenge: {
      q: "Which languages compile natively to WebAssembly formats?",
      opts: [
        "Only HTML and CSS styling rules",
        "High-performance languages like Rust, C++, and Go",
        "Only legacy script languages like ActionScript",
        "WebAssembly doesn't require compilation step"
      ],
      answer: 1
    },
    version2026: {
      version: 'WebAssembly 3.0',
      status: 'Trial',
      headline: 'Wasm Garbage Collection & Component Model',
      legacy: 'Wasm 1.0: Only C/Rust, linear memory only, no GC, manual JS wrappers.',
      modern: 'Wasm 3.0: Native GC allows Kotlin/Dart/Java, Component Model enables multi-language linking.',
      codeSnippet: ';; WebAssembly 3.0 GC struct\n(module\n  (type $Point (struct (field (mut i32)) (field (mut i32))))\n  (func (export "makePoint") (result (ref $Point))\n    (struct.new $Point (i32.const 10) (i32.const 20))\n  )\n)',
      output: '>>> Wasm 3.0 GC module instantiated in 0.2ms\n>>> Zero memory leaks'
    },
    modal: {
      title: 'WebAssembly 3.0 in Practice',
      desc: 'Wasm enables desktop-grade performance on the web by running compiled C++, Rust, or Go in a secure sandbox.',
      points: [
        '**Near-Native Execution**: Compiling compute-heavy logic into bytecode that runs at speed inside browsers.',
        '**Component Model**: Integrating third-party components compiled in multiple different languages.',
        '**Garbage Collection Integration**: Enabling languages like Kotlin, Java, and Python to compile natively to Wasm.',
        '**Heavy Browser Apps**: Powering Figma-like interfaces, CAD engines, and local model inference directly in-browser.'
      ]
    }
  },
  {
    id: 'frontend-frameworks',
    track: 'tech',
    icon: '🎨',
    tag: 'Frontend',
    tagClass: 'tag-amber',
    title: 'Frontend Frameworks: Building Interactive UIs',
    desc: 'Top 5 frontend libraries and frameworks that shape user experience on the web.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "You must learn all frontend frameworks to build a great web application.",
      reality: "Most frameworks share core concepts (components, state management, reactivity). Master React or Vue first, and transitioning to others becomes trivial."
    },
    leverage: "💡 **Career Leverage Formula**: Use Vite + React to bootstrap a SaaS prototype in 2 minutes instead of setting up configurations from scratch. **Time saved: 2 hours.**",
    challenge: {
      q: "Which frontend framework utilizes a virtual DOM to optimize UI updates?",
      opts: [
        "Angular",
        "React",
        "Svelte",
        "jQuery"
      ],
      answer: 1
    },
    version2026: {
      version: 'React 19.1 & Next.js 16',
      status: 'Adopt',
      headline: 'Server Actions & Streaming React Server Components',
      legacy: 'React 17/18: Client-side useEffect data fetching, separate API routes, hydration waterfalls.',
      modern: 'React 19: Server Actions, useActionState, useOptimistic, zero client JS bundle for server components.',
      codeSnippet: '// React 19 Server Action\nasync function updateProfile(prevState, formData) {\n  "use server";\n  const name = formData.get("name");\n  await db.users.update({ name });\n  return { success: true, updated: name };\n}',
      output: '>>> [Server Action] Executed on Edge in 1.8ms\n>>> Hydration overhead: 0 KB'
    },
    modal: {
      title: 'Frontend Frameworks Decoded',
      desc: 'Frontend frameworks structure how we build the visuals and user interactions in browsers.',
      points: [
        '**1. React**: A component-based library by Meta. Uses a Virtual DOM to update the UI efficiently. Standard for job markets.',
        '**2. Vue.js**: A progressive framework known for its gentle learning curve and elegant single-file components format.',
        '**3. Angular**: A comprehensive, enterprise-ready TypeScript framework by Google with built-in routing and HTTP clients.',
        '**4. Svelte**: A compiler that compiles components into direct DOM manipulations at build-time, avoiding the Virtual DOM runtime overhead.',
        '**5. Next.js**: A React framework adding Server-Side Rendering (SSR) and static site generation for optimal SEO and performance.'
      ]
    }
  },
  {
    id: 'backend-frameworks',
    track: 'tech',
    icon: '⚙️',
    tag: 'Backend',
    tagClass: 'tag-amber',
    title: 'Backend Frameworks: Powering the Servers',
    desc: 'Top 5 backend frameworks that handle application logic, data routing, and integrations.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "A faster backend framework guarantees a faster web application.",
      reality: "Database queries and API calls are usually the real bottlenecks. A developer-friendly framework is often better than micro-optimizing CPU speeds."
    },
    leverage: "💡 **Career Leverage Formula**: Build standard CRUD APIs using Express or FastAPI and generate automatic Swagger API docs to coordinate with frontend teams. **Time saved: 3 hours.**",
    challenge: {
      q: "Which backend framework is written in Python and uses automated API docs like Swagger?",
      opts: [
        "Express",
        "Django",
        "FastAPI",
        "Ruby on Rails"
      ],
      answer: 2
    },
    modal: {
      title: 'Backend Frameworks Decoded',
      desc: 'Backend frameworks structure server logic, handle routing, manage sessions, and talk to databases.',
      points: [
        '**1. Express.js**: A minimal, unopinionated Node.js web application framework. The foundation for modern JavaScript fullstack development.',
        '**2. FastAPI**: A modern, high-performance web framework for Python. Uses type hints for automatic API validation and Swagger docs.',
        '**3. Spring Boot**: A heavy-duty, highly secure Java framework designed for robust, enterprise-grade distributed systems.',
        '**4. Django**: A high-level Python framework following \'batteries included\' philosophy, providing built-in admin panels and ORM.',
        '**5. NestJS**: A progressive Node.js framework using TypeScript, structure modeled after Angular for enterprise architecture.'
      ]
    }
  },
  {
    id: 'database-systems',
    track: 'tech',
    icon: '🗄️',
    tag: 'Database',
    tagClass: 'tag-amber',
    title: 'Database Systems: Storing & Querying Data',
    desc: 'Top 5 database engines that store state, handle indexing, and optimize data lookup.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "NoSQL databases have completely replaced traditional SQL databases.",
      reality: "SQL databases are still the standard for transactions and structured relationships. NoSQL excels in horizontal scaling and flexible schemas."
    },
    leverage: "💡 **Career Leverage Formula**: Use PostgreSQL indexing on query columns (e.g. user_id) to speed up database lookups from 5 seconds to 5 milliseconds. **Efficiency boost: 1000x.**",
    challenge: {
      q: "Which database type stores data in documents (JSON-like format) rather than tables?",
      opts: [
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "MySQL"
      ],
      answer: 1
    },
    version2026: {
      version: 'PostgreSQL 17.2 & Vector HNSW',
      status: 'Adopt',
      headline: 'JSON_TABLE & High-Dimensional Vector Search',
      legacy: 'Postgres 13: Slow JSON parsing, separate vector engines needed.',
      modern: 'Postgres 17: Native SQL:2023 JSON_TABLE, memory-optimized vacuuming, pgvector 0.8+ with halfvec.',
      codeSnippet: '-- Postgres 17 JSON_TABLE & Vector\nSELECT jt.* FROM logs,\nJSON_TABLE(data, "$.items[*]" COLUMNS(\n  id INT PATH "$.id",\n  name TEXT PATH "$.name"\n)) AS jt\nORDER BY embedding <=> "[0.1, 0.9, 0.4]" LIMIT 5;',
      output: '>>> 5 rows returned in 1.1ms\n>>> HNSW Index hit ratio: 99.4%'
    },
    modal: {
      title: 'Database Systems Decoded',
      desc: 'Databases store application state securely and handle concurrent reading and writing of data.',
      points: [
        '**1. PostgreSQL**: The advanced, open-source SQL relational database. Renowned for reliability, complex queries, and JSON support.',
        '**2. MongoDB**: A document-oriented NoSQL database that stores data in JSON-like documents. Highly flexible and scales horizontally.',
        '**3. Redis**: An in-memory key-value data structure store, used primarily as a database cache to retrieve frequent queries in microseconds.',
        '**4. MySQL**: A widely adopted open-source relational database that powers WordPress and millions of classic LAMP stack websites.',
        '**5. Pinecone**: A specialized vector database designed to store and query high-dimensional embeddings for AI semantic search.'
      ]
    }
  },
  {
    id: 'risk-frameworks',
    track: 'tech',
    icon: '⚠️',
    tag: 'Risk & Compliance',
    tagClass: 'tag-amber',
    title: 'Risk Frameworks: Managing Security & Trust',
    desc: 'Top 5 methodologies used by companies to assess risk, ensure compliance, and secure data.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "Risk compliance guarantees that a system can never be hacked.",
      reality: "Compliance shows that safety checks and procedures are active. Real-world security is continuous operation, not just passing annual audits."
    },
    leverage: "💡 **Career Leverage Formula**: Implement NIST Core functions (Identify, Protect, Detect, Respond, Recover) to quickly isolate and solve cyber incidents. **Response time: +50% faster.**",
    challenge: {
      q: "Which framework focuses on security compliance audits for software vendors hosting customer data?",
      opts: [
        "NIST CSF",
        "ISO 27001",
        "SOC 2 Type II",
        "COBIT"
      ],
      answer: 2
    },
    modal: {
      title: 'Risk Frameworks Decoded',
      desc: 'Risk frameworks provide structured guidelines to identify vulnerabilities and comply with legal requirements.',
      points: [
        '**1. NIST CSF**: Cybersecurity Framework providing a core structure: Identify, Protect, Detect, Respond, and Recover.',
        '**2. ISO 27001**: An international standard specifying requirements for establishing and maintaining an Information Security Management System.',
        '**3. SOC 2 Type II**: An auditing standard for service organizations, testing security, availability, and confidentiality over time.',
        '**4. COBIT**: A framework created by ISACA for IT management and governance, linking business goals to IT infrastructure.',
        '**5. CIS Controls**: A prioritized set of action items and best practices to defend systems against pervasive cyber attacks.'
      ]
    }
  },
  {
    id: 'security-firewalls',
    track: 'tech',
    icon: '🧱',
    tag: 'Security',
    tagClass: 'tag-amber',
    title: 'Security Firewalls: Network Protection',
    desc: 'Top 5 firewall technologies that filter web traffic, inspect packets, and block exploits.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "A traditional network firewall protects you from all API hacks.",
      reality: "Traditional firewalls look at ports and IP addresses. You need Web Application Firewalls (WAF) to inspect malicious HTTP payloads."
    },
    leverage: "💡 **Career Leverage Formula**: Deploy a cloud WAF (like Cloudflare) to automatically block SQL injections and DDoS attacks before they reach your server. **Server crashes prevented: 100%.**",
    challenge: {
      q: "What type of firewall specifically inspects and filters HTTP traffic to block SQL injections and XSS?",
      opts: [
        "Packet Filtering Firewall",
        "Web Application Firewall (WAF)",
        "Stateful Inspection Firewall",
        "Proxy Firewall"
      ],
      answer: 1
    },
    version2026: {
      version: 'Next-Gen AI WAF 2026',
      status: 'Adopt',
      headline: 'Behavioral AI Heuristics & Bot Swarm Defense',
      legacy: 'Regex rule lists (easily bypassed by slight syntax variations).',
      modern: 'LLM-driven payload analysis, automated zero-day virtual patching, behavioral bot fingerprinting.',
      codeSnippet: '// Edge WAF Rule 2026\nexport default {\n  async fetch(request) {\n    const score = await aiWAF.inspect(request);\n    if (score.threat > 0.85) return new Response("Blocked", { status: 403 });\n    return fetch(request);\n  }\n};',
      output: '>>> AI Threat Score: 0.94 (SQLi detected in JSON)\n>>> Request blocked at edge in 0.4ms'
    },
    modal: {
      title: 'Security Firewalls Decoded',
      desc: 'Firewalls sit between networks to inspect incoming and outgoing traffic and block malicious behavior.',
      points: [
        '**1. WAF**: Web Application Firewall. Inspects HTTP traffic to block application attacks like SQL Injection and Cross-Site Scripting (XSS).',
        '**2. Next-Gen Firewall (NGFW)**: Combines traditional firewalling with deep packet inspection and intrusion prevention systems (IPS).',
        '**3. Cloudflare WAF**: A cloud-based, edge-deployed firewall that filters DDoS attacks and malicious web traffic globally.',
        '**4. pfSense**: A powerful, open-source stateful packet filtering firewall and router software built on FreeBSD.',
        '**5. AWS Network Firewall**: A managed service that makes it easy to deploy essential network protections for Amazon VPCs.'
      ]
    }
  },
  {
    id: 'python-automation',
    track: 'tech',
    icon: '🐍',
    tag: 'Python',
    tagClass: 'tag-amber',
    title: 'Python Automation & Scripting Essentials',
    desc: 'Writing loops, automating folders, and calling APIs to automate repetitive tasks.',
    bar: 'var(--color-tech)',
    pct: 0,
    time: '5 min',
    xpValue: 25,
    myth: {
      text: "You must be a math genius or computer scientist to write useful Python scripts.",
      reality: "Python syntax reads like simple English. Anyone can learn to write 10-line scripts that automate hours of manual data copying."
    },
    leverage: "💡 **Career Leverage Formula**: Use Python's `pandas` and `glob` libraries to combine 100 separate Excel reports into a single sheet in 3 seconds. **Hours saved: 5 hours weekly.**",
    challenge: {
      q: "Which Python statement is used to loop through files or items in a list?",
      opts: [
        "for item in list:",
        "repeat item times:",
        "loop through list:",
        "foreach item:"
      ],
      answer: 0
    },
    version2026: {
      version: 'Python 3.14 (Latest 2026)',
      status: 'Adopt',
      headline: 'CPython JIT Compiler & Free-Threaded GIL',
      legacy: 'Python 3.10: Single-core GIL lock, interpreted bytecode without native JIT compiler.',
      modern: 'Python 3.14: JIT compiler tier accelerates loops by 25%; free-threaded build runs true parallel threads on all CPU cores.',
      codeSnippet: '# Python 3.14 JIT & Parallel Automation\nimport asyncio, pathlib\n\nasync def clean_logs():\n    log_dir = pathlib.Path("./logs")\n    async with asyncio.TaskGroup() as tg:\n        for log in log_dir.glob("*.log"):\n            tg.create_task(asyncio.to_thread(log.unlink))\n    return "Cleaned parallel logs in 4ms!"\n\nprint(asyncio.run(clean_logs()))',
      output: '>>> Cleaned parallel logs in 4ms!\n[JIT: 2.3x speedup on loop evaluation]'
    },
    modal: {
      title: 'Python Automation Decoded',
      desc: 'Python is the world\'s most popular language for scripting, folder cleanup, web scraping, and data wrangling.',
      points: [
        '**1. Python Syntax**: Simple variables, conditional logic (`if/else`), and loops (`for/while`) that form script bases.',
        '**2. File Automations (IO)**: Writing scripts to scan folders, rename hundreds of files, and organize downloads.',
        '**3. Web APIs & Requests**: Sending HTTP requests programmatically using `requests` package to pull live metrics.',
        '**4. Data Wrangling**: Parsing raw CSV text, extracting key lines, and saving output data grids into structured reports.'
      ]
    }
  }
];

// Career Tracks Recommendation Mapping
const CAREER_MAP = {
  creative: {
    title: 'Digital Creator / UX Designer',
    desc: 'You want to build beautiful visuals, design intuitive experiences, and grow an audience.',
    focusTracks: ['creator', 'ai'],
    recs: ['build-public', 'solo-stack', 'ai-copilot', 'prompt-eng']
  },
  business: {
    title: 'Business Leader / Digital Marketer',
    desc: 'You want to optimize operations, analyze markets, and lead strategic automation.',
    focusTracks: ['cognitive', 'ai'],
    recs: ['sys-thinking', 'data-literacy', 'prompt-eng', 'ai-copilot']
  },
  technical: {
    title: 'Technical Architect / AI Engineer',
    desc: 'You want to build secure infrastructures, deploy AI, and engineer systems.',
    focusTracks: ['tech', 'ai'],
    recs: ['ai-copilot', 'wasm-web', 'zero-trust', 'quantum-comp']
  },
  founder: {
    title: 'Startup Solopreneur / Innovator',
    desc: 'You want to launch digital products, analyze markets, and operate autonomously.',
    focusTracks: ['creator', 'cognitive'],
    recs: ['solo-stack', 'build-public', 'sys-thinking', 'data-literacy']
  }
};

// Achievements & Badges List
const BADGES_LIST = [
  { id: 'streak-master', emoji: '🔥', name: 'Streak Master', desc: '5-Day Streak active' },
  { id: 'first-step', emoji: '⭐', name: 'First Step', desc: 'Completed 1 module' },
  { id: 'skill-builder', emoji: '🚀', name: 'Skill Builder', desc: 'Completed 5 modules' },
  { id: 'rising-star', emoji: '🎓', name: 'Rising Star', desc: 'Reached Level 2' }
];

// Interactive Roleplay Scenarios
const ROLEPLAY_SCENARIOS = {
  pitch: {
    role: "💼 Client (Non-Tech SaaS Founder)",
    prompt: "Hi! I need to launch a SaaS. How can I build a working user signup flow and automatic welcome emails by myself without spending thousands on engineers?",
    eval: (text) => {
      const lower = text.toLowerCase();
      const hits = [];
      if (lower.includes('framer') || lower.includes('webflow')) hits.push('Framer/Webflow');
      if (lower.includes('stripe')) hits.push('Stripe payments');
      if (lower.includes('zapier') || lower.includes('make')) hits.push('Zapier/Make automation');
      if (lower.includes('supabase') || lower.includes('airtable')) hits.push('Airtable/Supabase database');

      if (hits.length >= 2) {
        return {
          success: true,
          msg: `*Client smiles widely:* "Wow! That sounds exactly like what I need. Snapping together ${hits.join(' and ')} will save me months of development and thousands of dollars. You explained the solopreneur lego-brick approach perfectly! You're hired! Check your XP, I just sent a bonus!"`
        };
      } else {
        return {
          success: false,
          msg: `*Client looks confused:* "Hmm, that sounds a bit too complex or slow. Isn't there a way to build this in a weekend using simple ready-made low-code blocks (like Framer, Stripe, and Zapier)?"`
        };
      }
    }
  },
  interview: {
    role: "💼 AI Firm Tech Lead",
    prompt: "We build recommendation engines. Can you explain in simple terms why we would use a vector database instead of a standard SQL database?",
    eval: (text) => {
      const lower = text.toLowerCase();
      const hits = [];
      if (lower.includes('embedding') || lower.includes('vector')) hits.push('embeddings');
      if (lower.includes('semantic') || lower.includes('similarity') || lower.includes('meaning')) hits.push('semantic similarity');
      if (lower.includes('coordinates') || lower.includes('distance')) hits.push('geometric coordinates');

      if (hits.length >= 2) {
        return {
          success: true,
          msg: `*Tech Lead nods in approval:* "Excellent explanation. Storing high-dimensional ${hits.join(' and ')} to do nearest-neighbor similarity search is exactly what SQL fails at. You understand semantic context retrieval! You passed the check. Here is your reward!"`
        };
      } else {
        return {
          success: false,
          msg: `*Tech Lead raises an eyebrow:* "Thanks, but SQL relies on exact word matches. How does the engine calculate conceptual similarity or contextual meaning? (Hint: Mention embeddings and semantic similarity)."`
        };
      }
    }
  },
  critique: {
    role: "💼 Creator (Content Marketer)",
    prompt: "I want to generate marketing emails for shoes. My prompt is 'write an email selling shoes'. The model outputs generic, boring text. How can I structure my prompt to make it great?",
    eval: (text) => {
      const lower = text.toLowerCase();
      const hits = [];
      if (lower.includes('role') || lower.includes('persona')) hits.push('Role/Persona');
      if (lower.includes('context') || lower.includes('audience')) hits.push('Target Audience Context');
      if (lower.includes('example') || lower.includes('shot')) hits.push('Few-shot Examples');
      if (lower.includes('constraint') || lower.includes('format')) hits.push('Format Constraints');

      if (hits.length >= 2) {
        return {
          success: true,
          msg: `*Creator claps hands:* "Aha! Giving it a clear ${hits.join(' and ')} makes complete sense. I just tested it with a specific shoes buyer persona and a few-shot writing example — the output is amazing! You're a prompt genius. Thank you, here is XP!"`
        };
      } else {
        return {
          success: false,
          msg: `*Creator scratches head:* "I see. Can you tell me what specific structural elements (like role, context constraints, or writing examples) I should inject into the prompt template?"`
        };
      }
    }
  }
};

// UI Render Helpers
function getModuleById(id) {
  return BITES.find(b => b.id === id);
}

function renderStatsHUD() {
  document.getElementById('hud-streak').textContent = state.streak;
  document.getElementById('hud-xp').textContent = state.xp;
  document.getElementById('hud-xp-goal').textContent = state.xpGoal;
  document.getElementById('hud-level-title').textContent = `Lvl ${state.level}`;
  
  // Update circular progress ring
  const circle = document.querySelector('.xp-ring-progress');
  const percent = Math.min(100, Math.max(0, (state.xp / state.xpGoal) * 100));
  const offset = 100 - percent;
  circle.style.strokeDashoffset = offset;
  
  // Render badges row
  const badgesHtml = BADGES_LIST.map(badge => {
    const isUnlocked = state.unlockedBadges.has(badge.id);
    return `
      <div class="badge-item ${isUnlocked ? 'unlocked' : ''}" title="${badge.desc}">
        <span class="badge-icon">${badge.emoji}</span>
        <span>${badge.name}</span>
      </div>
    `;
  }).join('');
  
  const containerDesktop = document.getElementById('badges-container-desktop');
  if (containerDesktop) containerDesktop.innerHTML = badgesHtml;
  
  const containerMobile = document.getElementById('badges-container-mobile');
  if (containerMobile) containerMobile.innerHTML = badgesHtml;
}

function renderModulesGrid() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;
  
  // Filter modules
  let filtered = BITES;
  if (state.currentTrack !== 'all') {
    filtered = BITES.filter(b => b.track === state.currentTrack);
  }
  
  document.getElementById('module-filtered-count').textContent = filtered.length + ' module' + (filtered.length !== 1 ? 's' : '') + ' live';
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-modules"><i class="ti ti-search" style="font-size: 24px; margin-bottom: 6px; display: block;"></i>No modules unlocked in this track yet!</div>';
    return;
  }
  
  // Helper to render a card
  function renderCard(b) {
    const isCompleted = state.completedModules.has(b.id);
    const progressPercent = isCompleted ? 100 : b.pct;
    
    // Check if recommended by active career compass
    let isRec = false;
    let recBadge = '';
    if (state.activeCareer && CAREER_MAP[state.activeCareer]) {
      isRec = CAREER_MAP[state.activeCareer].recs.includes(b.id);
    }
    
    if (isRec) {
      recBadge = `<span class="module-badge" style="background: var(--color-ai-bg); color: var(--color-ai-text);">Recommended</span>`;
    } else {
      recBadge = `<span class="module-badge ${b.tagClass}">${b.tag}</span>`;
    }
    
    // Dynamic Telemetry Trend check
    const activeTrend = window.activeTrends && window.activeTrends[b.id];
    let trendBadge = '';
    if (activeTrend) {
      trendBadge = `<span class="module-badge" style="background: #ef4444; color: white; font-weight: 700; box-shadow: 0 0 8px rgba(239, 68, 68, 0.45); animation: pulseGlow 1.5s infinite;">🔥 HOT TREND</span>`;
    }
    
    return `
      <div class="module-card ${isRec ? 'recommended-outline' : ''} ${activeTrend ? 'trend-glow-outline' : ''}" onclick="openModuleModal('${b.id}')">
        <div class="module-icon-row">
          <span class="module-icon">${b.icon}</span>
          <div style="display: flex; gap: 4px; align-items: center;">
            ${trendBadge}
            ${recBadge}
          </div>
        </div>
        <div>
          <div class="module-title">${b.title}</div>
          <div class="module-desc">${b.desc}</div>
        </div>
        <div class="progress-container">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${progressPercent}%; background: ${b.bar};"></div>
          </div>
          <div class="module-footer">
            <span><i class="ti ti-clock"></i> ${b.time}</span>
            <span class="module-xp-pill" style="color: ${b.bar}">${isCompleted ? '✓ Completed' : `+${b.xpValue} XP`}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Hick's Law: Split only when a career is active and track filter is 'all'
  if (state.activeCareer && CAREER_MAP[state.activeCareer] && state.currentTrack === 'all') {
    const recIds = CAREER_MAP[state.activeCareer].recs;
    const recommended = filtered.filter(b => recIds.includes(b.id));
    const exploreOther = filtered.filter(b => !recIds.includes(b.id));
    
    const recCardsHtml = recommended.map(renderCard).join('');
    const exploreCardsHtml = exploreOther.map(renderCard).join('');
    
    const isCollapsed = state.exploreOtherCollapsed !== false;
    
    grid.innerHTML = `
      <div class="modules-group-title">Recommended for Your Goal</div>
      <div class="modules-grid">${recCardsHtml}</div>
      
      <div class="modules-group-title explore-title ${isCollapsed ? 'collapsed' : ''}" onclick="toggleOtherModules()">
        <span>Explore Other Topics (${exploreOther.length})</span>
        <i class="ti ti-chevron-down"></i>
      </div>
      
      <div class="explore-other-container ${isCollapsed ? 'collapsed' : ''}" id="explore-other-sec">
        <div class="explore-other-inner">
          <div class="modules-grid">${exploreCardsHtml}</div>
        </div>
      </div>
    `;
  } else {
    // Normal flat list
    grid.innerHTML = `<div class="modules-grid">${filtered.map(renderCard).join('')}</div>`;
  }
}

// Notification Banner Helper
function showNotification(text, duration = 4000) {
  const banner = document.getElementById('notification-banner');
  const content = document.getElementById('notification-msg');
  content.innerHTML = text;
  banner.classList.add('show');
  
  setTimeout(() => {
    banner.classList.remove('show');
  }, duration);
}

// Sound FX Mute Control
window.toggleSound = function() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('sound-btn');
  
  if (state.soundEnabled) {
    btn.innerHTML = '<i class="ti ti-volume" aria-hidden="true"></i>';
    synth.playTone(880, 'sine', 0.1);
    showNotification('🔊 Sound FX enabled.');
  } else {
    btn.innerHTML = '<i class="ti ti-volume-3" aria-hidden="true"></i>'; // Mute icon
    showNotification('🔇 Sound FX muted.');
  }
};

// Career Compass Select Handler
window.selectCareer = function(careerKey, btnEl) {
  synth.playFlip();
  
  const buttons = document.querySelectorAll('.compass-btn');
  const resultBox = document.getElementById('compass-result-box');
  
  // If clicking active, deactivate it
  if (state.activeCareer === careerKey) {
    state.activeCareer = null;
    btnEl.classList.remove('active');
    resultBox.style.display = 'none';
    showNotification('💡 Career path filter cleared.');
  } else {
    state.activeCareer = careerKey;
    buttons.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    
    const data = CAREER_MAP[careerKey];
    resultBox.innerHTML = `<strong>${data.title}</strong>: ${data.desc} <br><span style="color: var(--color-ai-text); font-weight: 600;">Recommended tracks highlighted in the filter chips!</span>`;
    resultBox.style.display = 'block';
    
    showNotification(`🎯 Career compass locked to <strong>${data.title}</strong>! Check out recommended modules.`);
  }
  
  updateFilterChipsHighlight();
  updateCareerMarketValue(true); // Redraw radar targets instantly
  renderModulesGrid();
};

function updateFilterChipsHighlight() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.classList.remove('highlight');
    const track = chip.dataset.track;
    
    if (state.activeCareer && CAREER_MAP[state.activeCareer]) {
      const focusTracks = CAREER_MAP[state.activeCareer].focusTracks;
      if (focusTracks.includes(track)) {
        chip.classList.add('highlight');
      }
    }
  });
}

// Filter Tracks
window.setTrackFilter = function(track, chipEl) {
  synth.playFlip();
  state.currentTrack = track;
  
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  
  renderModulesGrid();
};

// Double-sided Flashcard flip
window.flipCard = function(el) {
  synth.playFlip();
  el.classList.toggle('flipped');
};

// Modal Actions
let activeModalModuleId = null;
let activeChallengeCompleted = false;
let activeCheckpointIdx = 0;
let unlockedCheckpoints = new Set([0]);
window.activeTrends = {}; // Live trend mapping channel

window.openModuleModal = function(moduleId) {
  synth.playFlip();
  activeModalModuleId = moduleId;
  activeChallengeCompleted = false;
  
  const module = getModuleById(moduleId);
  const m = module.modal;
  const isCompleted = state.completedModules.has(moduleId);
  
  document.getElementById('modal-m-title').textContent = m.title;
  document.getElementById('modal-card-icon').textContent = module.icon;
  document.getElementById('modal-card-front-desc').textContent = module.title;
  document.getElementById('modal-card-back-desc').textContent = m.desc;
  
  // Render Myth vs Reality Box
  const mythRealityContainer = document.getElementById('modal-myth-reality');
  mythRealityContainer.innerHTML = `
    <div class="myth-pane"><strong>Myth:</strong> ${module.myth.text}</div>
    <div class="reality-pane"><strong>Reality:</strong> ${module.myth.reality}</div>
  `;
  
  // Render Leverage Formula Box
  const leverageContainer = document.getElementById('modal-leverage');
  leverageContainer.innerHTML = module.leverage.replace(/\*\Gamma\*/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Render 2026 Modern Highlights & Interactive Sandbox if available
  let versionBox = document.getElementById('modal-version-2026');
  if (!versionBox) {
    versionBox = document.createElement('div');
    versionBox.id = 'modal-version-2026';
    leverageContainer.parentNode.insertBefore(versionBox, leverageContainer.nextSibling);
  }
  
  if (module.version2026) {
    const v = module.version2026;
    versionBox.innerHTML = `
      <div style="margin: 12px 0; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 4px;">
            <i class="ti ti-sparkles"></i> 2026 Modern Standard: ${v.version}
          </span>
          <span style="font-size: 9px; font-weight: 700; background: #10b981; color: #fff; padding: 2px 6px; border-radius: 10px;">${v.status.toUpperCase()}</span>
        </div>
        <div style="font-size: 10.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">${v.headline}</div>
        <div class="version-diff-container">
          <div class="diff-col-legacy">
            <h4><i class="ti ti-history"></i> Legacy Way</h4>
            <div style="color: var(--text-secondary); line-height: 1.35;">${v.legacy}</div>
          </div>
          <div class="diff-col-modern">
            <h4><i class="ti ti-bolt"></i> 2026 Modern Way</h4>
            <div style="color: var(--text-secondary); line-height: 1.35;">${v.modern}</div>
          </div>
        </div>
        <div class="tutor-code-sandbox" style="margin-top: 8px;">
          <div class="tutor-code-header">
            <span>💻 2026 Live Sandbox</span>
            <button class="tutor-run-btn" onclick="runTutorCode('modal-code-out')"><i class="ti ti-player-play"></i> Run Code</button>
          </div>
          <div class="tutor-code-body">${v.codeSnippet}</div>
          <div class="tutor-code-output" id="modal-code-out" data-output="${v.output.replace(/"/g, '&quot;')}"></div>
        </div>
      </div>
    `;
    versionBox.style.display = 'block';
  } else {
    versionBox.style.display = 'none';
  }
  
  // Unflip card reset
  const cardWrapper = document.getElementById('modal-flashcard');
  cardWrapper.classList.remove('flipped');
  
  // Initialize Checkpoint Path indices
  activeCheckpointIdx = 0;
  unlockedCheckpoints = new Set([0]);
  if (isCompleted) {
    for (let i = 0; i < m.points.length; i++) {
      unlockedCheckpoints.add(i);
    }
  }
  
  // Render Micro-Challenge
  const challenge = module.challenge;
  const challengeContainer = document.getElementById('modal-challenge');
  challengeContainer.innerHTML = `
    <div class="modal-challenge-title"><i class="ti ti-bulb" style="color:var(--color-tech-text)"></i> Practice Challenge</div>
    <div class="modal-challenge-q">${challenge.q}</div>
    <div class="modal-challenge-opts">
      ${challenge.opts.map((opt, i) => `
        <button class="modal-challenge-opt" onclick="submitModalChallengeAnswer(this, ${i === challenge.answer})">
          <span style="font-weight: 700; opacity: 0.6; margin-right: 6px;">${String.fromCharCode(65 + i)}.</span> ${opt}
        </button>
      `).join('')}
    </div>
  `;
  
  // CTA complete button state
  const ctaBtn = document.getElementById('modal-cta');
  if (isCompleted) {
    ctaBtn.innerHTML = `<i class="ti ti-check"></i> Module Completed`;
    ctaBtn.style.background = 'var(--text-muted)';
    ctaBtn.classList.remove('locked');
    ctaBtn.style.pointerEvents = 'none';
  } else {
    ctaBtn.innerHTML = `<i class="ti ti-lock"></i> Complete All Journey Checkpoints`;
    ctaBtn.classList.add('locked');
    ctaBtn.style.pointerEvents = 'none';
  }
  
  // Render nodes list dynamically
  const nodesGroup = document.getElementById('takeaway-svg-nodes');
  const N = m.points.length;
  nodesGroup.innerHTML = '';
  for (let i = 0; i < N; i++) {
    const cx = 30 + i * (240 / (N - 1));
    nodesGroup.innerHTML += `
      <circle class="checkpoint-node locked" id="cp-node-${i}" cx="${cx}" cy="40" r="14" onclick="selectPathCheckpoint(${i})" />
      <text class="checkpoint-text" x="${cx}" y="44" text-anchor="middle" onclick="selectPathCheckpoint(${i})">${i + 1}</text>
    `;
  }
  
  renderCheckpointDetails();
  document.getElementById('module-modal').classList.add('show');
  document.body.classList.add('modal-open');
};

// Checkpoints Journey Handlers
window.selectPathCheckpoint = function(idx) {
  if (!unlockedCheckpoints.has(idx)) {
    synth.playError();
    showNotification("🔒 Complete previous checkpoints to unlock this step!");
    return;
  }
  activeCheckpointIdx = idx;
  renderCheckpointDetails();
};

window.completePathStep = function(idx, isLast) {
  synth.playTone(660, 'sine', 0.08);
  const module = getModuleById(activeModalModuleId);
  const total = module.modal.points.length;
  
  if (isLast) {
    // Unlock Claim button!
    const ctaBtn = document.getElementById('modal-cta');
    if (ctaBtn) {
      ctaBtn.innerHTML = `<i class="ti ti-bolt"></i> Complete Lesson & Claim +${module.xpValue} XP`;
      ctaBtn.classList.remove('locked');
      ctaBtn.style.pointerEvents = 'auto';
      ctaBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      
      const rect = ctaBtn.getBoundingClientRect();
      const parentRect = document.getElementById('particle-canvas').parentElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - parentRect.left;
      const y = rect.top + rect.height / 2 - parentRect.top;
      particles.spawnExplosion(x, y, 12);
      synth.playSuccess();
    }
    
    // Add completed class to last node
    const node = document.getElementById(`cp-node-${idx}`);
    if (node) node.classList.add('completed');
  } else {
    // Unlock next node
    const nextIdx = idx + 1;
    unlockedCheckpoints.add(nextIdx);
    activeCheckpointIdx = nextIdx;
    renderCheckpointDetails();
  }
};

function renderCheckpointDetails() {
  const module = getModuleById(activeModalModuleId);
  const takeaways = module.modal.points;
  const N = takeaways.length;
  
  // 1. Update SVG node visual classes
  for (let i = 0; i < N; i++) {
    const node = document.getElementById(`cp-node-${i}`);
    if (node) {
      node.setAttribute('class', 'checkpoint-node'); // reset
      if (i === activeCheckpointIdx) {
        node.classList.add('active');
      } else if (i < activeCheckpointIdx || state.completedModules.has(activeModalModuleId)) {
        node.classList.add('completed');
      } else {
        node.classList.add('locked');
      }
    }
  }
  
  // 2. Position the shuttle
  const xCoord = 30 + activeCheckpointIdx * (240 / (N - 1));
  const leftPct = (xCoord / 300) * 100;
  
  const shuttle = document.getElementById('takeaway-avatar-shuttle');
  if (shuttle) {
    shuttle.style.left = `calc(${leftPct}% - 14px)`;
    shuttle.textContent = (activeCheckpointIdx === N - 1) ? '🎓' : '🚀';
  }
  
  // 3. Animate SVG progress path
  const progressPath = document.getElementById('takeaway-progress-path');
  if (progressPath) {
    const maxOffset = 240;
    const completedDistance = activeCheckpointIdx * (240 / (N - 1));
    progressPath.style.strokeDashoffset = maxOffset - completedDistance;
  }
  
  // 4. Render text details & custom interactive widget
  const detailPanel = document.getElementById('modal-takeaway-detail');
  if (detailPanel) {
    const rawText = takeaways[activeCheckpointIdx];
    const parsedText = rawText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const isLast = activeCheckpointIdx === N - 1;
    const isCompleted = state.completedModules.has(activeModalModuleId);
    
    // Inject Custom Interactive Simulation Widget if available
    const widgetHTML = getInteractiveWidgetHTML(activeModalModuleId, activeCheckpointIdx);
    
    let actionBtn = '';
    if (isCompleted) {
      actionBtn = `<span style="color:var(--color-cog-text); font-size:11px; font-weight:600;"><i class="ti ti-check"></i> Concept Reviewed</span>`;
    } else if (isLast) {
      actionBtn = `
        <button class="takeaway-btn-next" onclick="completePathStep(${activeCheckpointIdx}, true)">
          <i class="ti ti-lock-open"></i> Unlock Module Claim
        </button>
      `;
    } else {
      actionBtn = `
        <button class="takeaway-btn-next" onclick="completePathStep(${activeCheckpointIdx}, false)">
          Understand &amp; Next <i class="ti ti-chevron-right"></i>
        </button>
      `;
    }
    
    detailPanel.innerHTML = `
      <div>
        <div class="takeaway-detail-header">
          <i class="ti ti-bulb" style="color:var(--color-tech-text)"></i>
          Concept ${activeCheckpointIdx + 1} of ${N}
          <span>Step Unlocked</span>
        </div>
        <div class="takeaway-detail-body">${parsedText}</div>
        ${widgetHTML}
      </div>
      <div class="takeaway-detail-footer">
        <div></div> <!-- spacer -->
        ${actionBtn}
      </div>
    `;
    
    initInteractiveWidgetState(activeModalModuleId, activeCheckpointIdx);
  }
}

// Data generator for concept animations
function getInteractiveWidgetHTML(moduleId, stepIdx) {
  const activeTrend = window.activeTrends && window.activeTrends[moduleId];
  const module = getModuleById(moduleId);
  
  if (module && activeTrend && stepIdx === module.modal.points.length) {
    return `
      <div style="background: rgba(239, 68, 68, 0.05); border: 1px dashed #ef4444; border-radius: 8px; padding: 10px; margin-top: 8px; text-align: center;">
        <div style="font-size: 10px; font-weight: 800; color: #ef4444; margin-bottom: 4px;"><i class="ti ti-activity"></i> TELEMETRY CHANNEL ACTIVE</div>
        <div style="display: flex; justify-content: center; gap: 6px; font-size: 12px; margin-bottom: 6px;">
          <span style="animation: pulse 1s infinite;">📡</span>
          <span style="font-family: monospace; font-size: 9.5px; color: var(--text-muted);">Syncing 2026 live telemetry trends...</span>
        </div>
        <div style="font-size: 9px; font-weight: 700; color: var(--text-muted); line-height: 1.3;">
          This lesson point is dynamically generated by TechPulse's active industry job telemetry feed.
        </div>
      </div>
    `;
  }

  if (moduleId === 'python-automation' && stepIdx === 0) {
    return `
      <div class="lego-simulation-canvas" style="background:#090d16; font-family:monospace; padding:12px; border:1px solid var(--border-card);">
        <div style="color:#6366f1; text-align:left;"># automate_files.py</div>
        <div style="color:var(--text-secondary); font-size:10px; text-align:left;">import os, glob</div>
        <div style="color:var(--text-secondary); font-size:10px; text-align:left;">for f in glob.glob("*.csv"):</div>
        <div style="color:var(--text-secondary); font-size:10px; padding-left:12px; text-align:left;">print(f"Archiving: {f}...")</div>
        <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <button class="takeaway-btn-next" onclick="triggerPythonDemo()" style="font-size:9.5px; padding:3px 6px;">python automate.py</button>
          <span id="python-status" style="font-size:9px; color:#f59e0b; font-weight:800;">Ready</span>
        </div>
        <div id="python-console-log" style="font-size:9px; color:#10b981; margin-top:8px; line-height:1.3; white-space:pre-wrap; max-height:60px; overflow-y:auto; font-family:monospace; text-align:left;"></div>
      </div>
    `;
  }

  if (moduleId === 'frontend-frameworks' && stepIdx === 0) {
    return `
      <div class="lego-simulation-canvas" id="lego-canvas">
        <div class="lego-block" id="lego-header" onclick="snapLegoBlock('lego-header')" style="background:#6366f1;">Snap Header Component</div>
        <div class="lego-block" id="lego-sidebar" onclick="snapLegoBlock('lego-sidebar')" style="background:#a855f7;">Snap Sidebar Component</div>
        <div class="lego-block" id="lego-body" onclick="snapLegoBlock('lego-body')" style="background:#10b981;">Snap Main Feed Component</div>
      </div>
      <div id="lego-log" style="font-size:9.5px; color:var(--text-muted); text-align:center; margin-top:4px;">Tap blocks to assemble.</div>
    `;
  }
  
  if (moduleId === 'backend-frameworks' && stepIdx === 0) {
    return `
      <div class="kitchen-simulation-canvas">
        <div class="kitchen-node" id="knode-client"><i class="ti ti-device-mobile"></i><div>Client</div></div>
        <div class="kitchen-node" id="knode-waiter"><i class="ti ti-user"></i><div>Waiter (API)</div></div>
        <div class="kitchen-node" id="knode-chef"><i class="ti ti-tools"></i><div>Chef (Server)</div></div>
        <div class="kitchen-node" id="knode-pantry"><i class="ti ti-archive"></i><div>Pantry (DB)</div></div>
        <div class="data-packet" id="kpacket"></div>
      </div>
      <div style="text-align:center; margin-top:6px;">
        <button class="takeaway-btn-next" onclick="triggerKitchenDemo()" style="margin:0 auto; font-size:10px; padding:4px 8px;">Order Pizza (HTTP Request)</button>
      </div>
    `;
  }
  
  if (moduleId === 'database-systems' && stepIdx === 0) {
    return `
      <div class="db-simulation-canvas">
        <div class="db-container-box" onclick="triggerDbDemo('sql')">
          <div class="db-title">Postgres (SQL)</div>
          <div class="db-visual-sql-grid">
            <div class="sql-cell" id="scell-0"></div><div class="sql-cell" id="scell-1"></div><div class="sql-cell" id="scell-2"></div>
            <div class="sql-cell" id="scell-3"></div><div class="sql-cell" id="scell-4"></div><div class="sql-cell" id="scell-5"></div>
            <div class="sql-cell" id="scell-6"></div><div class="sql-cell" id="scell-7"></div><div class="sql-cell" id="scell-8"></div>
          </div>
        </div>
        <div class="db-container-box" onclick="triggerDbDemo('nosql')">
          <div class="db-title">MongoDB (NoSQL)</div>
          <div class="db-visual-nosql-bin" id="nosql-bin">
            <div style="position:absolute; width:5px; height:5px; background:#6366f1; border-radius:50%; top:2px; left:8px;"></div>
            <div style="position:absolute; width:5px; height:5px; background:#10b981; border-radius:50%; bottom:3px; right:6px;"></div>
          </div>
        </div>
        <div class="db-container-box" onclick="triggerDbDemo('redis')">
          <div class="db-title">Redis (Cache)</div>
          <div class="db-visual-redis" id="redis-cache">RAM</div>
        </div>
      </div>
      <div id="db-demo-log" style="font-size:9.5px; color:var(--text-muted); text-align:center; margin-top:4px;">Click databases to query.</div>
    `;
  }
  
  if (moduleId === 'risk-frameworks' && stepIdx === 0) {
    return `
      <div class="risk-simulation-canvas">
        <div class="risk-dial-circle" id="rdial-0" onclick="triggerRiskDial(0)">ID</div>
        <div class="risk-dial-circle" id="rdial-1" onclick="triggerRiskDial(1)">PR</div>
        <div class="risk-dial-circle" id="rdial-2" onclick="triggerRiskDial(2)">DE</div>
        <div class="risk-dial-circle" id="rdial-3" onclick="triggerRiskDial(3)">RS</div>
        <div id="risk-rocket" style="font-size:16px; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);">🚀</div>
      </div>
      <div id="risk-demo-log" style="font-size:9.5px; color:var(--text-muted); text-align:center; margin-top:4px;">Click cockpit dials to clear the rocket.</div>
    `;
  }
  
  if (moduleId === 'security-firewalls' && stepIdx === 0) {
    return `
      <div class="firewall-simulation-canvas">
        <div class="packet-node" id="pnode-friend" style="background:#10b981;" onclick="triggerFirewallDemo(true)">User</div>
        <div class="gate-scanner" id="firewall-scanner"></div>
        <div class="gate-bouncer">
          <div class="bouncer-avatar" id="bouncer-avatar">🧐</div>
          <div style="font-size:7px; font-weight:700; color:var(--text-muted);">WAF Guard</div>
        </div>
        <div class="packet-node" id="pnode-hacker" style="background:#ef4444;" onclick="triggerFirewallDemo(false)">Hacker</div>
      </div>
      <div id="firewall-demo-log" style="font-size:9.5px; color:var(--text-muted); text-align:center; margin-top:4px;">Click a guest to send past the bouncer.</div>
    `;
  }
  
  return '';
}

function initInteractiveWidgetState(moduleId, stepIdx) {
  if (moduleId === 'frontend-frameworks' && stepIdx === 0) {
    setTimeout(() => {
      document.querySelectorAll('.lego-block').forEach(b => b.classList.add('active'));
    }, 100);
  }
}

// Python script running animation helper
window.triggerPythonDemo = function() {
  const status = document.getElementById('python-status');
  const log = document.getElementById('python-console-log');
  if (!status || !log) return;
  
  status.textContent = 'Running...';
  status.style.color = '#ef4444';
  log.textContent = '';
  
  synth.playTone(300, 'triangle', 0.05);
  
  const lines = [
    "Scanning current directory for '*.csv'...",
    "Found duplicate files: ['data_v1.csv', 'data_v2.csv']",
    "Processing: data_v1.csv -> combined_data.csv",
    "Processing: data_v2.csv -> combined_data.csv",
    "✓ Script completed in 18ms. Saved to output_report.csv"
  ];
  
  lines.forEach((line, idx) => {
    setTimeout(() => {
      log.textContent += (idx === 0 ? "" : "\n") + ">>> " + line;
      log.scrollTop = log.scrollHeight;
      
      if (idx === lines.length - 1) {
        status.textContent = 'Completed';
        status.style.color = '#10b981';
        synth.playSuccess();
      } else {
        synth.playTone(450 + idx * 80, 'sine', 0.03);
      }
    }, (idx + 1) * 400);
  });
};

// Lego build snap helper
let legoSnappedCount = 0;
window.snapLegoBlock = function(id) {
  const block = document.getElementById(id);
  if (block && !block.classList.contains('snapped')) {
    block.classList.add('snapped');
    block.style.background = '#10b981'; // Green snapped state
    block.textContent = block.textContent.replace('Snap', 'Snapped');
    synth.playTone(500 + legoSnappedCount * 150, 'sine', 0.08);
    
    legoSnappedCount++;
    if (legoSnappedCount === 3) {
      document.getElementById('lego-log').textContent = "🎉 Layout assembled successfully!";
      synth.playSuccess();
      legoSnappedCount = 0;
    }
  }
};

// Kitchen order animation helper
window.triggerKitchenDemo = function() {
  const packet = document.getElementById('kpacket');
  const log = (idx) => {
    document.querySelectorAll('.kitchen-node').forEach(n => n.classList.remove('active'));
    const nodes = ['knode-client', 'knode-waiter', 'knode-chef', 'knode-pantry'];
    if (nodes[idx]) {
      document.getElementById(nodes[idx]).classList.add('active');
    }
  };
  
  packet.classList.remove('traveling');
  void packet.offsetWidth; // trigger reflow
  packet.classList.add('traveling');
  synth.playTone(400, 'triangle', 0.08);
  
  log(0);
  setTimeout(() => { log(1); synth.playTone(500, 'triangle', 0.05); }, 600);
  setTimeout(() => { log(2); synth.playTone(600, 'triangle', 0.05); }, 900);
  setTimeout(() => { log(3); synth.playTone(700, 'sine', 0.1); }, 1200);
  setTimeout(() => { log(0); synth.playTone(880, 'sine', 0.08); }, 1800);
};

// DB query helper
window.triggerDbDemo = function(type) {
  const log = document.getElementById('db-demo-log');
  
  if (type === 'sql') {
    synth.playTone(350, 'sine', 0.05);
    const cells = [0, 3, 6, 7];
    cells.forEach((c, idx) => {
      setTimeout(() => {
        const el = document.getElementById(`scell-${c}`);
        if (el) el.classList.add('active');
        synth.playTone(350 + idx * 100, 'sine', 0.03);
      }, idx * 120);
    });
    setTimeout(() => {
      log.textContent = "SQL indexed scan hit: record found in 4.2ms!";
      synth.playTone(800, 'sine', 0.08);
      setTimeout(() => {
        cells.forEach(c => document.getElementById(`scell-${c}`).classList.remove('active'));
      }, 1000);
    }, 600);
  } else if (type === 'nosql') {
    synth.playTone(400, 'sawtooth', 0.06);
    const bin = document.getElementById('nosql-bin');
    bin.classList.add('active');
    setTimeout(() => {
      bin.classList.remove('active');
      log.textContent = "NoSQL document matching: retrieved in 5.8ms!";
      synth.playTone(850, 'sine', 0.08);
    }, 1000);
  } else if (type === 'redis') {
    synth.playTone(900, 'sine', 0.05);
    const redis = document.getElementById('redis-cache');
    redis.classList.add('active');
    log.textContent = "Redis memory RAM hit: retrieved in 0.1ms!";
    setTimeout(() => {
      redis.classList.remove('active');
    }, 1000);
  }
};

// Risk dials launcher
let activeRiskDials = new Set();
window.triggerRiskDial = function(idx) {
  const dial = document.getElementById(`rdial-${idx}`);
  if (dial) {
    if (activeRiskDials.has(idx)) {
      activeRiskDials.delete(idx);
      dial.classList.remove('active');
      synth.playTone(200, 'sine', 0.06);
    } else {
      activeRiskDials.add(idx);
      dial.classList.add('active');
      synth.playTone(400 + idx * 80, 'sine', 0.06);
    }
    
    const rocket = document.getElementById('risk-rocket');
    const log = document.getElementById('risk-demo-log');
    if (activeRiskDials.size === 4) {
      log.textContent = "Cleared! Launching security controls...";
      rocket.style.transform = "translateY(-30px) scale(1.15)";
      synth.playSuccess();
    } else {
      rocket.style.transform = "translateY(0) scale(1)";
      log.textContent = `${activeRiskDials.size}/4 compliance checks active.`;
    }
  }
};

// Firewall packet scan
window.triggerFirewallDemo = function(isFriend) {
  const scanner = document.getElementById('firewall-scanner');
  const bouncer = document.getElementById('bouncer-avatar');
  const log = document.getElementById('firewall-demo-log');
  
  if (isFriend) {
    synth.playTone(550, 'sine', 0.08);
    bouncer.textContent = '😊';
    scanner.classList.remove('alert');
    log.textContent = "Authorized user: IP matches, packet passed.";
  } else {
    synth.playTone(180, 'sawtooth', 0.15);
    bouncer.textContent = '😠';
    scanner.classList.add('alert');
    log.textContent = "Blocked! SQL Injection signature detected by WAF.";
  }
};

// Modal Challenge Answer Validation
window.submitModalChallengeAnswer = function(optEl, isCorrect) {
  if (activeChallengeCompleted) return;
  
  const options = document.querySelectorAll('.modal-challenge-opt');
  options.forEach(opt => opt.style.pointerEvents = 'none');
  
  if (isCorrect) {
    activeChallengeCompleted = true;
    optEl.classList.add('correct');
    synth.playSuccess();
    
    // Confetti inside modal
    const rect = optEl.getBoundingClientRect();
    const parentRect = document.getElementById('particle-canvas').parentElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - parentRect.left;
    const y = rect.top + rect.height / 2 - parentRect.top;
    particles.spawnExplosion(x, y, 15);
    
    addXP(10); // Bonus XP
    showNotification('🎯 <strong>Challenge Cleared!</strong> Bonus +10 XP awarded!');
  } else {
    optEl.classList.add('wrong');
    synth.playError();
    // Highlight correct
    const module = getModuleById(activeModalModuleId);
    setTimeout(() => {
      options[module.challenge.answer].classList.add('correct');
    }, 400);
  }
};

window.closeModuleModal = function() {
  synth.playFlip();
  document.getElementById('module-modal').classList.remove('show');
  document.body.classList.remove('modal-open');
  activeModalModuleId = null;
};

window.claimXP = function() {
  if (!activeModalModuleId) return;
  
  const module = getModuleById(activeModalModuleId);
  if (state.completedModules.has(module.id)) return;
  
  state.completedModules.add(module.id);
  
  // Unlock badge checks
  if (state.completedModules.size === 1) unlockBadge('first-step');
  if (state.completedModules.size === 5) unlockBadge('skill-builder');
  
  // Update state XP
  addXP(module.xpValue);
  
  // Explosion confetti at CTA click coordinates
  const rect = document.getElementById('modal-cta').getBoundingClientRect();
  const parentRect = document.getElementById('particle-canvas').parentElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - parentRect.left;
  const y = rect.top + rect.height / 2 - parentRect.top;
  
  particles.spawnExplosion(x, y, 30);
  synth.playSuccess();
  
  closeModuleModal();
  updateCareerMarketValue(); // Tick salary and update skill pills & radar chart
  renderModulesGrid();
};

function unlockBadge(badgeId) {
  if (!state.unlockedBadges.has(badgeId)) {
    state.unlockedBadges.add(badgeId);
    const badge = BADGES_LIST.find(b => b.id === badgeId);
    setTimeout(() => {
      showNotification(`✨ <strong>BADGE UNLOCKED!</strong> "${badge.emoji} ${badge.name}" is now in your profile HUD!`);
      synth.playSuccess();
    }, 1200);
  }
}

function addXP(amount) {
  const oldXp = state.xp;
  state.xp += amount;
  
  if (state.xp >= state.xpGoal) {
    // Level Up!
    state.level += 1;
    state.xp = state.xp - state.xpGoal; // Carry over
    state.xpGoal = Math.round(state.xpGoal * 1.5);
    
    // Unlock rising star badge on Level 2
    if (state.level === 2) unlockBadge('rising-star');
    
    // Trigger Level Up Celebration overlay
    setTimeout(() => {
      triggerLevelUpCelebration();
    }, 600);
  }
  
  renderStatsHUD();
  updateCareerMarketValue(); // Recalculate salary baseline on level up
}

// Full-screen Level-up Overlay Controls
function triggerLevelUpCelebration() {
  synth.playLevelUp();
  
  const overlay = document.getElementById('level-up-overlay');
  const levelNum = document.getElementById('new-level-num');
  const badgeName = document.getElementById('unlocked-badge-name');
  const badgeEmoji = document.getElementById('unlocked-badge-emoji');
  
  // Map unlocked badges on level bounds
  let badgeInfo = { emoji: '🔥', name: 'AI Apprentice' };
  if (state.level === 3) badgeInfo = { emoji: '⚡', name: 'Workflow Automator' };
  if (state.level >= 4) badgeInfo = { emoji: '👑', name: 'Systems Architect' };
  
  levelNum.textContent = state.level;
  badgeEmoji.textContent = badgeInfo.emoji;
  badgeName.textContent = badgeInfo.name;
  
  overlay.style.display = 'flex';
  document.body.classList.add('modal-open');
  
  // Spawn constant particles
  const parent = overlay.getBoundingClientRect();
  const x = parent.width / 2;
  const y = parent.height * 0.4;
  
  let explosionCount = 0;
  function constantConfetti() {
    if (explosionCount < 4) {
      particles.spawnExplosion(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 50, 20);
      explosionCount++;
      setTimeout(constantConfetti, 400);
    }
  }
  constantConfetti();
}

window.closeLevelUpCelebration = function() {
  synth.playFlip();
  document.getElementById('level-up-overlay').style.display = 'none';
  document.body.classList.remove('modal-open');
};

// Daily Briefing Scan Effect
window.triggerBriefingScan = function() {
  synth.playTone(440, 'triangle', 0.15);
  synth.playTone(880, 'sine', 0.3, 0.1);
  
  const scanline = document.createElement('div');
  scanline.style.cssText = `
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: #14b8a6;
    box-shadow: 0 0 10px #14b8a6, 0 0 20px #14b8a6;
    pointer-events: none;
    z-index: 100;
    animation: scanline 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `;
  
  const briefingBox = document.querySelector('.briefing-box');
  if (briefingBox) briefingBox.appendChild(scanline);
  
  showNotification('📡 AI Tutor updating briefing feeds with latest industry updates...');
  
  // Trigger dynamic refresh from API
  updateAICareerBriefing();
  
  setTimeout(() => {
    scanline.remove();
  }, 1250);
};

// Daily Quiz Check
let quizCompleted = false;
window.submitQuizAnswer = function(optEl, isCorrect) {
  if (quizCompleted) return;
  
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(opt => opt.classList.add('disabled'));
  
  if (isCorrect) {
    quizCompleted = true;
    optEl.classList.add('correct');
    synth.playSuccess();
    
    const rect = optEl.getBoundingClientRect();
    const parentRect = document.getElementById('particle-canvas').parentElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - parentRect.left;
    const y = rect.top + rect.height / 2 - parentRect.top;
    
    particles.spawnExplosion(x, y, 25);
    addXP(60);
    
    optEl.innerHTML = `<span class="quiz-option-letter" style="background:#14b8a6;color:#fff;">✓</span> <strong>Transformer Architecture!</strong> Powering all major LLMs today. +60 XP Claimed!`;
    
    showNotification('🎉 <strong>Excellent!</strong> Modern AI engines are built completely on attention-based Transformers.');
  } else {
    optEl.classList.add('wrong');
    synth.playError();
    
    // Highlight correct (Index 1 is B)
    setTimeout(() => {
      options[1].classList.add('correct');
    }, 400);
    
    showNotification('❌ Wrong answer. Hint: Think of the 2017 "Attention Is All You Need" paper.');
  }
};

// SPA View Pane Switcher (Jakob's Law Navigation)
window.switchView = function(viewName) {
  // If AI Tutor drawer is open, close it
  const panel = document.getElementById('ai-tutor-panel');
  if (panel && panel.classList.contains('open')) {
    panel.classList.remove('open');
  }

  synth.playFlip();
  state.activeView = viewName;
  
  // Hide all view panes
  const views = ['home', 'saved', 'analytics'];
  views.forEach(v => {
    const pane = document.getElementById(`view-${v}`);
    if (pane) pane.style.display = 'none';
  });
  
  // Show target view pane
  const targetPane = document.getElementById(`view-${viewName}`);
  if (targetPane) targetPane.style.display = 'block';
  
  // Update active nav highlights
  const navKeys = ['home', 'saved', 'analytics', 'tutor'];
  navKeys.forEach(k => {
    const sidebarEl = document.getElementById(`sidebar-nav-${k}`);
    const tabEl = document.getElementById(`tab-nav-${k}`);
    if (sidebarEl) sidebarEl.classList.remove('active');
    if (tabEl) tabEl.classList.remove('active');
  });
  
  const activeSidebarEl = document.getElementById(`sidebar-nav-${viewName}`);
  const activeTabEl = document.getElementById(`tab-nav-${viewName}`);
  if (activeSidebarEl) activeSidebarEl.classList.add('active');
  if (activeTabEl) activeTabEl.classList.add('active');
  
  // Update level progression inside locked templates
  document.querySelectorAll('.current-level-val').forEach(el => {
    el.textContent = `Lvl ${state.level}`;
  });
  
  const savedBar = document.getElementById('saved-lock-progress');
  if (savedBar) {
    const pct = Math.min(100, Math.round((state.level / 3) * 100));
    savedBar.style.width = `${pct}%`;
  }
  
  const analyticsBar = document.getElementById('analytics-lock-progress');
  if (analyticsBar) {
    const pct = Math.min(100, Math.round((state.level / 2) * 100));
    analyticsBar.style.width = `${pct}%`;
  }
  
  // Scroll to top of body
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// AI Tutor Drawer Toggle
window.openAITutor = function(topicName = 'default') {
  const panel = document.getElementById('ai-tutor-panel');
  panel.classList.add('open');
  synth.playFlip();
  
  // Highlight AI Tutor nav item
  const navKeys = ['home', 'saved', 'analytics', 'tutor'];
  navKeys.forEach(k => {
    const sidebarEl = document.getElementById(`sidebar-nav-${k}`);
    const tabEl = document.getElementById(`tab-nav-${k}`);
    if (sidebarEl) sidebarEl.classList.remove('active');
    if (tabEl) tabEl.classList.remove('active');
  });
  const tutorSidebarEl = document.getElementById('sidebar-nav-tutor');
  const tutorTabEl = document.getElementById('tab-nav-tutor');
  if (tutorSidebarEl) tutorSidebarEl.classList.add('active');
  if (tutorTabEl) tutorTabEl.classList.add('active');
  
  if (topicName !== 'default') {
    document.getElementById('tutor-topic-select').value = topicName;
    
    // If opening a lesson, default to chat mode
    toggleTutorMode('chat');
    sendTutorMessage(`Explain how ${topicName} accelerates my career.`);
  } else {
    // Refresh conversation view
    renderConversation();
  }
};

window.closeAITutor = function() {
  document.getElementById('ai-tutor-panel').classList.remove('open');
  synth.playFlip();
  
  // Restore navigation highlights to the active view
  const navKeys = ['home', 'saved', 'analytics', 'tutor'];
  navKeys.forEach(k => {
    const sidebarEl = document.getElementById(`sidebar-nav-${k}`);
    const tabEl = document.getElementById(`tab-nav-${k}`);
    if (sidebarEl) sidebarEl.classList.remove('active');
    if (tabEl) tabEl.classList.remove('active');
  });
  const activeSidebarEl = document.getElementById(`sidebar-nav-${state.activeView}`);
  const activeTabEl = document.getElementById(`tab-nav-${state.activeView}`);
  if (activeSidebarEl) activeSidebarEl.classList.add('active');
  if (activeTabEl) activeTabEl.classList.add('active');
};

// Tutor Modes: Chat or Roleplay
window.toggleTutorMode = function(mode) {
  synth.playTone(880, 'sine', 0.08);
  state.tutorMode = mode;
  
  const personaLabel = document.getElementById('tutor-persona-label');
  const personaSelect = document.getElementById('tutor-persona-select');
  const roleplayLabel = document.getElementById('tutor-roleplay-label');
  const roleplaySelect = document.getElementById('tutor-roleplay-select');
  
  if (mode === 'chat') {
    personaLabel.style.display = 'inline';
    personaSelect.style.display = 'inline';
    roleplayLabel.style.display = 'none';
    roleplaySelect.style.display = 'none';
    
    showNotification('💬 Conversational chat mode activated.');
  } else {
    personaLabel.style.display = 'none';
    personaSelect.style.display = 'none';
    roleplayLabel.style.display = 'inline';
    roleplaySelect.style.display = 'inline';
    
    showNotification('🎭 Interactive roleplay challenge mode activated!');
    // Trigger opening scenario prompt
    selectRoleplayScenario(document.getElementById('tutor-roleplay-select').value);
  }
  
  renderConversation();
};

function renderConversation() {
  const chatArea = document.getElementById('tutor-chat-area');
  if (!chatArea) return;
  chatArea.innerHTML = '';
  
  const avatarEl = document.getElementById('tutor-header-avatar');
  const headingEl = document.getElementById('tutor-heading');
  
  if (state.tutorMode === 'chat') {
    const personaSelect = document.getElementById('tutor-persona-select');
    const persona = personaSelect ? personaSelect.value : 'analogy';
    let avatar = '🧠';
    let heading = 'AI Tutor';
    
    if (persona === 'analogy') {
      avatar = '💡';
      heading = 'AI Tutor (Analogy Master)';
    } else if (persona === 'nocode') {
      avatar = '🛠️';
      heading = 'AI Tutor (No-Code Hacker)';
    } else if (persona === 'tech') {
      avatar = '💻';
      heading = 'AI Tutor (Tech Deep Dive)';
    }
    
    if (avatarEl) avatarEl.textContent = avatar;
    if (headingEl) headingEl.textContent = heading;
    
    chatArea.innerHTML = `
      <div class="chat-msg tutor">
        Hello! I am your AI career mentor. Select a topic context above, or ask me directly how any of these technologies shapes your future career paths!
      </div>
    `;
  } else {
    const scenarioKey = state.activeRoleplayScenario;
    const scenario = ROLEPLAY_SCENARIOS[scenarioKey];
    let avatar = '💼';
    let heading = 'SaaS Founder (Client)';
    
    if (scenarioKey === 'pitch') {
      avatar = '💼';
      heading = 'SaaS Founder (Client)';
    } else if (scenarioKey === 'interview') {
      avatar = '🧐';
      heading = 'Tech Lead (Interviewer)';
    } else if (scenarioKey === 'critique') {
      avatar = '🎨';
      heading = 'Marketer (Creator)';
    }
    
    if (avatarEl) avatarEl.textContent = avatar;
    if (headingEl) headingEl.textContent = heading;
    
    chatArea.innerHTML = `
      <div class="chat-msg tutor">
        <strong>🎭 Career Challenge Active</strong>: You are talking to a <strong>${scenario.role}</strong>. Type your response below to solve their problem!
      </div>
      <div class="chat-msg tutor">
        "${scenario.prompt}"
      </div>
    `;
  }
}

window.updateTutorIdentity = function() {
  renderConversation();
};

// Select Roleplay Scenario
window.selectRoleplayScenario = function(scenarioKey) {
  synth.playFlip();
  state.activeRoleplayScenario = scenarioKey;
  renderConversation();
};

const TUTOR_DIALOGUES = {
  'default': {
    answers: [
      "Technology moves fast. The best way to stay ahead is to build project after project and share your learnings!",
      "Mastering automation is the ultimate leverage in 2026. Focus on workflows, not just syntax.",
      "Focus on cognitive systems thinking. It helps you understand how frontend, backend, and databases link together.",
      "Remember to claim your XP and practice the daily challenge quizzes to level up your career profile!"
    ],
    analogy: "Let's think of this technology like a tool in a workshop. It helps you build things faster and more reliably!",
    nocode: "In the no-code ecosystem, you can plug this technology in using automated integrations like Zapier or Make!",
    tech: "From a technical standpoint, this is all about optimizing performance, data flow, and system scalability."
  },
  'AI Co-pilot Mastery': {
    analogy: "Think of an AI Co-pilot like an extremely fast assistant chef. You design the menu and taste the soup, while they chop the onions and wash the pans.",
    nocode: "Tools like GitHub Copilot or Cursor index your directories. No-coders use them to write custom CSS or database queries in seconds by just asking.",
    tech: "AI code assistants utilize vector embeddings of your files to inject local context into prompt windows, leveraging large context windows (like Claude 3.5's 200k) to debug codebases."
  },
  'Prompt Engineering for Strategy': {
    analogy: "It's like delegating to a genius intern. If you say 'write a report', you get a generic report. If you give them XML files, target formats, and clear examples, you get a masterpiece.",
    nocode: "No-code workflows use structured prompts inside tools like ChatGPT or Zapier AI steps to clean data, summarize transcripts, and catalog records automatically.",
    tech: "True prompt engineering uses few-shot system prompts, JSON outputs, delimiter tags, and chain-of-thought instructions to ensure reliable, structured LLM responses."
  },
  'Building in Public': {
    analogy: "Instead of baking a cake in secret and hoping people buy it, you bake it in a shop window. People smell it, see your recipe adjustments, and queue up to buy it.",
    nocode: "No-code builders share their Framer designs or Zapier automation flows on LinkedIn and Twitter. It drives recruiting inbound without resumes.",
    tech: "It establishes public proof of work. Commits, design system links, and portfolio websites serve as public ledger records of your real capabilities."
  },
  'The Solopreneur Stack': {
    analogy: "It's like a Lego castle. Instead of molding plastic bricks from scratch, you snap together ready-made blocks (payment buttons, form fields, page builders) to make a fort.",
    nocode: "Combine Framer for the design, Airtable for data, Stripe for payments, and Zapier to link them. You can build a functioning SaaS startup in 24 hours.",
    tech: "Utilizes serverless edge functions, REST APIs, and micro-integrations to run global platforms with virtually zero maintenance and near-zero server cost."
  },
  'Systems Thinking': {
    analogy: "Instead of just replacing a squeaky wheel on a cart, you look at the cart's balance, the load weight, and the road conditions to understand why the wheel squeaked.",
    nocode: "Map your business workflows as databases and loops before building. It ensures you don't automate a broken, inefficient manual process.",
    tech: "Analyzes system architecture via feedback loops, bottlenecks, and queuing systems. Fixes problems at the root layer rather than coding band-aids."
  },
  'Data Literacy': {
    analogy: "It's like reading a weather map. Anyone can look at a cloud, but data literacy is reading pressure systems and temperature gradients to predict a storm.",
    nocode: "Use tools like Airtable charts or Google Looker Studio to visualize customer database trends without writing complex SQL queries.",
    tech: "Involves querying data with SQL or vector indexes, identifying confirmation and selection bias, and verifying statistical significance."
  },
  'Quantum Computing Decoded': {
    analogy: "A classical computer is a coin that can be heads (0) or tails (1). A quantum computer is a spinning coin that exists in both states at once (superposition) until it stops.",
    nocode: "Cloud services now provide API access to quantum hardware, allowing no-coders to solve scheduling or routing optimization problems via custom plugins.",
    tech: "Utilizes superposition and entanglement of qubits to run algorithms (like Shor's or Grover's) that evaluate complex calculations in parallel."
  },
  'CRISPR & Biotech Revolution': {
    analogy: "Think of DNA as a long text document. CRISPR is like using 'Find & Replace' (Ctrl+F) to replace a misspelled word with the correct spelling.",
    nocode: "Modern labs use drag-and-drop sequencing interfaces and biological APIs to design custom cellular experiments without raw code editing.",
    tech: "AI models (like AlphaFold) predict complex 3D protein structures, turning molecular biology from experimental science into a computational engineering field."
  },
  'Zero-Trust Security': {
    analogy: "Traditional security is a castle with a moat (firewall). Once inside, you can access everything. Zero-Trust is a high-security hotel where you need a keycard for every door.",
    nocode: "Implement passkeys and identity verification (like Okta or Auth0) on your low-code apps so that only verified team devices can view database records.",
    tech: "Enforces micro-segmentation, continuous multi-factor authentication (MFA), least privilege access, and strict identity validation on every request."
  },
  'WebAssembly 3.0 in Practice': {
    analogy: "It's like a sports car track inside a shopping mall. You can drive a high-performance engine (compiled Rust/C++) inside a safe, sandboxed browser tab.",
    nocode: "Allows no-code builders to create browser extensions or web widgets that run advanced image processing or local AI models at native speed.",
    tech: "Wasm compiles high-performance languages (Rust, C++, Go) into secure bytecode running alongside JavaScript inside the browser tab."
  },
  'Frontend Frameworks': {
    analogy: "Think of HTML as the raw bricks, CSS as the paint, and a Frontend Framework (like React) as the pre-built room modules. Instead of placing every brick by hand, you snap rooms together!",
    nocode: "No-code builders use tools like Framer or Webflow. They compile your drag-and-drop actions into clean React/HTML code behind the scenes. Best of both worlds!",
    tech: "React uses a Virtual DOM. When state changes, it compares the new VDOM tree with the old one (diffing) and updates only the changed browser nodes. Angular uses zones, and Svelte compiles static code."
  },
  'Backend Frameworks': {
    analogy: "The frontend is the waiter taking orders. The Backend Framework is the kitchen crew. It coordinates database orders, checks security recipes, and prepares the data plates.",
    nocode: "No-code backends like Xano or Supabase let you visually design database routes and API workflows without writing Python/Node code. They handle scaling automatically.",
    tech: "FastAPI uses Python asynchronous co-routines (async/await) and Pydantic for data validation. Express uses Node's single-threaded event loop. Spring Boot uses multi-threaded JVM execution."
  },
  'Database Systems': {
    analogy: "A database is a giant digital warehouse. SQL is a clean grid of shelves (structured). NoSQL is a collection of flexible storage bins (documents). Vector DB is a spatial map of concepts (meanings).",
    nocode: "In no-code, we use Airtable for a spreadsheet-like database, or Supabase for a visual PostgreSQL engine. They connect to frontend visual editors via webhooks.",
    tech: "PostgreSQL uses B-Tree indexes for structured columns. MongoDB uses document-based BSON logs. Redis runs in RAM for speed, and Pinecone queries high-dimensional cosine distances."
  },
  'Risk Frameworks': {
    analogy: "A Risk Framework (like NIST) is a pre-flight checklist for pilots. It doesn't fly the plane, but it ensures you checked the engines, fuel, and security logs before takeoff.",
    nocode: "Platforms like Vanta or Drata automate risk compliance. They connect to your GitHub, AWS, and Slack accounts to automatically verify that you pass SOC 2 security checks.",
    tech: "SOC 2 evaluates systems against five Trust Services Criteria. NIST CSF maps controls to assets. Technical audits check cryptographic compliance and key rotations."
  },
  'Security Firewalls': {
    analogy: "A Firewall is a bouncer at the club door. A traditional firewall checks your ID (IP address). A WAF (Web Application Firewall) opens your bag and inspects your items (HTTP headers and payloads).",
    nocode: "Services like Cloudflare act as a global edge shield. They route all your app's web traffic through their servers to block attacks before your visual database can be reached.",
    tech: "A WAF operates at Layer 7 (Application) to inspect payloads for SQL injections or XSS. Stateful firewalls track active TCP handshakes at Layer 4 (Transport)."
  },
  'Python Automation Decoded': {
    analogy: "Think of Python like a digital Swiss Army knife. It's simple to carry, easy to use, and has tools to open folders, edit spreadsheets, and fetch API data.",
    nocode: "Low-code tools like Make or Zapier let you write 5-line Python script blocks to perform custom formatting that standard visual nodes can't handle.",
    tech: "Python script engines run interpreted code using automatic memory management and dynamic typing. Ideal for quick automations, shell scripting, and AI vector queries."
  }
};

// Tutor Chat & Roleplay controller
window.handleTutorInput = function() {
  const input = document.getElementById('ai-tutor-chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  input.value = '';
  sendTutorMessage(text);
};

function sendTutorMessage(text) {
  const chatArea = document.getElementById('tutor-chat-area');
  
  // Append User message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  chatArea.appendChild(userMsg);
  chatArea.scrollTop = chatArea.scrollHeight;
  
  // Append Typing indicator
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  chatArea.appendChild(indicator);
  chatArea.scrollTop = chatArea.scrollHeight;
  
  setTimeout(() => {
    indicator.remove();
    
    let reply = "";
    let isRoleplaySuccess = false;
    
    if (state.tutorMode === 'chat') {
      const selectedTopic = document.getElementById('tutor-topic-select').value;
      const persona = document.getElementById('tutor-persona-select').value;
      const lower = text.toLowerCase();
      
      const dialogue = TUTOR_DIALOGUES[selectedTopic] || TUTOR_DIALOGUES['default'];
      
      if (lower.includes('code') || lower.includes('example') || lower.includes('syntax')) {
        // Find matching module to get modern 2026 code
        const matchedMod = BITES.find(b => b.modal.title.toLowerCase().includes(selectedTopic.toLowerCase()) || b.title.toLowerCase().includes(selectedTopic.toLowerCase()) || b.tag.toLowerCase().includes(selectedTopic.toLowerCase()));
        if (matchedMod && matchedMod.version2026) {
          const v = matchedMod.version2026;
          const sId = 'tutor-code-' + Date.now();
          reply = `Here is the latest 2026 modern code implementation for <strong>${matchedMod.title}</strong>:<br><br>
            <div class="tutor-code-sandbox">
              <div class="tutor-code-header">
                <span><span class="version-pill-2026">2026</span> ${v.version}</span>
                <button class="tutor-run-btn" onclick="runTutorCode('${sId}')"><i class="ti ti-player-play"></i> Run Code</button>
              </div>
              <div class="tutor-code-body">${v.codeSnippet}</div>
              <div class="tutor-code-output" id="${sId}" data-output="${v.output.replace(/"/g, '&quot;')}"></div>
            </div>`;
        } else {
          const sId = 'tutor-code-' + Date.now();
          reply = `Here is a modern 2026 Python automation script snippet:<br><br>
            <div class="tutor-code-sandbox">
              <div class="tutor-code-header">
                <span><span class="version-pill-2026">2026</span> Python 3.14 JIT</span>
                <button class="tutor-run-btn" onclick="runTutorCode('${sId}')"><i class="ti ti-player-play"></i> Run Code</button>
              </div>
              <div class="tutor-code-body"># Python 3.14 JIT Pipeline\nimport asyncio, pathlib\n\nasync def main():\n    print("Optimized loop execution active!")\n    return "✓ Success: 0.4ms"\n\nasyncio.run(main())</div>
              <div class="tutor-code-output" id="${sId}" data-output=">>> Optimized loop execution active!\n>>> ✓ Success: 0.4ms [JIT compiled]"></div>
            </div>`;
        }
      } else if (lower.includes('latest') || lower.includes('2026') || lower.includes('updates')) {
        const matchedMod = BITES.find(b => b.modal.title.toLowerCase().includes(selectedTopic.toLowerCase()) || b.title.toLowerCase().includes(selectedTopic.toLowerCase()) || b.tag.toLowerCase().includes(selectedTopic.toLowerCase()));
        if (matchedMod && matchedMod.version2026) {
          const v = matchedMod.version2026;
          reply = `🚀 <strong>2026 Latest Standard for ${matchedMod.tag}</strong>:<br><br>
            <strong>Version:</strong> <span class="version-pill-2026">${v.version}</span> [${v.status}]<br>
            <strong>Key Headline:</strong> ${v.headline}<br><br>
            <strong>Modern Shift:</strong> ${v.modern}<br><br>
            <em>Click "2026 Code Example" below to run the live sandbox!</em>`;
        } else {
          reply = `🚀 <strong>2026 Tech Stack Highlights</strong>:<br><br>
            • <strong>Python 3.14:</strong> Native CPython JIT compiler & free-threaded GIL for true multicore loops.<br>
            • <strong>React 19 & Next.js 16:</strong> Full Server Actions adoption & streaming React Server Components.<br>
            • <strong>PostgreSQL 17:</strong> Native JSON_TABLE support and pgvector 0.8+ with halfvec.<br>
            • <strong>WebAssembly 3.0:</strong> Native Garbage Collection & Component Model for polyglot web speed.`;
        }
      } else if (lower.includes('quiz') || lower.includes('challenge')) {
        const matchedMod = BITES.find(b => b.modal.title.toLowerCase().includes(selectedTopic.toLowerCase()) || b.title.toLowerCase().includes(selectedTopic.toLowerCase()));
        const ch = matchedMod ? matchedMod.challenge : {
          q: "What is the primary speed benefit of the Python 3.14 JIT compiler?",
          opts: ["Freezes bytecode in RAM", "Translates hot loop bytecode to native machine instructions", "Removes variables from memory", "Deletes redundant functions"],
          answer: 1
        };
        reply = `🧠 <strong>Rapid Concept Quiz</strong>:<br><br>${ch.q}<br><br>` +
          ch.opts.map((opt, i) => `<button class="quick-chip" style="margin: 3px 0; width: 100%; text-align: left; padding: 6px 10px;" onclick="checkTutorQuiz(this, ${i === ch.answer})"><strong>${String.fromCharCode(65+i)}.</strong> ${opt}</button>`).join('');
      } else {
        if (selectedTopic === 'default') {
          const randIdx = Math.floor(Math.random() * dialogue.answers.length);
          reply = dialogue.answers[randIdx];
        } else {
          reply = dialogue[persona] || dialogue['analogy'];
        }
      }
    } else {
      // Roleplay mode evaluation
      const scenario = ROLEPLAY_SCENARIOS[state.activeRoleplayScenario];
      const lowerText = text.toLowerCase();
      
      // Initialize attempts tracking if not present
      if (!state.roleplayAttempts) {
        state.roleplayAttempts = {};
      }
      if (state.roleplayAttempts[state.activeRoleplayScenario] === undefined) {
        state.roleplayAttempts[state.activeRoleplayScenario] = 0;
      }
      
      if (lowerText === 'help' || lowerText === 'hint' || lowerText.includes('explain') || lowerText.includes('confused')) {
        // Explicitly provide direct hints when user asks for help
        if (state.activeRoleplayScenario === 'pitch') {
          reply = `*Client whispers:* "I need to hear how low-code tools work together. Try mentioning at least two of these: 'Framer' or 'Webflow' for the site front, 'Stripe' for billing, and 'Zapier' or 'Make' for email automations."`;
        } else if (state.activeRoleplayScenario === 'interview') {
          reply = `*Interviewer whispers:* "Think about machine learning. Try mentioning 'embeddings' (high-dimensional text coordinates) and 'semantic similarity' (matching context instead of keyword searches)."`;
        } else {
          reply = `*Creator whispers:* "Try mentioning prompt framework concepts like giving the AI a clear 'role' or 'persona', providing target 'context', or offering 'few-shot examples'."`;
        }
        isRoleplaySuccess = false;
      } else {
        const evaluation = scenario.eval(text);
        isRoleplaySuccess = evaluation.success;
        
        if (isRoleplaySuccess) {
          reply = evaluation.msg;
          state.roleplayAttempts[state.activeRoleplayScenario] = 0; // reset
        } else {
          state.roleplayAttempts[state.activeRoleplayScenario]++;
          const attemptsCount = state.roleplayAttempts[state.activeRoleplayScenario];
          
          if (attemptsCount >= 2) {
            // Provide progressive hints if stuck!
            if (state.activeRoleplayScenario === 'pitch') {
              reply = `*Client scratches head:* "Wait, you mentioned something complex. Let's make it simpler. Can you use Framer to design the frontend and Zapier to trigger welcome emails? Mention Framer and Zapier together so I know they work."`;
            } else if (state.activeRoleplayScenario === 'interview') {
              reply = `*Tech Lead steps in:* "Let's narrow it down. We need high-dimensional math. How does a database store text embeddings and calculate similarity? Try typing 'embeddings' and 'similarity' in your reply."`;
            } else {
              reply = `*Creator smiles patiently:* "I'm still a bit stuck on the prompt details. What if we specify the AI's role and give it a few-shot writing example? Try mentioning 'role' and 'example' in your response."`;
            }
          } else {
            reply = evaluation.msg;
          }
        }
      }
    }
    
    // Append Tutor message
    const tutorMsg = document.createElement('div');
    tutorMsg.className = 'chat-msg tutor';
    chatArea.appendChild(tutorMsg);
    
    const hasHTML = reply.includes('<');
    if (hasHTML) {
      tutorMsg.innerHTML = reply;
      chatArea.scrollTop = chatArea.scrollHeight;
      synth.playTone(600, 'sine', 0.05);
    } else {
      let charIdx = 0;
      synth.playTone(600, 'sine', 0.05);
      
      function typeChar() {
        if (charIdx < reply.length) {
          tutorMsg.innerHTML += reply.charAt(charIdx);
          charIdx++;
          chatArea.scrollTop = chatArea.scrollHeight;
          
          if (charIdx % 4 === 0) {
            synth.playTone(800 + Math.random() * 200, 'sine', 0.02);
          }
          setTimeout(typeChar, 10 + Math.random() * 12);
        } else {
          // Trigger rewards on roleplay success
          if (state.tutorMode === 'roleplay' && isRoleplaySuccess) {
            setTimeout(() => {
              synth.playSuccess();
              const panelRect = document.getElementById('ai-tutor-panel').getBoundingClientRect();
              const parentRect = document.getElementById('particle-canvas').parentElement.getBoundingClientRect();
              const x = panelRect.left + panelRect.width / 2 - parentRect.left;
              const y = panelRect.top + panelRect.height * 0.4 - parentRect.top;
              particles.spawnExplosion(x, y, 20);
              addXP(40);
            }, 400);
          }
        }
      }
      typeChar();
    }
    
  }, 700);
}

// Quick Prompt & Code Sandbox Handlers
window.sendQuickPrompt = function(type) {
  const selectedTopic = document.getElementById('tutor-topic-select').value;
  let query = "";
  if (type === 'analogy') {
    query = `Explain ${selectedTopic === 'default' ? 'this technology' : selectedTopic} with an ELI5 analogy.`;
  } else if (type === 'code') {
    query = `Show me a modern 2026 code example for ${selectedTopic === 'default' ? 'Python automation' : selectedTopic}.`;
  } else if (type === 'quiz') {
    query = `Give me a quick 1-question practice quiz on ${selectedTopic === 'default' ? 'modern tech concepts' : selectedTopic}.`;
  } else if (type === 'latest') {
    query = `What are the latest 2026 version updates for ${selectedTopic === 'default' ? 'the tech stack' : selectedTopic}?`;
  }
  sendTutorMessage(query);
};

window.runTutorCode = function(sandboxId) {
  synth.playTone(550, 'triangle', 0.06);
  const out = document.getElementById(sandboxId);
  if (!out) return;
  out.style.display = 'block';
  out.innerHTML = `<span style="color:#f59e0b;"><i class="ti ti-loader" style="animation:spin 1s linear infinite; display:inline-block;"></i> Compiling and running modern 2026 runtime...</span>`;
  
  setTimeout(() => {
    synth.playSuccess();
    const result = out.getAttribute('data-output') || '>>> Execution completed in 1.4ms (0 errors)';
    out.innerHTML = `<strong>Console Output:</strong>\n${result}`;
  }, 450);
};

window.checkTutorQuiz = function(btn, isCorrect) {
  if (isCorrect) {
    synth.playSuccess();
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.innerHTML += ' ✓ Correct! +15 XP';
    addXP(15);
  } else {
    synth.playError();
    btn.style.background = '#ef4444';
    btn.style.color = 'white';
    btn.innerHTML += ' ✗ Try again!';
  }
};

// Tech Radar 2026 Data & Controller
const TECH_RADAR_DATA = {
  adopt: [
    { name: "Python 3.14", version: "v3.14.0", desc: "CPython JIT compiler tier & free-threaded multi-core execution without GIL." },
    { name: "React 19 & Next.js 16", version: "v19.1.0", desc: "Server Actions, streaming Server Components & Turbopack default bundling." },
    { name: "PostgreSQL 17", version: "v17.2", desc: "Native SQL:2023 JSON_TABLE, memory-optimized vacuuming, pgvector 0.8+." },
    { name: "Tailwind CSS v4", version: "v4.0.0", desc: "CSS-first engine powered by Lightning CSS; zero-config build pipeline." },
    { name: "Zero-Trust Passkeys", version: "WebAuthn L3", desc: "Hardware-backed biometrics replacing static passwords & SMS 2FA globally." }
  ],
  trial: [
    { name: "WebAssembly 3.0", version: "Wasm GC / Component", desc: "Garbage Collection & Component Model for polyglot near-native browser modules." },
    { name: "LangGraph Multi-Agent Swarms", version: "v0.3", desc: "Stateful multi-agent orchestration for end-to-end automated software delivery." },
    { name: "Vector DBs with HNSW", version: "Pinecone / pgvector", desc: "Sub-millisecond approximate nearest-neighbor search for high-dimensional embeddings." }
  ],
  assess: [
    { name: "Quantum Cloud APIs", version: "Qiskit 1.3+", desc: "Cloud-hosted quantum hardware for combinatorial optimization & logistics routing." },
    { name: "AlphaFold 3 Biotech", version: "API 2026", desc: "High-accuracy biomolecular interaction modeling for drug discovery pipelines." }
  ],
  hold: [
    { name: "REST Polling for Real-Time", version: "Legacy", desc: "High server load & latency. Migrate to Server-Sent Events (SSE) or WebSockets." },
    { name: "Unstructured Raw Prompts", version: "Legacy", desc: "Non-deterministic outputs. Migrate to JSON schemas & function calling." }
  ]
};

window.openTechRadar = function() {
  synth.playFlip();
  const modal = document.getElementById('tech-radar-modal');
  if (!modal) return;
  renderTechRadar();
  modal.classList.add('show');
  document.body.classList.add('modal-open');
};

window.closeTechRadar = function() {
  synth.playFlip();
  const modal = document.getElementById('tech-radar-modal');
  if (modal) modal.classList.remove('show');
  document.body.classList.remove('modal-open');
};

function renderTechRadar() {
  const container = document.getElementById('tech-radar-content');
  if (!container) return;
  
  const quadrants = [
    { key: 'adopt', title: 'Adopt (Essential 2026 Standards)', icon: '🟢', color: '#10b981' },
    { key: 'trial', title: 'Trial (High-Growth Production)', icon: '🔵', color: '#38bdf8' },
    { key: 'assess', title: 'Assess (Promising Frontier Tech)', icon: '🟣', color: '#a855f7' },
    { key: 'hold', title: 'Hold (Legacy Patterns to Retire)', icon: '🔴', color: '#ef4444' }
  ];
  
  container.innerHTML = `
    <div class="radar-grid">
      ${quadrants.map(q => `
        <div class="radar-quadrant">
          <div class="radar-quadrant-title" style="color:${q.color};">
            <span>${q.icon}</span> ${q.title}
          </div>
          ${TECH_RADAR_DATA[q.key].map(item => `
            <div class="radar-item-card" onclick="openRadarItem('${item.name}')">
              <div class="radar-item-header">
                <span class="radar-item-title">${item.name}</span>
                <span class="radar-item-version">${item.version}</span>
              </div>
              <div class="radar-item-desc">${item.desc}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

window.openRadarItem = function(techName) {
  closeTechRadar();
  openAITutor('default');
  sendTutorMessage(`Explain why ${techName} is in the 2026 Tech Radar and show a quick code example.`);
};

// 3D Card Tilt Mouse Move Effect
function initTiltEffect() {
  const card = document.querySelector('.featured-card');
  const cardWrapper = document.querySelector('.featured-card-wrapper');
  
  if (!card) return;
  
  cardWrapper.addEventListener('mousemove', (e) => {
    const rect = cardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const tiltX = (yc - y) / 10;
    const tiltY = (x - xc) / 15;
    
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  });
  
  cardWrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

// Light / Dark Theme toggle
window.toggleTheme = function() {
  synth.playTone(880, 'sine', 0.1);
  const body = document.body;
  
  if (state.theme === 'dark') {
    state.theme = 'light';
    body.setAttribute('data-theme', 'light');
    document.querySelector('.theme-btn i').className = 'ti ti-moon';
    showNotification('☀️ Switched to Light Theme.');
  } else {
    state.theme = 'dark';
    body.removeAttribute('data-theme');
    document.querySelector('.theme-btn i').className = 'ti ti-sun';
    showNotification('🌙 Switched to Dark Theme.');
  }
};

// App widgets helper and logic functions
window.toggleOtherModules = function() {
  synth.playFlip();
  const sec = document.getElementById('explore-other-sec');
  const title = document.querySelector('.modules-group-title.explore-title');
  if (!sec) return;
  
  state.exploreOtherCollapsed = !state.exploreOtherCollapsed;
  
  if (state.exploreOtherCollapsed) {
    sec.classList.add('collapsed');
    if (title) title.classList.add('collapsed');
  } else {
    sec.classList.remove('collapsed');
    if (title) title.classList.remove('collapsed');
  }
};

const RADAR_AXES = ['ai', 'creator', 'cognitive', 'frontier', 'tech'];
const CAREER_RADAR_TARGETS = {
  default: [50, 50, 50, 50, 50],
  creative: [80, 85, 45, 35, 40],   // [ai, creator, cognitive, frontier, tech]
  business: [70, 40, 85, 45, 45],
  technical: [80, 35, 45, 50, 85],
  founder: [60, 85, 80, 40, 50]
};

function getRadarCoordinates(radii) {
  const cx = 100;
  const cy = 100;
  const points = [];
  
  for (let i = 0; i < 5; i++) {
    const r = radii[i];
    const angle = (i * 72) * Math.PI / 180;
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  
  return points.join(' ');
}

function updateRadarChart() {
  const targetPoly = document.getElementById('radar-target-poly');
  const currentPoly = document.getElementById('radar-current-poly');
  if (!targetPoly || !currentPoly) return;
  
  const activeCareer = state.activeCareer || 'default';
  const targetValues = CAREER_RADAR_TARGETS[activeCareer] || CAREER_RADAR_TARGETS.default;
  const targetRadii = targetValues.map(v => 15 + 65 * (v / 100));
  targetPoly.setAttribute('points', getRadarCoordinates(targetRadii));
  
  const completedPerTrack = { ai: 0, creator: 0, cognitive: 0, frontier: 0, tech: 0 };
  const totalPerTrack = { ai: 2, creator: 2, cognitive: 2, frontier: 2, tech: 8 };
  
  state.completedModules.forEach(id => {
    const module = getModuleById(id);
    if (module && completedPerTrack[module.track] !== undefined) {
      completedPerTrack[module.track]++;
    }
  });
  
  const currentRadii = RADAR_AXES.map(track => {
    const completed = completedPerTrack[track];
    const total = totalPerTrack[track];
    const fraction = total > 0 ? completed / total : 0;
    return 20 + 60 * fraction;
  });
  
  currentPoly.setAttribute('points', getRadarCoordinates(currentRadii));
  
  const focusTracks = state.activeCareer ? CAREER_MAP[state.activeCareer].focusTracks : [];
  const labels = document.querySelectorAll('.radar-label');
  labels.forEach((label, idx) => {
    const track = RADAR_AXES[idx];
    if (focusTracks.includes(track) || completedPerTrack[track] > 0) {
      label.classList.add('highlighted');
    } else {
      label.classList.remove('highlighted');
    }
  });
}

function initRadarGrid() {
  const svg = document.getElementById('skill-radar-svg');
  if (!svg) return;
  
  const targetPoly = document.getElementById('radar-target-poly');
  const cx = 100, cy = 100;
  const scales = [20, 40, 60, 80, 100];
  
  scales.forEach(scale => {
    const r = 20 + 60 * (scale / 100);
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('class', 'radar-grid-pentagon');
    
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72) * Math.PI / 180;
      const x = cx + r * Math.sin(angle);
      const y = cy - r * Math.cos(angle);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    
    poly.setAttribute('points', pts.join(' '));
    svg.insertBefore(poly, targetPoly);
  });
  
  for (let i = 0; i < 5; i++) {
    const r = 80;
    const angle = (i * 72) * Math.PI / 180;
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'radar-axis-line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', x.toFixed(1));
    line.setAttribute('y2', y.toFixed(1));
    svg.insertBefore(line, targetPoly);
  }
}

let displayedSalary = 80000;
function updateCareerMarketValue(instant = false) {
  const valEl = document.getElementById('market-value-val');
  const pctEl = document.getElementById('market-value-pct');
  const pillsEl = document.getElementById('unlocked-skills-pills');
  if (!valEl || !pctEl) return;
  
  const baseSalary = 80000;
  const levelMultiplier = Math.pow(1.12, state.level - 1);
  const moduleBonus = state.completedModules.size * 2500;
  
  const targetSalary = Math.round((baseSalary * levelMultiplier) + moduleBonus);
  const pctChange = Math.round(((targetSalary - baseSalary) / baseSalary) * 100);
  
  pctEl.textContent = pctChange;
  
  if (instant) {
    displayedSalary = targetSalary;
    valEl.textContent = targetSalary.toLocaleString();
  } else {
    const duration = 800;
    const startTime = performance.now();
    const startSalary = displayedSalary;
    
    function tick(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      displayedSalary = Math.round(startSalary + (targetSalary - startSalary) * ease);
      valEl.textContent = displayedSalary.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        displayedSalary = targetSalary;
        valEl.textContent = targetSalary.toLocaleString();
      }
    }
    requestAnimationFrame(tick);
  }
  
  if (pillsEl) {
    pillsEl.innerHTML = '';
    
    if (state.streak > 0) {
      const streakPill = document.createElement('span');
      streakPill.className = 'skill-pill-tag';
      streakPill.innerHTML = `<i class="ti ti-flame" style="color:#f97316;"></i> Streak: ${state.streak}d`;
      pillsEl.appendChild(streakPill);
    }
    
    if (state.completedModules.size === 0) {
      const emptyPill = document.createElement('span');
      emptyPill.className = 'skill-pill-tag';
      emptyPill.style.opacity = '0.55';
      emptyPill.textContent = 'No skills telemetry. Complete a module!';
      pillsEl.appendChild(emptyPill);
    } else {
      state.completedModules.forEach(id => {
        const module = getModuleById(id);
        if (module) {
          const pill = document.createElement('span');
          let colorClass = 'tag-blue';
          if (module.track === 'creator') colorClass = 'tag-purple';
          if (module.track === 'cognitive') colorClass = 'tag-teal';
          if (module.track === 'frontier') colorClass = 'tag-purple';
          if (module.track === 'tech') colorClass = 'tag-amber';
          
          pill.className = `skill-pill-tag ${colorClass}`;
          pill.innerHTML = `${module.icon} ${module.tag}`;
          pillsEl.appendChild(pill);
        }
      });
    }
  }
  
  updateRadarChart();
}

const TELEMETRY_SIGNALS = [
  {
    message: "⚡ AI Orchestrator salary demands spike 18% in SF and NY tech hubs.",
    moduleId: "ai-copilot",
    trendPoint: "**AI Agent Orchestration (2026 Trend)**: Integrating multiple specialized agents using LangGraph to automate complex multi-file engineering pipelines."
  },
  {
    message: "📈 Rust Wasm compiler updates unlock high-speed browser-based local model inferences.",
    moduleId: "wasm-web",
    trendPoint: "**Wasm Neural Networks (2026 Trend)**: Compiling model execution runtime environments directly to WebAssembly to run models in client tabs without server resources."
  },
  {
    message: "🔒 Zero-Trust validation protocol adoption reaches 88% in compliance reports.",
    moduleId: "zero-trust",
    trendPoint: "**Continuous Cryptographic Proofs (2026 Trend)**: Shifting from static session tokens to ephemeral cryptographic handshakes checking device posture every 30 seconds."
  },
  {
    message: "💾 Vector database index query latency drops 45% using next-gen geometric nodes.",
    moduleId: "database-systems",
    trendPoint: "**HNSW Index Scaling (2026 AI Trend)**: Utilizing Hierarchical Navigable Small World (HNSW) graph layers to query millions of high-dimensional coordinates in under 2ms."
  },
  {
    message: "⚙️ NextJS 16 deployment tests show +120% improvement in edge execution speed.",
    moduleId: "frontend-frameworks",
    trendPoint: "**React Server Components at Edge (2026 Trend)**: Stream raw database records directly to the browser client using next-gen server component compilation at edge nodes."
  },
  {
    message: "🛡️ Cloud WAF shield successfully mitigates massive coordinated API scraper network.",
    moduleId: "security-firewalls",
    trendPoint: "**AI-Driven Payload Signature Scans (2026 Trend)**: WAF edge shields automatically detecting and blocking LLM agent scanning probes using behavioral detection heuristics."
  },
  {
    message: "🌐 WebAssembly garbage collection enters default runtime structures in Chrome & Safari.",
    moduleId: "wasm-web",
    trendPoint: "**Wasm Garbage Collection (2026 Trend)**: Allowing memory-managed languages like Kotlin and Java to run at near-native speeds inside browser tabs."
  },
  {
    message: "🧠 Prompt injection vulnerability patches deployed on major LLM endpoints.",
    moduleId: "prompt-eng",
    trendPoint: "**Indirect Prompt Injection Shields (2026 Trend)**: Designing validation rules to detect hidden prompts embedded inside parsed text blocks and markdown tags."
  },
  {
    message: "⚠️ NIST compliance framework v3 draft releases new cybersecurity guidelines.",
    moduleId: "risk-frameworks",
    trendPoint: "**AI Integrity Compliance (2026 NIST Trend)**: Introducing strict checks evaluating the reliability, drift parameters, and safety controls of deployed LLMs."
  },
  {
    message: "💰 Single-operator automated SaaS startup reaches $10M ARR milestone.",
    moduleId: "solopreneur-stack",
    trendPoint: "**Autonomous Agent Operations (2026 Trend)**: Leveraging fleets of AI sales agents to manage CRM funnels, customer billing, and system operations in parallel."
  },
  {
    message: "🚀 Agentic coding automation reduces typical enterprise feature shipping times by 75%.",
    moduleId: "ai-copilot",
    trendPoint: "**Multi-Agent Coding Swarms (2026 Trend)**: Coordinating separate coding, code-reviewing, and deployment agents to write full test-passing commits without human guidance."
  },
  {
    message: "🐍 Python 3.14 alpha release optimizes syntax loops and script execution speeds by 22%.",
    moduleId: "python-automation",
    trendPoint: "**Python Script Optimization (2026 Trend)**: Utilizing the new CPython JIT compiler tier to run local automation scripts, CSV cleaning loops, and local data transforms 22% faster."
  }
];

function addTelemetryLog(message, type = 'normal') {
  const terminal = document.getElementById('telemetry-terminal-log');
  if (!terminal) return;
  
  const line = document.createElement('div');
  line.className = `telemetry-log-line ${type}`;
  
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  
  line.innerHTML = `<span class="timestamp">[${timeStr}]</span>${message}`;
  terminal.appendChild(line);
  
  const lines = terminal.querySelectorAll('.telemetry-log-line');
  if (lines.length > 6) {
    lines[0].remove();
  }
  
  terminal.scrollTop = terminal.scrollHeight;
}

window.triggerTelemetryTrendTick = function() {
  const signal = TELEMETRY_SIGNALS[Math.floor(Math.random() * TELEMETRY_SIGNALS.length)];
  addTelemetryLog(signal.message);
  
  const moduleId = signal.moduleId;
  const module = getModuleById(moduleId);
  if (module) {
    window.activeTrends[moduleId] = {
      message: signal.message,
      point: signal.trendPoint,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Play trend notification sound
    synth.playTone(880, 'sine', 0.04);
    
    renderModulesGrid();
    showNotification(`🔥 <strong>Trend Update</strong>: '${module.tag}' learning content updated with latest industry signals!`);
  }
};

async function updateAICareerBriefing() {
  const briefingContainer = document.getElementById('briefing-list');
  if (!briefingContainer) return;

  try {
    // Fetch latest AI articles from Dev.to API (supports CORS)
    const res = await fetch('https://dev.to/api/articles?tag=ai&per_page=3');
    if (!res.ok) throw new Error('Network response not ok');
    const articles = await res.json();
    
    if (articles && articles.length >= 3) {
      let html = '';
      articles.slice(0, 3).forEach((art, index) => {
        const title = art.title || 'AI Industry Update';
        const description = art.description || 'Latest industry developments and learning vectors.';
        const tags = art.tag_list || ['AI'];
        const tagText = tags[0] ? tags[0].toUpperCase() : 'AI';
        const tagClass = index % 3 === 0 ? 'tag-blue' : index % 3 === 1 ? 'tag-purple' : 'tag-teal';

        html += `
          <div class="briefing-item">
            <div class="briefing-number">${index + 1}</div>
            <div class="briefing-body">
              <h3 class="briefing-item-title"><a href="${art.url}" target="_blank" style="color: inherit; text-decoration: none; border-bottom: 1px dotted var(--text-secondary); transition: all 0.2s;" onmouseover="this.style.color='var(--color-ai-text)';" onmouseout="this.style.color='inherit';">${title}</a></h3>
              <p class="briefing-item-desc">${description}</p>
              <span class="briefing-item-tag ${tagClass}">${tagText}</span>
            </div>
          </div>
        `;
        
        // Also inject this feed article dynamically into the live telemetry feed queue for rotation!
        const matchModules = ['ai-copilot', 'prompt-eng', 'wasm-web', 'database-systems', 'frontend-frameworks'];
        const randomModule = matchModules[Math.floor(Math.random() * matchModules.length)];
        TELEMETRY_SIGNALS.push({
          message: `📰 [LIVE FEED] ${title}`,
          moduleId: randomModule,
          trendPoint: `**Dev.to AI Feed (2026 Live Signals)**: ${description}`
        });
      });
      briefingContainer.innerHTML = html;
      setTimeout(() => addTelemetryLog("📰 Dynamic AI Briefing feed synchronized successfully from Dev.to.", "system"), 1500);
    }
  } catch (err) {
    console.warn('Could not load dynamic AI news feed, using offline defaults.', err);
    setTimeout(() => addTelemetryLog("⚠️ Live briefing sync offline. Displaying cached standard metrics.", "system"), 1500);
  }
}

function initTelemetryFeed() {
  setTimeout(() => addTelemetryLog("🛰️ System initialized. Connecting network channels...", "system"), 200);
  setTimeout(() => addTelemetryLog("📡 Linked to live global tech job market telemetry feed.", "system"), 1000);
  
  // Load dynamic briefings on init
  updateAICareerBriefing();
  
  setTimeout(() => triggerTelemetryTrendTick(), 2500);
  
  setInterval(() => {
    if (state.diagnosticsRunning) return;
    triggerTelemetryTrendTick();
  }, 12000);
}

window.runTelemetryDiagnostics = function() {
  if (state.diagnosticsRunning) return;
  state.diagnosticsRunning = true;
  synth.playTone(440, 'sine', 0.1);
  synth.playTone(660, 'sine', 0.1, 0.08);
  
  const btn = document.querySelector('.telemetry-btn-scan');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.innerHTML = `<i class="ti ti-loader" style="animation: spin 1s linear infinite; display: inline-block;"></i> Running...`;
  }
  
  addTelemetryLog("⚙️ INITIALIZING DIAGNOSTIC PROBE...", "system");
  
  setTimeout(() => {
    synth.playTone(523, 'triangle', 0.08);
    addTelemetryLog("📊 ANALYZING SKILL VECTOR CHANNELS...", "system");
  }, 800);
  
  setTimeout(() => {
    const totalPerTrack = { ai: 2, creator: 2, cognitive: 2, frontier: 2, tech: 8 };
    const completedPerTrack = { ai: 0, creator: 0, cognitive: 0, frontier: 0, tech: 0 };
    
    state.completedModules.forEach(id => {
      const module = getModuleById(id);
      if (module && completedPerTrack[module.track] !== undefined) {
        completedPerTrack[module.track]++;
      }
    });
    
    synth.playTone(587, 'triangle', 0.08);
    addTelemetryLog(`[VEC] AI:${completedPerTrack.ai}/${totalPerTrack.ai} CR:${completedPerTrack.creator}/${totalPerTrack.creator} COG:${completedPerTrack.cognitive}/${totalPerTrack.cognitive} FR:${completedPerTrack.frontier}/${totalPerTrack.frontier} TC:${completedPerTrack.tech}/${totalPerTrack.tech}`);
  }, 1600);
  
  setTimeout(() => {
    synth.playTone(659, 'triangle', 0.08);
    
    const activePath = state.activeCareer;
    if (!activePath) {
      addTelemetryLog("[SYS] NO TARGET CAREER TARGET LOCKED.", "error");
      addTelemetryLog("[SYS] Lock a Career Compass path on home to align calculations.", "system");
    } else {
      const data = CAREER_MAP[activePath];
      const recIds = data.recs;
      
      let completedRecCount = 0;
      recIds.forEach(id => {
        if (state.completedModules.has(id)) completedRecCount++;
      });
      
      const alignmentPct = Math.min(100, 40 + completedRecCount * 15);
      
      addTelemetryLog(`🎯 TARGET ACQUISITION: ${data.title.toUpperCase()}`);
      addTelemetryLog(`📊 COMPATIBILITY ALIGNMENT: ${alignmentPct}%`);
      
      const missingRecs = recIds.filter(id => !state.completedModules.has(id));
      if (missingRecs.length === 0) {
        addTelemetryLog("👑 [SYS] PROFILE OPTIMIZED. Target vectors match 100%!", "system");
      } else {
        const nextTargetId = missingRecs[0];
        const nextTarget = getModuleById(nextTargetId);
        addTelemetryLog(`💡 FOCUS METRIC: Complete '${nextTarget.tag}' next to bridge gap.`, "system");
      }
    }
  }, 2500);
  
  setTimeout(() => {
    synth.playSuccess();
    addTelemetryLog("✓ DIAGNOSTICS PROBE CONCLUDED.", "system");
    
    state.diagnosticsRunning = false;
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerHTML = `<i class="ti ti-terminal-2"></i> Diagnostics`;
    }
  }, 3300);
};

// Initialize Everything on load
window.addEventListener('DOMContentLoaded', () => {
  particles = new ParticleEngine();
  initRadarGrid();
  updateCareerMarketValue(true);
  initTelemetryFeed();
  
  renderStatsHUD();
  renderModulesGrid();
  initTiltEffect();
  renderConversation();
  
  document.body.removeAttribute('data-theme');
  
  // Backdrop click closing for modals
  document.getElementById('module-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'module-modal') closeModuleModal();
  });
  document.getElementById('tech-radar-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'tech-radar-modal') closeTechRadar();
  });
  document.getElementById('level-up-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'level-up-overlay') closeLevelUpCelebration();
  });

  // Escape key to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModuleModal();
      closeTechRadar();
      closeLevelUpCelebration();
      closeAITutor();
    }
  });
  
  document.body.addEventListener('click', () => {
    synth.init();
  }, { once: true });
});
