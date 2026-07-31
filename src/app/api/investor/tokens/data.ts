export const ASSETS_DB = [
  // --- REAL WORLD ASSETS (RWA) ---
  {
    id: 'tkn-rwa-nyc', symbol: 'NYCRE', name: '1500 Broadway NYC', category: 'RWA', type: 'Real Estate', price: '$ 520.00', change: '+1.25%', isGain: true,
    logo: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=100&h=100&fit=crop',
    info: 'per token · yield 6.5% p.a.', supplyPre: 'Remaining ', supplyHl: '4,500/10,000', supplyPost: ' tokens in this offering',
    issuer: 'Manhattan Asset Group', blockchain: 'Ethereum', underlying: 'Commercial Real Estate (NYC)', contractAddress: '0x12ab...90cd',
    legalDocument: 'https://frakta.io/docs/nycre-legal', whitepaper: 'https://frakta.io/docs/nycre-wp', prospectus: 'https://frakta.io/docs/nycre-pros',
    apy: '6.5% p.a.', yieldToken: 'USDC', totalSupply: '10,000', decimals: 0, investorType: 'Accredited Investors', legalJurisdiction: 'USA', factsheet: 'https://frakta.io/docs/nycre-fs',
    description: 'Fractional ownership of a prime commercial property located in Times Square, New York City.'
  },
  {
    id: 'tkn-rwa-mia', symbol: 'MIAM', name: 'Miami Marina Resort', category: 'RWA', type: 'Real Estate', price: '$ 250.00', change: '+2.10%', isGain: true,
    logo: 'https://images.unsplash.com/photo-1533222481259-ce20eda1e20b?w=100&h=100&fit=crop',
    info: 'per token · yield 8.0% p.a.', supplyPre: 'Remaining ', supplyHl: '12,000/50,000', supplyPost: ' tokens in this offering',
    issuer: 'Florida Coast Investments', blockchain: 'Polygon', underlying: 'Hospitality Real Estate', contractAddress: '0x88cc...11aa',
    legalDocument: 'https://frakta.io/docs/miam-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/miam-pros',
    apy: '8.0% p.a.', yieldToken: 'USDC', totalSupply: '50,000', decimals: 0, investorType: 'Accredited Investors', legalJurisdiction: 'USA', factsheet: 'https://frakta.io/docs/miam-fs',
    description: 'A tokenized stake in a luxury marina and resort complex located in Miami, Florida.'
  },
  {
    id: 'tkn-rwa-lon', symbol: 'LDNCW', name: 'Canary Wharf Tower', category: 'RWA', type: 'Real Estate', price: '$ 1,200.00', change: '-0.45%', isGain: false,
    logo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop',
    info: 'per token · yield 5.2% p.a.', supplyPre: 'Remaining ', supplyHl: '1,200/5,000', supplyPost: ' tokens in this offering',
    issuer: 'UK Property Partners', blockchain: 'Ethereum', underlying: 'Commercial Real Estate (London)', contractAddress: '0x55ff...22ee',
    legalDocument: 'https://frakta.io/docs/ldncw-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/ldncw-pros',
    apy: '5.2% p.a.', yieldToken: 'USDC', totalSupply: '5,000', decimals: 0, investorType: 'Institutional', legalJurisdiction: 'UK', factsheet: 'https://frakta.io/docs/ldncw-fs',
    description: 'High-yield commercial office building situated in the heart of London\'s financial district.'
  },
  {
    id: 'tkn-rwa-art', symbol: 'PICA', name: 'Picasso Masterpiece', category: 'RWA', type: 'Fine Art', price: '$ 100.00', change: '+5.00%', isGain: true,
    logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop',
    info: 'per token · capital appreciation', supplyPre: 'Remaining ', supplyHl: '50,000/100,000', supplyPost: ' tokens in this offering',
    issuer: 'Global Art Trust', blockchain: 'Ethereum', underlying: 'Physical Artwork', contractAddress: '0x99aa...bbcc',
    legalDocument: 'https://frakta.io/docs/pica-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/pica-pros',
    apy: '-', yieldToken: '-', totalSupply: '100,000', decimals: 0, investorType: 'Retail', legalJurisdiction: 'Switzerland', factsheet: 'https://frakta.io/docs/pica-fs',
    description: 'Fractionalized ownership of a verified physical masterpiece by Pablo Picasso stored in a secure Swiss vault.'
  },
  {
    id: 'tkn-rwa-wth', symbol: 'WXTH', name: 'Rolex Daytona Collection', category: 'RWA', type: 'Luxury Watches', price: '$ 50.00', change: '+0.80%', isGain: true,
    logo: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=100&h=100&fit=crop',
    info: 'per token · capital appreciation', supplyPre: 'Remaining ', supplyHl: '8,000/10,000', supplyPost: ' tokens in this offering',
    issuer: 'Luxury Vault Inc.', blockchain: 'Polygon', underlying: 'Physical Luxury Watches', contractAddress: '0x77dd...33ff',
    legalDocument: 'https://frakta.io/docs/wxth-legal', whitepaper: '-', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '10,000', decimals: 0, investorType: 'Retail', legalJurisdiction: 'Singapore', factsheet: 'https://frakta.io/docs/wxth-fs',
    description: 'A curated basket of 5 rare vintage Rolex Daytona watches vaulted in Singapore.'
  },

  // --- BONDS / FIXED INCOME ---
  {
    id: 'tkn-bnd-ust3m', symbol: 'UST3M', name: 'US Treasury Bill 3M', category: 'Bonds', type: 'Government Bond', price: '$ 98.75', change: '+0.12%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Seal_of_the_United_States_Department_of_the_Treasury.svg',
    info: 'per token · yield 5.1% p.a.', supplyPre: 'You own ', supplyHl: '0/1,000,000', supplyPost: ' of total supply',
    issuer: 'US Department of the Treasury (Tokenized by Frakta)', blockchain: 'Ethereum', underlying: 'US Treasury Bill (3 Months)', contractAddress: '0x11aa...bb22',
    legalDocument: 'https://frakta.io/docs/ust3m-legal', whitepaper: 'https://frakta.io/docs/ust3m-wp', prospectus: 'https://frakta.io/docs/ust3m-pros',
    apy: '5.1% p.a.', yieldToken: 'USDC', totalSupply: '1,000,000', decimals: 2, investorType: 'Retail & Institutional', legalJurisdiction: 'USA', factsheet: 'https://frakta.io/docs/ust3m-fs',
    description: 'Tokenized 3-month United States Treasury Bill providing low-risk fixed income.'
  },
  {
    id: 'tkn-bnd-ukg10', symbol: 'UKG10', name: 'UK Gilt 10Y', category: 'Bonds', type: 'Government Bond', price: '£ 105.20', change: '-0.30%', isGain: false,
    logo: 'https://flagcdn.com/gb.svg',
    info: 'per token · yield 4.2% p.a.', supplyPre: 'You own ', supplyHl: '0/500,000', supplyPost: ' of total supply',
    issuer: 'UK Debt Management Office (Tokenized)', blockchain: 'Ethereum', underlying: '10-Year UK Gilt', contractAddress: '0x22bb...cc33',
    legalDocument: 'https://frakta.io/docs/ukg10-legal', whitepaper: '-', prospectus: '-',
    apy: '4.2% p.a.', yieldToken: 'USDC', totalSupply: '500,000', decimals: 2, investorType: 'Retail & Institutional', legalJurisdiction: 'UK', factsheet: 'https://frakta.io/docs/ukg10-fs',
    description: 'Tokenized 10-year UK government bond offering stable medium-term yields.'
  },
  {
    id: 'tkn-bnd-aapl', symbol: 'AAPL-B', name: 'Apple Corporate Bond', category: 'Bonds', type: 'Corporate Bond', price: '$ 102.50', change: '+0.05%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    info: 'per token · yield 4.8% p.a.', supplyPre: 'You own ', supplyHl: '0/200,000', supplyPost: ' of total supply',
    issuer: 'Apple Inc. (Tokenized via SPV)', blockchain: 'Polygon', underlying: 'Apple Corporate Bond (2030)', contractAddress: '0x33cc...dd44',
    legalDocument: 'https://frakta.io/docs/aapl-b-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/aapl-b-pros',
    apy: '4.8% p.a.', yieldToken: 'USDC', totalSupply: '200,000', decimals: 2, investorType: 'Accredited Investors', legalJurisdiction: 'USA', factsheet: 'https://frakta.io/docs/aapl-b-fs',
    description: 'Investment-grade corporate bond issued by Apple Inc., tokenized for fractional access.'
  },
  {
    id: 'tkn-bnd-msft', symbol: 'MSFT-B', name: 'Microsoft Green Bond', category: 'Bonds', type: 'Corporate Bond', price: '$ 99.80', change: '+0.20%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    info: 'per token · yield 4.5% p.a.', supplyPre: 'Remaining ', supplyHl: '150,000/300,000', supplyPost: ' tokens in this offering',
    issuer: 'Microsoft Corp. (Tokenized via SPV)', blockchain: 'Polygon', underlying: 'Microsoft Green Bond (2032)', contractAddress: '0x44dd...ee55',
    legalDocument: 'https://frakta.io/docs/msft-b-legal', whitepaper: '-', prospectus: '-',
    apy: '4.5% p.a.', yieldToken: 'USDC', totalSupply: '300,000', decimals: 2, investorType: 'Accredited Investors', legalJurisdiction: 'USA', factsheet: 'https://frakta.io/docs/msft-b-fs',
    description: 'Tokenized exposure to Microsoft\'s green bonds supporting sustainability initiatives.'
  },
  {
    id: 'tkn-bnd-tsla', symbol: 'TSLA-B', name: 'Tesla High-Yield Bond', category: 'Bonds', type: 'Corporate Bond', price: '$ 108.00', change: '-1.10%', isGain: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
    info: 'per token · yield 6.8% p.a.', supplyPre: 'Remaining ', supplyHl: '25,000/100,000', supplyPost: ' tokens in this offering',
    issuer: 'Tesla Inc. (Tokenized via SPV)', blockchain: 'Ethereum', underlying: 'Tesla Corporate Debt', contractAddress: '0x55ee...ff66',
    legalDocument: 'https://frakta.io/docs/tsla-b-legal', whitepaper: '-', prospectus: '-',
    apy: '6.8% p.a.', yieldToken: 'USDC', totalSupply: '100,000', decimals: 2, investorType: 'Accredited Investors', legalJurisdiction: 'USA', factsheet: '-',
    description: 'Higher-yield corporate debt instrument from Tesla Inc. suitable for growth-focused portfolios.'
  },

  // --- STOCKS (TOKENIZED) ---
  {
    id: 'tkn-stk-aapl', symbol: 'AAPLon', name: 'Apple Inc.', category: 'Stock', type: 'Technology', price: '$ 185.30', change: '+1.45%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    info: 'per token · vol 24h $ 2.4 M', supplyPre: 'You own ', supplyHl: '0/1,000,000', supplyPost: ' of total supply',
    issuer: 'Frakta Equities', blockchain: 'Polygon', underlying: 'AAPL (Nasdaq)', contractAddress: '0x66ff...aa77',
    legalDocument: 'https://frakta.io/docs/aapl-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/aapl-pros',
    apy: '-', yieldToken: '-', totalSupply: '1,000,000', decimals: 4, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: 'https://frakta.io/docs/aapl-fs',
    description: 'Tokenized representation of Apple Inc. stock, backed 1:1 by real shares held in custody.'
  },
  {
    id: 'tkn-stk-tsla', symbol: 'TSLAon', name: 'Tesla Inc.', category: 'Stock', type: 'Automotive', price: '$ 210.50', change: '-2.30%', isGain: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
    info: 'per token · vol 24h $ 4.1 M', supplyPre: 'You own ', supplyHl: '0/500,000', supplyPost: ' of total supply',
    issuer: 'Frakta Equities', blockchain: 'Polygon', underlying: 'TSLA (Nasdaq)', contractAddress: '0x77aa...bb88',
    legalDocument: 'https://frakta.io/docs/tsla-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/tsla-pros',
    apy: '-', yieldToken: '-', totalSupply: '500,000', decimals: 4, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: 'https://frakta.io/docs/tsla-fs',
    description: 'Tokenized representation of Tesla Inc. stock, backed 1:1 by real shares held in custody.'
  },
  {
    id: 'tkn-stk-msft', symbol: 'MSFTon', name: 'Microsoft Corp.', category: 'Stock', type: 'Technology', price: '$ 415.20', change: '+0.80%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    info: 'per token · vol 24h $ 1.8 M', supplyPre: 'You own ', supplyHl: '0/800,000', supplyPost: ' of total supply',
    issuer: 'Frakta Equities', blockchain: 'Polygon', underlying: 'MSFT (Nasdaq)', contractAddress: '0x88bb...cc99',
    legalDocument: 'https://frakta.io/docs/msft-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/msft-pros',
    apy: '-', yieldToken: '-', totalSupply: '800,000', decimals: 4, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: 'https://frakta.io/docs/msft-fs',
    description: 'Tokenized representation of Microsoft Corp. stock, backed 1:1 by real shares held in custody.'
  },
  {
    id: 'tkn-stk-amzn', symbol: 'AMZNon', name: 'Amazon.com Inc.', category: 'Stock', type: 'Retail / Tech', price: '$ 175.40', change: '+1.10%', isGain: true,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    info: 'per token · vol 24h $ 3.2 M', supplyPre: 'You own ', supplyHl: '0/1,200,000', supplyPost: ' of total supply',
    issuer: 'Frakta Equities', blockchain: 'Polygon', underlying: 'AMZN (Nasdaq)', contractAddress: '0x99cc...dd00',
    legalDocument: 'https://frakta.io/docs/amzn-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/amzn-pros',
    apy: '-', yieldToken: '-', totalSupply: '1,200,000', decimals: 4, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: 'https://frakta.io/docs/amzn-fs',
    description: 'Tokenized representation of Amazon.com Inc. stock, backed 1:1 by real shares held in custody.'
  },
  {
    id: 'tkn-stk-goog', symbol: 'GOOGon', name: 'Alphabet Inc.', category: 'Stock', type: 'Technology', price: '$ 168.90', change: '-0.50%', isGain: false,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    info: 'per token · vol 24h $ 2.1 M', supplyPre: 'You own ', supplyHl: '0/900,000', supplyPost: ' of total supply',
    issuer: 'Frakta Equities', blockchain: 'Polygon', underlying: 'GOOGL (Nasdaq)', contractAddress: '0x00dd...ee11',
    legalDocument: 'https://frakta.io/docs/goog-legal', whitepaper: '-', prospectus: 'https://frakta.io/docs/goog-pros',
    apy: '-', yieldToken: '-', totalSupply: '900,000', decimals: 4, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: 'https://frakta.io/docs/goog-fs',
    description: 'Tokenized representation of Alphabet Inc. stock, backed 1:1 by real shares held in custody.'
  },

  // --- CRYPTO / UTILITY ---
  {
    id: 'tkn-cry-eth', symbol: 'ETH', name: 'Ethereum', category: 'Utility Token', type: 'Blockchain', price: '$ 3,250.00', change: '+4.20%', isGain: true,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032',
    info: 'per token · vol 24h $ 15 B', supplyPre: 'You own ', supplyHl: '0/120,000,000', supplyPost: ' of total supply',
    issuer: 'Ethereum Foundation', blockchain: 'Ethereum', underlying: '-', contractAddress: '-',
    legalDocument: '-', whitepaper: 'https://ethereum.org/whitepaper', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '120,000,000', decimals: 18, investorType: 'Retail', legalJurisdiction: 'Global', factsheet: '-',
    description: 'Native cryptocurrency of the Ethereum network, used for smart contracts and decentralized applications.'
  },
  {
    id: 'tkn-cry-matic', symbol: 'MATIC', name: 'Polygon', category: 'Utility Token', type: 'Blockchain', price: '$ 0.85', change: '-1.15%', isGain: false,
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=032',
    info: 'per token · vol 24h $ 450 M', supplyPre: 'You own ', supplyHl: '0/10,000,000,000', supplyPost: ' of total supply',
    issuer: 'Polygon Labs', blockchain: 'Polygon', underlying: '-', contractAddress: '0x7D1A...3344',
    legalDocument: '-', whitepaper: 'https://polygon.technology/whitepaper', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '10,000,000,000', decimals: 18, investorType: 'Retail', legalJurisdiction: 'Global', factsheet: '-',
    description: 'Native utility token of the Polygon network, an Ethereum scaling solution.'
  },
  {
    id: 'tkn-cry-sol', symbol: 'SOL', name: 'Solana', category: 'Utility Token', type: 'Blockchain', price: '$ 145.20', change: '+8.50%', isGain: true,
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032',
    info: 'per token · vol 24h $ 2.1 B', supplyPre: 'You own ', supplyHl: '0/500,000,000', supplyPost: ' of total supply',
    issuer: 'Solana Foundation', blockchain: 'Solana', underlying: '-', contractAddress: '-',
    legalDocument: '-', whitepaper: 'https://solana.com/whitepaper', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '500,000,000', decimals: 9, investorType: 'Retail', legalJurisdiction: 'Global', factsheet: '-',
    description: 'Native token of Solana, a high-performance blockchain supporting builders around the world.'
  },
  {
    id: 'tkn-cry-link', symbol: 'LINK', name: 'Chainlink', category: 'Utility Token', type: 'Oracle', price: '$ 14.80', change: '+2.10%', isGain: true,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=032',
    info: 'per token · vol 24h $ 320 M', supplyPre: 'You own ', supplyHl: '0/1,000,000,000', supplyPost: ' of total supply',
    issuer: 'Chainlink Labs', blockchain: 'Ethereum', underlying: '-', contractAddress: '0x5149...1122',
    legalDocument: '-', whitepaper: 'https://chain.link/whitepaper', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '1,000,000,000', decimals: 18, investorType: 'Retail', legalJurisdiction: 'Global', factsheet: '-',
    description: 'Decentralized oracle network connecting smart contracts to off-chain data.'
  },
  {
    id: 'tkn-cry-dot', symbol: 'DOT', name: 'Polkadot', category: 'Utility Token', type: 'Blockchain', price: '$ 6.50', change: '-3.20%', isGain: false,
    logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=032',
    info: 'per token · vol 24h $ 210 M', supplyPre: 'You own ', supplyHl: '0/1,300,000,000', supplyPost: ' of total supply',
    issuer: 'Web3 Foundation', blockchain: 'Polkadot', underlying: '-', contractAddress: '-',
    legalDocument: '-', whitepaper: 'https://polkadot.network/whitepaper', prospectus: '-',
    apy: '-', yieldToken: '-', totalSupply: '1,300,000,000', decimals: 10, investorType: 'Retail', legalJurisdiction: 'Global', factsheet: '-',
    description: 'Protocol that connects and secures a network of specialized blockchains.'
  },

  // --- STABLECOINS ---
  {
    id: 'tkn-stb-usdc', symbol: 'USDC', name: 'USD Coin', category: 'Stablecoin', type: 'Fiat-backed', price: '$ 1.00', change: '0.00%', isGain: true,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=032',
    info: 'per token · vol 24h $ 4.5 B', supplyPre: 'You own ', supplyHl: '0/32,000,000,000', supplyPost: ' of total supply',
    issuer: 'Circle', blockchain: 'Ethereum', underlying: 'US Dollar', contractAddress: '0xA0b8...eB48',
    legalDocument: 'https://circle.com/legal', whitepaper: 'https://circle.com/usdc-whitepaper', prospectus: '-',
    apy: '4.5% p.a.', yieldToken: 'USDC', totalSupply: '32,000,000,000', decimals: 6, investorType: 'Retail & Institutional', legalJurisdiction: 'USA', factsheet: '-',
    description: 'Digital dollar backed 100% by highly liquid cash and cash-equivalent assets.'
  },
  {
    id: 'tkn-stb-usdt', symbol: 'USDT', name: 'Tether USD', category: 'Stablecoin', type: 'Fiat-backed', price: '$ 1.00', change: '+0.01%', isGain: true,
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032',
    info: 'per token · vol 24h $ 45 B', supplyPre: 'You own ', supplyHl: '0/100,000,000,000', supplyPost: ' of total supply',
    issuer: 'Tether Limited', blockchain: 'Ethereum', underlying: 'US Dollar', contractAddress: '0xdAC1...1ec7',
    legalDocument: 'https://tether.to/legal', whitepaper: 'https://tether.to/whitepaper', prospectus: '-',
    apy: '3.8% p.a.', yieldToken: 'USDT', totalSupply: '100,000,000,000', decimals: 6, investorType: 'Retail & Institutional', legalJurisdiction: 'BVI', factsheet: '-',
    description: 'The most widely adopted stablecoin, pegged 1-to-1 with the US Dollar.'
  },
  {
    id: 'tkn-stb-dai', symbol: 'DAI', name: 'Dai Stablecoin', category: 'Stablecoin', type: 'Crypto-backed', price: '$ 1.00', change: '-0.02%', isGain: false,
    logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032',
    info: 'per token · vol 24h $ 350 M', supplyPre: 'You own ', supplyHl: '0/5,000,000,000', supplyPost: ' of total supply',
    issuer: 'MakerDAO', blockchain: 'Ethereum', underlying: 'Crypto Collateral', contractAddress: '0x6B17...1d0F',
    legalDocument: '-', whitepaper: 'https://makerdao.com/whitepaper', prospectus: '-',
    apy: '5.0% p.a.', yieldToken: 'DAI', totalSupply: '5,000,000,000', decimals: 18, investorType: 'Retail', legalJurisdiction: 'Decentralized', factsheet: '-',
    description: 'Decentralized, unbiased, collateral-backed cryptocurrency soft-pegged to the US Dollar.'
  },
  {
    id: 'tkn-stb-frax', symbol: 'FRAX', name: 'Frax', category: 'Stablecoin', type: 'Algorithmic', price: '$ 1.00', change: '+0.00%', isGain: true,
    logo: 'https://cryptologos.cc/logos/frax-frax-logo.svg?v=032',
    info: 'per token · vol 24h $ 120 M', supplyPre: 'You own ', supplyHl: '0/1,500,000,000', supplyPost: ' of total supply',
    issuer: 'Frax Finance', blockchain: 'Ethereum', underlying: 'Mixed Collateral', contractAddress: '0x853d...9092',
    legalDocument: '-', whitepaper: 'https://frax.finance/whitepaper', prospectus: '-',
    apy: '6.2% p.a.', yieldToken: 'FRAX', totalSupply: '1,500,000,000', decimals: 18, investorType: 'Retail', legalJurisdiction: 'Decentralized', factsheet: '-',
    description: 'Fractional-algorithmic stablecoin protocol that is partially backed by collateral and partially stabilized algorithmically.'
  },
  {
    id: 'tkn-stb-pyusd', symbol: 'PYUSD', name: 'PayPal USD', category: 'Stablecoin', type: 'Fiat-backed', price: '$ 1.00', change: '0.00%', isGain: true,
    logo: 'https://cryptologos.cc/logos/paypal-usd-pyusd-logo.svg?v=032',
    info: 'per token · vol 24h $ 80 M', supplyPre: 'You own ', supplyHl: '0/350,000,000', supplyPost: ' of total supply',
    issuer: 'Paxos Trust Company', blockchain: 'Ethereum', underlying: 'US Dollar', contractAddress: '0x6c3e...2954',
    legalDocument: 'https://paxos.com/pyusd-legal', whitepaper: '-', prospectus: '-',
    apy: '4.0% p.a.', yieldToken: 'PYUSD', totalSupply: '350,000,000', decimals: 6, investorType: 'Retail & Institutional', legalJurisdiction: 'USA', factsheet: '-',
    description: 'PayPal USD is a stablecoin fully backed by US dollar deposits, short-term US treasuries and similar cash equivalents.'
  }
]

