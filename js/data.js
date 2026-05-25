/* =============================================================
   AISO v2 — Data Layer
   Single source of truth for wizard, recommendation engine,
   software catalog, and architecture L4 tile/modal.
   ============================================================= */

window.AISO_V2_DATA = {

  /* ----------------------------------------------------------
     TIERS — hardware form factors
     ---------------------------------------------------------- */
  tiers: [
    {
      id: 'personal',
      tier: 'Individual',
      formFactor: 'Compact AI Workstation',
      model: 'ECS Z11',
      platforms: ['Intel® Core™ Ultra 7 Processor 255H', 'Intel® Arc™ 140T GPU 16GB'],
      tagline: 'Sovereign AI on Your Own Machine',
      description: 'Your miniPC becomes a private AI workstation — fully offline, zero cloud dependency. Prototype with local LLMs, draft documents, transcribe audio, and translate content wherever you are.',
      audience: 'Solo professionals, individual developers, researchers, students',
      scenarios: ['Offline document drafting & translation', 'Speech-to-text & long-form analysis', 'Personal LLM prototyping'],
      unlockedDomains: [],
      growthPath: { nextTier: 'Studio', unlocks: 'Document Intelligence add-ons' }
    },
    {
      id: 'studio',
      tier: 'Studio',
      formFactor: 'Compact AI Hub',
      model: 'Altos GB10',
      platforms: ['NVIDIA GB10 Blackwell GPU', '128GB LPDDR5x Unified Memory'],
      tagline: "One Device. Your Whole Team's AI Hub.",
      description: 'A compact, always-on AI hub for small teams. Share models, build a private knowledge base, and validate prototypes — without touching the cloud.',
      audience: 'Small teams, design studios, startups, R&D labs',
      scenarios: ['Shared team AI assistant & knowledge base (RAG)', 'Code generation & prototype validation', 'Image generation for creative workflows'],
      unlockedDomains: ['doc'],
      growthPath: { nextTier: 'SME', unlocks: 'Workflow & Operations + Security & Risk add-ons' }
    },
    {
      id: 'sme',
      tier: 'Business',
      formFactor: 'Dedicated AI Workstation',
      platforms: ['NVIDIA RTX 6000 Ada', 'NVIDIA RTX PRO 6000 Max-Q Workstation Edition'],
      tagline: 'Enterprise-Grade AI at Workstation Scale',
      description: 'Workstation-class compute purpose-built for departmental AI. Fine-tune domain-specific models, automate business processes, and run complex inference — all on-premise.',
      audience: 'SMEs, departmental AI teams, R&D divisions',
      scenarios: ['Domain-specific model fine-tuning', 'Complex reasoning & departmental inference', 'Business process automation'],
      unlockedDomains: ['doc', 'workflow', 'security'],
      growthPath: { nextTier: 'Enterprise', unlocks: 'Industry Solutions add-ons + multi-tenant rack scale' }
    },
    {
      id: 'enterprise',
      tier: 'Enterprise',
      formFactor: 'Rack-Scale AI Server',
      platforms: [
        'nVidia A6000',
        'nVidia 6000ADA',
        'nVidia RTX Pro 6000 Server Edition',
        'nVidia HGX H200',
        'AMD Instinct MI300X'
      ],
      tagline: 'Rack-Scale Sovereign AI for Industry',
      description: 'Data-centre-grade sovereign AI for the largest deployments. High-concurrency inference, multi-GPU training, multi-tenant access, and full enterprise operations — entirely on-premise.',
      audience: 'Large enterprises, government, financial institutions, cloud providers',
      scenarios: ['High-concurrency AI services & enterprise-wide deployment', 'Core business operations & large-scale training', 'Full multi-tenant rack deployment'],
      unlockedDomains: ['doc', 'workflow', 'security', 'industry'],
      growthPath: null
    }
  ],

  /* ----------------------------------------------------------
     SOFTWARE CATALOG — 14 products
     2 bundled + 12 optional add-ons across 4 domains
     ---------------------------------------------------------- */
  softwareCatalog: [

    /* ---- BUNDLED (every tier) ---- */
    {
      id: 'orient-ai',
      name: 'Orient AI',
      vendor: 'TPIsoftware',
      domain: 'bundled',
      isBundled: true,
      minTier: 'personal',
      positioning: 'Unified multi-agent AI platform for sovereign on-premise deployment — your always-on team assistant.',
      keyFeatures: [
        'Multi-agent orchestration across departments',
        'On-premise RAG with private knowledge bases',
        'No-code workflow builder for AI automation'
      ],
      industries: ['All Industries'],
      logoSrc: 'https://aisoportal.com/images/software/orient-ai-logo.png',
      websiteUrl: 'https://orientai.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#orient-ai'
    },
    {
      id: 'otterscale',
      name: 'Otterscale',
      vendor: 'Phison',
      domain: 'bundled',
      isBundled: true,
      minTier: 'personal',
      positioning: 'Hardware-optimised AI inference engine that maximises throughput on Phison silicon.',
      keyFeatures: [
        'Direct NAND-to-model acceleration pipeline',
        'Adaptive resource allocation across GPU/CPU',
        'Real-time inference monitoring dashboard'
      ],
      industries: ['All Industries'],
      logoSrc: 'https://aisoportal.com/images/software/otterscale-logo.png',
      websiteUrl: 'https://www.phison.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#otterscale'
    },

    /* ---- DOCUMENT INTELLIGENCE (minTier: studio) ---- */
    {
      id: 'compdf-sdk',
      name: 'ComPDF SDK',
      vendor: 'KDAN',
      domain: 'doc',
      isBundled: false,
      minTier: 'studio',
      positioning: 'Enterprise PDF SDK with AI-powered extraction, annotation, and conversion capabilities.',
      keyFeatures: [
        'AI-assisted OCR and data extraction',
        'Cross-platform PDF rendering (iOS, Android, Web, Desktop)',
        'Batch document conversion and redaction APIs'
      ],
      industries: ['Finance', 'Legal', 'Healthcare', 'Government'],
      logoSrc: 'https://aisoportal.com/images/software/compdf-logo.png',
      websiteUrl: 'https://www.compdf.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#compdf-sdk'
    },
    {
      id: 'compdf-ai',
      name: 'ComPDF AI',
      vendor: 'KDAN',
      domain: 'doc',
      isBundled: false,
      minTier: 'studio',
      positioning: 'Conversational AI layer on top of your document repository — ask questions, get cited answers.',
      keyFeatures: [
        'Natural language Q&A over PDF libraries',
        'Source-cited responses with page references',
        'Multi-document cross-referencing'
      ],
      industries: ['Finance', 'Legal', 'Research', 'Education'],
      logoSrc: 'https://aisoportal.com/images/software/compdf-ai-logo.png',
      websiteUrl: 'https://www.compdf.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#compdf-ai'
    },
    {
      id: 'dottedsign',
      name: 'DottedSign',
      vendor: 'KDAN',
      domain: 'doc',
      isBundled: false,
      minTier: 'studio',
      positioning: 'AI-enhanced e-signature platform designed for enterprise contract lifecycle management.',
      keyFeatures: [
        'Smart signature routing and role-based signing workflows',
        'AI contract risk detection before signing',
        'Audit-trail compliance for regulated industries'
      ],
      industries: ['Finance', 'Legal', 'Real Estate', 'HR'],
      logoSrc: 'https://aisoportal.com/images/software/dottedsign-logo.png',
      websiteUrl: 'https://dottedsign.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#dottedsign'
    },

    /* ---- WORKFLOW & OPERATIONS (minTier: sme) ---- */
    {
      id: 'digiflexis',
      name: 'digiFlexis',
      vendor: 'TPIsoftware',
      domain: 'workflow',
      isBundled: false,
      minTier: 'sme',
      positioning: 'Low-code business process automation platform with AI decision nodes.',
      keyFeatures: [
        'Drag-and-drop process designer with AI step integration',
        'Rule engine for automated approvals and routing',
        'Real-time process analytics and SLA tracking'
      ],
      industries: ['Finance', 'Manufacturing', 'Retail', 'Government'],
      logoSrc: 'https://aisoportal.com/images/software/digiflexis-logo.png',
      websiteUrl: 'https://www.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#digiflexis'
    },
    {
      id: 'systalk-audit',
      name: 'SysTalk.Audit',
      vendor: 'TPIsoftware',
      domain: 'workflow',
      isBundled: false,
      minTier: 'sme',
      positioning: 'AI-powered internal audit assistant that accelerates evidence collection and report generation.',
      keyFeatures: [
        'Automated control testing across enterprise systems',
        'AI-generated audit findings and risk narratives',
        'Continuous monitoring with anomaly alerts'
      ],
      industries: ['Finance', 'Government', 'Healthcare', 'Manufacturing'],
      logoSrc: 'https://aisoportal.com/images/software/systalk-audit-logo.png',
      websiteUrl: 'https://www.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#systalk-audit'
    },
    {
      id: 'greenswift',
      name: 'GreenSwift',
      vendor: 'TPIsoftware',
      domain: 'workflow',
      isBundled: false,
      minTier: 'sme',
      positioning: 'ESG data management and AI reporting platform for carbon disclosure and sustainability compliance.',
      keyFeatures: [
        'Automated GHG scope 1/2/3 data collection',
        'AI-assisted ESG report generation (GRI, TCFD)',
        'Benchmark analytics against industry peers'
      ],
      industries: ['Manufacturing', 'Energy', 'Finance', 'Retail'],
      logoSrc: 'https://aisoportal.com/images/software/greenswift-logo.png',
      websiteUrl: 'https://www.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#greenswift'
    },

    /* ---- SECURITY & RISK (minTier: sme) ---- */
    {
      id: 'gadoscout',
      name: 'gadoScout',
      vendor: 'TPIsoftware',
      domain: 'security',
      isBundled: false,
      minTier: 'sme',
      positioning: 'AI threat intelligence platform that detects and correlates cyber risks across your infrastructure.',
      keyFeatures: [
        'Real-time threat detection with ML-based anomaly scoring',
        'Automated incident triage and response playbooks',
        'MITRE ATT&CK framework mapping'
      ],
      industries: ['Finance', 'Government', 'Telecom', 'Healthcare'],
      logoSrc: 'https://aisoportal.com/images/software/gadoscout-logo.png',
      websiteUrl: 'https://www.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#gadoscout'
    },
    {
      id: 'watchmen',
      name: 'Watchmen',
      vendor: 'Gogolook',
      domain: 'security',
      isBundled: false,
      minTier: 'sme',
      positioning: "Enterprise anti-fraud and scam intelligence platform powered by Asia's largest fraud database.",
      keyFeatures: [
        'Real-time fraud signal API for transaction screening',
        'AI-powered phishing and social engineering detection',
        'Cross-enterprise threat sharing network'
      ],
      industries: ['Finance', 'E-Commerce', 'Telecom', 'Government'],
      logoSrc: 'https://aisoportal.com/images/software/watchmen-logo.png',
      websiteUrl: 'https://gogolook.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#watchmen'
    },
    {
      id: 'fortvax',
      name: 'FortVax',
      vendor: 'Taiwan Numerical Powers',
      domain: 'security',
      isBundled: false,
      minTier: 'sme',
      positioning: 'Vulnerability assessment and patch intelligence platform purpose-built for OT/IT convergence.',
      keyFeatures: [
        'Asset discovery and CVE mapping for OT environments',
        'AI-prioritised patch recommendations',
        'Compliance reporting for IEC 62443 and NIST'
      ],
      industries: ['Manufacturing', 'Energy', 'Government', 'Healthcare'],
      logoSrc: 'https://aisoportal.com/images/software/fortvax-logo.png',
      websiteUrl: 'https://www.tnp.com.tw/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#fortvax'
    },

    /* ---- INDUSTRY SOLUTIONS (minTier: enterprise) ---- */
    {
      id: 'digicare',
      name: 'digiCare',
      vendor: 'TPIsoftware',
      domain: 'industry',
      isBundled: false,
      minTier: 'enterprise',
      positioning: 'AI clinical decision support and patient engagement platform for smart healthcare networks.',
      keyFeatures: [
        'AI-assisted diagnosis suggestions with explainability',
        'Patient journey orchestration across care settings',
        'HL7 FHIR-compliant data interoperability'
      ],
      industries: ['Healthcare'],
      logoSrc: 'https://aisoportal.com/images/software/digicare-logo.png',
      websiteUrl: 'https://www.tpisoftware.com/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#digicare'
    },
    {
      id: 'weba-engagement',
      name: 'WEBA Engagement Platform',
      vendor: 'WebA',
      domain: 'industry',
      isBundled: false,
      minTier: 'enterprise',
      positioning: 'Omnichannel AI customer engagement platform connecting enterprise CRM with conversational AI.',
      keyFeatures: [
        'Unified AI inbox across voice, chat, and social',
        'Real-time sentiment analysis and agent assist',
        'CRM-native integration with automated journey triggers'
      ],
      industries: ['Finance', 'Retail', 'Telecom', 'E-Commerce'],
      logoSrc: 'https://aisoportal.com/images/software/weba-logo.png',
      websiteUrl: 'https://www.weba.com.tw/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#weba-engagement'
    },
    {
      id: 'thinktron-remote',
      name: 'AI Cloud Service for Remote Sensing & IoT Early Warning',
      vendor: 'ThinkTron',
      domain: 'industry',
      isBundled: false,
      minTier: 'enterprise',
      positioning: 'Satellite imagery AI and IoT fusion platform for environmental monitoring and disaster early warning.',
      keyFeatures: [
        'Multi-source remote sensing data ingestion and fusion',
        'AI change detection for land use, flood, and fire events',
        'Real-time IoT sensor correlation with predictive alerts'
      ],
      industries: ['Government', 'Energy', 'Agriculture', 'Smart City'],
      logoSrc: 'https://aisoportal.com/images/software/thinktron-logo.png',
      websiteUrl: 'https://www.thinktron.com.tw/',
      videoUrl: '',
      detailUrl: 'https://aisoportal.com/software#thinktron-remote'
    }
  ],

  /* ----------------------------------------------------------
     WIZARD QUESTIONS (3 questions, displayed one per screen)
     ---------------------------------------------------------- */
  wizardQuestions: [
    {
      id: 'scale',
      screen: 1,
      question: 'Who is this for?',
      subtext: "We'll match the right hardware tier and software stack for your team size.",
      options: [
        { value: '1-10',   label: 'Individual',          sub: 'Just me — local AI on my own machine, fully offline' },
        { value: '11-50',  label: 'Small Team',           sub: '2 – 50 users, one shared on-premise AI hub' },
        { value: '51-200', label: 'Growing Organisation', sub: '51 – 200 users, departmental deployment' },
        { value: '200+',   label: 'Enterprise',           sub: '200+ users, data-centre scale' }
      ]
        },
    {
      id: 'goal',
      screen: 2,
      question: "What do you need AI to do first?",
      subtext: 'Pick your most urgent use case — this shapes your software stack.',
      layout: '3-2',
      options: [
        { value: 'assistant', label: 'Internal AI Assistant',      sub: 'Private team chatbot, knowledge base, internal Q&A' },
        { value: 'doc',       label: 'Document Processing',        sub: 'Contracts, reports, PDF intelligence' },
        { value: 'security',  label: 'Security & Risk',            sub: 'Threat detection, fraud, OT/IT compliance' },
        { value: 'workflow',  label: 'Workflow Automation',        sub: 'Business processes, audit, ESG reporting' },
        { value: 'industry',  label: 'Industry-Specific Use Case', sub: 'Clinical AI, smart city, retail intelligence' }
      ]
    },
    {
      id: 'pain',
      screen: 3,
      question: "What is your approximate deployment budget?",
      subtext: 'We use this to right-size the hardware tier and deployment scope for your organisation.',
      options: [
        { value: 'privacy',     label: 'Under TWD $1M',          sub: 'Compact workstation or personal AI node — individual to small team' },
        { value: 'cost',        label: 'TWD $1M – $5M',          sub: 'Dedicated workstation or departmental server — growing teams' },
        { value: 'compliance',  label: 'TWD $5M – $15M',         sub: 'Multi-GPU server or small rack cluster — enterprise division' },
        { value: 'integration', label: 'TWD $15M – $60M',        sub: 'Full rack-scale deployment — large enterprise or government' },
        { value: 'speed',       label: 'TWD $60M+',              sub: 'Data-centre-grade sovereign AI infrastructure at scale' }
      ]
    }
  ],

  /* ----------------------------------------------------------
     RECOMMENDATION ENGINE RULES
     ---------------------------------------------------------- */
  recommendationRules: {

    /* Scale answer → baseline tier */
    sizeToTier: {
      '1-10':   'personal',
      '11-50':  'studio',
      '51-200': 'sme',
      '200+':   'enterprise'
    },

    /* Tier ordering (index = weight; higher = more capable) */
    tierOrder: ['personal', 'studio', 'sme', 'enterprise'],

    /* Goal answer → software domain to recommend */
    goalToDomain: {
      'assistant': null,      // bundled Orient AI + Otterscale is sufficient
      'doc':       'doc',
      'workflow':  'workflow',
      'security':  'security',
      'industry':  'industry'
    },

    /* Domain → minimum tier required to unlock its add-ons.
       If resolved tier is below this, bump up one level. */
    domainMinTier: {
      'doc':      'studio',
      'workflow': 'sme',
      'security': 'sme',
      'industry': 'enterprise'
    },

    /*
      Industry → ranked add-on product IDs.
      Within the resolved domain, products listed here are surfaced first.
      Products not listed fall back to catalog order.
    */
    industryAddOnRank: {
      'finance':       ['compdf-ai', 'dottedsign', 'systalk-audit', 'watchmen', 'gadoscout', 'weba-engagement'],
      'healthcare':    ['digicare', 'compdf-sdk', 'gadoscout', 'fortvax'],
      'manufacturing': ['fortvax', 'greenswift', 'digiflexis', 'gadoscout', 'thinktron-remote'],
      'government':    ['gadoscout', 'watchmen', 'fortvax', 'thinktron-remote', 'systalk-audit'],
      'technology':    ['compdf-sdk', 'compdf-ai', 'digiflexis', 'gadoscout', 'systalk-audit'],
      'retail':        ['weba-engagement', 'watchmen', 'dottedsign', 'digiflexis']
    },

    /* Phrases used to build the "why this fits" sentence on the Result screen */
    fitReasons: {
      scale: {
        '1-10':   'sized for individual use on a portable AI workstation',
        '11-50':  'right for a small team sharing one on-premise AI hub',
        '51-200': 'scaled for departmental deployment across a growing organisation',
        '200+':   'built for enterprise-wide multi-tenant workloads at data-centre scale'
      },
      goal: {
        'assistant': 'with Orient AI as your always-on knowledge assistant',
        'doc':       'with Document Intelligence add-ons for PDF processing and e-signatures',
        'workflow':  'with Workflow & Operations add-ons for process automation and ESG',
        'security':  'with Security & Risk add-ons for threat detection and fraud prevention',
        'industry':  'with Industry Solutions add-ons tailored to your vertical'
      },
      pain: {
        'privacy':     'configured for a compact, cost-efficient entry into sovereign AI below TWD $1M',
        'cost':        'right-sized for a TWD $1M–$5M departmental deployment with maximum return on investment',
        'compliance':  'architected for a TWD $5M–$15M multi-GPU deployment at enterprise division scale',
        'integration': 'engineered for a TWD $15M–$60M full rack-scale deployment across your organisation',
        'speed':       'designed for a TWD $60M+ data-centre-grade sovereign AI infrastructure programme'
      }
    }
  },

  /* ----------------------------------------------------------
     SOLUTION NARRATIVES — result page copy keyed by scale+goal+pain
     Lookup: scale + '|' + goal + '|' + pain
     Falls back to goal-only, then scale-only, then 'default'
     ---------------------------------------------------------- */
  solutionNarratives: {

    /* Goal = assistant */
    'assistant|privacy':     { role: 'Entry-Level Sovereign AI — Compact Deployment', headline: 'Maximum impact. Minimum footprint. Under TWD $1M.', points: ['A fully private AI assistant owned outright — no recurring cloud costs ever', 'Compact workstation delivers full team knowledge access on a single node', 'The most cost-efficient path to sovereign AI with immediate productivity gains'], tags: ['Under $1M TWD', 'Single Node', 'Zero Cloud'] },
    'assistant|cost':        { role: 'Departmental AI Deployment at Scale', headline: 'Own your AI. Own your cost structure. Own your future.', points: ['Flat one-time investment eliminates per-seat, per-token, and SaaS renewal fees', 'TWD $1M–$5M buys a dedicated server that serves your team indefinitely', 'Full stack ownership — models, data, and deployment — with no vendor dependency'], tags: ['$1M–$5M TWD', 'Flat Cost', 'No Lock-in'] },
    'assistant|compliance':  { role: 'Enterprise AI Infrastructure at Division Scale', headline: 'Division-wide sovereign AI. Built to last.', points: ['Multi-GPU server handles concurrent inference for entire business divisions', 'TWD $5M–$15M delivers purpose-built infrastructure with no cloud dependency ever', 'Private knowledge base and model governance owned by your organisation permanently'], tags: ['$5M–$15M TWD', 'Multi-GPU', 'Division Scale'] },
    'assistant|integration': { role: 'Rack-Scale Sovereign AI for Large Organisations', headline: 'AI that commands your entire organisation. At scale.', points: ['Full rack-scale deployment serves thousands of concurrent users on-premise', 'TWD $15M–$60M investment funds infrastructure your organisation owns outright', 'Private RAG, multi-agent orchestration, and zero cloud middleware — at enterprise scale'], tags: ['$15M–$60M TWD', 'Rack-Scale', 'Enterprise-Wide'] },
    'assistant|speed':       { role: 'Data-Centre-Grade Sovereign AI Programme', headline: 'The definitive sovereign AI investment. Built for decades.', points: ['TWD $60M+ funds data-centre-grade AI infrastructure you own and operate permanently', 'Unlimited concurrent inference, training, and knowledge-base capacity at full scale', 'The foundation for your organisation\'s AI sovereignty for the next generation'], tags: ['$60M+ TWD', 'Data-Centre Grade', 'Permanent Ownership'] },

    /* Goal = doc */
    'doc|privacy':     { role: 'Entry-Level Document Intelligence — Compact Node', headline: 'Document intelligence with absolute confidentiality. Under TWD $1M.', points: ['Every contract, report, and filing processed entirely on your own compact hardware', 'No document content reaches a third-party OCR or AI service — ever', 'Maximum document privacy at the most accessible entry price point'], tags: ['Under $1M TWD', 'On-Premise OCR', 'No 3rd Party'] },
    'doc|cost':        { role: 'Departmental Document AI — Dedicated Workstation', headline: 'Unlimited document intelligence. One fixed investment.', points: ['Process every PDF and contract your department needs — no per-page charges', 'TWD $1M–$5M dedicated workstation replaces your document SaaS portfolio permanently', 'Predictable infrastructure spend with no variable cloud billing — ever'], tags: ['$1M–$5M TWD', 'Fixed Cost', 'No Per-Page Fee'] },
    'doc|compliance':  { role: 'Enterprise Document Intelligence — Multi-GPU Server', headline: 'Document AI built to the standard regulators demand.', points: ['Documents processed entirely within your jurisdiction — full data residency compliance', 'TWD $5M–$15M multi-GPU server handles high-volume regulated document workflows', 'E-signature and audit-trail integrity for the most demanding compliance environments'], tags: ['$5M–$15M TWD', 'Data Residency', 'Audit-Ready'] },
    'doc|integration': { role: 'Rack-Scale Document Processing — Enterprise Deployment', headline: 'Document AI at the scale your operations demand.', points: ['Full rack deployment processes organisation-wide document volumes on-premise', 'TWD $15M–$60M investment funds infrastructure integrated with your full DMS landscape', 'Batch pipelines, cross-document intelligence, and e-signatures at enterprise throughput'], tags: ['$15M–$60M TWD', 'Rack-Scale', 'DMS-Native'] },
    'doc|speed':       { role: 'Data-Centre-Grade Document Intelligence Programme', headline: 'The sovereign document intelligence platform. Built for the long term.', points: ['TWD $60M+ funds the definitive document AI infrastructure for your organisation', 'Unlimited processing capacity across every business unit and jurisdiction you operate in', 'Owned outright — your data, your models, your infrastructure — permanently'], tags: ['$60M+ TWD', 'Data-Centre Grade', 'Unlimited Capacity'] },

    /* Goal = security */
    'security|privacy':     { role: 'Entry-Level Sovereign Security — Compact Node', headline: 'Sovereign threat detection. Your first on-premise security AI. Under TWD $1M.', points: ['Air-gapped threat detection on a compact node — no cloud telemetry dependencies', 'Full SIEM-compatible deployment within your perimeter at the most accessible price', 'The highest-value entry into on-premise security AI available today'], tags: ['Under $1M TWD', 'Air-Gapped', 'SIEM-Compatible'] },
    'security|cost':        { role: 'Departmental Security AI — Dedicated Workstation', headline: 'Full-spectrum threat intelligence. One sovereign platform.', points: ['TWD $1M–$5M replaces your fragmented cloud security subscriptions permanently', 'No per-event, per-alert, or per-seat charges — cost fixed at deployment', 'Threat detection and fraud intelligence owned and auditable by your team'], tags: ['$1M–$5M TWD', 'Flat Cost', 'No Per-Alert Fee'] },
    'security|compliance':  { role: 'Enterprise Security Infrastructure — Multi-GPU Server', headline: 'Security posture that satisfies your regulators and your adversaries.', points: ['TWD $5M–$15M multi-GPU server runs MITRE ATT&CK and IEC 62443 frameworks natively', 'Audit evidence and risk reporting generated automatically — fully on-premise', 'Full threat-detection coverage within your data sovereignty boundary'], tags: ['$5M–$15M TWD', 'MITRE ATT&CK', 'IEC 62443'] },
    'security|integration': { role: 'Rack-Scale Security Platform — Enterprise Deployment', headline: 'Unified threat intelligence across your entire estate.', points: ['Full rack deployment ingests signals from IT and OT networks simultaneously', 'TWD $15M–$60M funds organisation-wide threat coverage with zero cloud exposure', 'Integrates with your full SIEM, ticketing, and incident response landscape at scale'], tags: ['$15M–$60M TWD', 'IT/OT Fusion', 'SIEM-Native'] },
    'security|speed':       { role: 'Data-Centre-Grade Security Programme', headline: 'The sovereign security platform. Operational at national scale.', points: ['TWD $60M+ funds a data-centre-grade threat intelligence infrastructure you own outright', 'High-concurrency detection, response, and forensics across every asset in your estate', 'The definitive on-premise security investment for the largest organisations'], tags: ['$60M+ TWD', 'Data-Centre Grade', 'National Scale'] },

    /* Goal = workflow */
    'workflow|privacy':     { role: 'Entry-Level Workflow Automation — Compact Node', headline: 'AI-driven operations. Fully sovereign. Under TWD $1M.', points: ['Process automation and approval workflows running entirely on your own hardware', 'No workflow data, decisions, or audit logs reach any external cloud service', 'The most accessible entry into sovereign process AI — owned outright from day one'], tags: ['Under $1M TWD', 'Air-Gapped', 'Data Sovereignty'] },
    'workflow|cost':        { role: 'Departmental Workflow AI — Dedicated Workstation', headline: 'AI-powered operations on infrastructure you already own.', points: ['TWD $1M–$5M replaces manual approval chains and reporting overhead permanently', 'No per-process, per-user, or per-execution cloud charges — ever', 'One dedicated workstation handles multiple workflow domains indefinitely'], tags: ['$1M–$5M TWD', 'Flat Cost', 'No Per-Process Fee'] },
    'workflow|compliance':  { role: 'Enterprise Workflow Intelligence — Multi-GPU Server', headline: 'Automated compliance, built into every workflow.', points: ['TWD $5M–$15M multi-GPU server handles complex audit and ESG reporting at scale', 'Audit evidence collected automatically — satisfies internal and external regulators', 'GRI and TCFD reporting generated from your own data with no third-party exposure'], tags: ['$5M–$15M TWD', 'Audit Evidence', 'ESG Reporting'] },
    'workflow|integration': { role: 'Rack-Scale Process Automation — Enterprise Deployment', headline: 'Intelligent automation that commands your existing systems.', points: ['TWD $15M–$60M rack deployment connects to your full ERP, CRM, and data landscape', 'Organisation-wide workflow automation with zero cloud intermediaries', 'AI decision nodes operate natively within your existing architecture at enterprise throughput'], tags: ['$15M–$60M TWD', 'ERP-Native', 'No Middleware'] },
    'workflow|speed':       { role: 'Data-Centre-Grade Workflow Programme', headline: 'The sovereign operations platform. At the scale of your ambition.', points: ['TWD $60M+ funds the definitive intelligent process automation infrastructure', 'Unlimited process capacity across every business unit and regulatory domain you operate in', 'Owned, operated, and governed by your organisation — permanently'], tags: ['$60M+ TWD', 'Data-Centre Grade', 'Unlimited Capacity'] },

    /* Goal = industry */
    'industry|privacy':     { role: 'Entry-Level Vertical AI — Compact Node', headline: 'Vertical AI for your industry. Sovereign by design. Under TWD $1M.', points: ['Industry-specific AI running on your own compact hardware — no cloud exposure', 'Clinical, operational, or customer intelligence owned outright from day one', 'The most accessible entry into sovereign vertical AI available today'], tags: ['Under $1M TWD', 'Air-Gapped', 'Vertical AI'] },
    'industry|cost':        { role: 'Departmental Vertical AI — Dedicated Workstation', headline: 'One sovereign AI platform. Every vertical use case. Fixed cost.', points: ['TWD $1M–$5M replaces fragmented SaaS subscriptions with one integrated deployment', 'No per-seat, per-patient, or per-transaction billing — ever', 'One investment serves your full industry AI portfolio indefinitely'], tags: ['$1M–$5M TWD', 'Flat Cost', 'No Per-Transaction Fee'] },
    'industry|compliance':  { role: 'Enterprise Vertical Intelligence — Multi-GPU Server', headline: 'Industry AI that satisfies the regulators who answer to no one.', points: ['TWD $5M–$15M multi-GPU server supports HL7 FHIR, financial regulation, and sector frameworks natively', 'All processing, logging, and reporting within your certified infrastructure perimeter', 'Audit-ready from day one — no cloud data transfer or compliance gaps'], tags: ['$5M–$15M TWD', 'HL7 FHIR', 'Audit-Ready'] },
    'industry|integration': { role: 'Rack-Scale Vertical AI — Enterprise Deployment', headline: 'Sovereign AI woven into the fabric of your operations.', points: ['TWD $15M–$60M rack deployment integrates with your full operational system landscape', 'CRM-native, FHIR-compliant, and IoT-ready across your entire vertical', 'No cloud middleware or vendor-managed integration layers — at enterprise scale'], tags: ['$15M–$60M TWD', 'FHIR-Compliant', 'IoT-Ready'] },
    'industry|speed':       { role: 'Data-Centre-Grade Vertical AI Programme', headline: 'The sovereign platform for your industry. At national scale.', points: ['TWD $60M+ funds data-centre-grade vertical AI infrastructure you own outright', 'Unlimited capacity for clinical, industrial, or customer intelligence across your full estate', 'The definitive on-premise industry AI investment — built for the next decade'], tags: ['$60M+ TWD', 'Data-Centre Grade', 'National Scale'] },

    /* Fallback when budget not matched */
    'default': { role: 'Sovereign AI for Your Organisation', headline: 'Complete AI sovereignty. Deployed on your terms.', points: ['Runs entirely on your own infrastructure — zero cloud dependency', 'Pre-configured for your use case and operational from day one', 'You own the models, the data, and the deployment — permanently'], tags: ['On-Premise', 'Zero Cloud', 'Full Control'] }
  },

  /* ----------------------------------------------------------
     DOMAINS — for Architecture L4 tile grid
     ---------------------------------------------------------- */
  domains: [
    { id: 'doc',      label: 'Document Intelligence', color: '#3b82f6' },
    { id: 'workflow', label: 'Workflow & Operations',  color: '#10b981' },
    { id: 'security', label: 'Security & Risk',        color: '#ef4444' },
    { id: 'industry', label: 'Industry Solutions',     color: '#8b5cf6' }
  ]

};
