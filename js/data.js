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
      formFactor: 'miniPC',
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
      formFactor: 'AI Box',
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
      formFactor: 'AI Workstation',
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
      formFactor: 'Rack Server',
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
      question: "What's your most critical AI deployment concern?",
      subtext: 'This shapes how we configure your stack and where we focus the recommendation.',
      options: [
        { value: 'privacy',     label: 'Data Privacy & Sovereignty', sub: "We can't allow data to leave our perimeter" },
        { value: 'cost',        label: 'Cloud Cost & Dependency',    sub: 'Unpredictable bills and vendor lock-in' },
        { value: 'compliance',  label: 'Regulatory & Compliance',    sub: 'Strict sector rules on data residency or AI governance' },
        { value: 'integration', label: 'Legacy System Integration',  sub: 'AI must fit into existing infra and workflows' },
        { value: 'speed',       label: 'Speed to Production',        sub: 'We need results fast with limited IT resources' }
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
        'privacy':     'built for air-gapped, perimeter-locked deployments where no data ever leaves your infrastructure',
        'compliance':  'certified for environments with strict data residency and AI governance obligations',
        'cost':        'designed to eliminate cloud consumption costs with a predictable, one-time on-premise footprint',
        'integration': 'architected to integrate with your existing on-premise infrastructure and workflows without cloud dependencies',
        'speed':       'deployable out of the box, with pre-configured stacks that compress time-to-production significantly'
      }
    }
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