export const TOP_GAINERS = [
  { id: 'tkn-rwa-mia', symbol: 'MIAM', name: 'Miami Marina Resort', price: 250.00, change: 8.10, logo: 'https://images.unsplash.com/photo-1533222481259-ce20eda1e20b?w=100&h=100&fit=crop' },
  { id: 'tkn-cry-sol', symbol: 'SOL', name: 'Solana', price: 145.20, change: 8.50, logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032' },
  { id: 'tkn-rwa-art', symbol: 'PICA', name: 'Picasso Masterpiece', price: 100.00, change: 5.00, logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop' },
]

export const TRENDING = [
  { id: 'tkn-stk-aapl', symbol: 'AAPLon', name: 'Apple Inc.', price: 185.30, vol: '$2.4M', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'tkn-cry-eth', symbol: 'ETH', name: 'Ethereum', price: 3250.00, vol: '$15B', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032' },
  { id: 'tkn-stb-usdc', symbol: 'USDC', name: 'USD Coin', price: 1.00, vol: '$4.5B', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=032' },
]

export const NEWLY_ADDED = [
  { id: 'tkn-bnd-ukg10', symbol: 'UKG10', name: 'UK Gilt 10Y', price: 105.20, desc: 'Government Bond', logo: 'https://flagcdn.com/gb.svg' },
  { id: 'tkn-rwa-lon', symbol: 'LDNCW', name: 'Canary Wharf Tower', price: 1200.00, desc: 'Real Estate', logo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=100&h=100&fit=crop' },
  { id: 'tkn-bnd-msft', symbol: 'MSFT-B', name: 'Microsoft Green Bond', price: 99.80, desc: 'Corporate Bond', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
]
