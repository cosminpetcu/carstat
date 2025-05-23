const brandsModels: Record<string, string[]> = {
  "Audi": ["100", "200", "80", "90", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "Cabriolet", "Coupé", "e-tron", "e-tron GT", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Quattro", "R8", "RS2", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q3", "RS Q8", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "SQ2", "SQ5", "SQ7", "SQ8", "TT", "TT RS", "TT S", "V8", "Altul"],
  "BMW": ["2002", "Seria 1", "Seria 2", "Seria 3", "Seria 4","Seria 5", "Seria 6", "Seria 7", "Seria 8", "X1", "X2", "X3", "X3 M", "X4", "X5", "X5 M", "X6", "X6 M", "X7", "XM", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3",  "M2", "M3", "M4", "M5", "M6", "M8", "Z1", "Z3", "Z3 M", "Z4", "Z4 M", "Z8", "Altul"],
  "Mercedes-Benz": ["190", "200", "220", "230", "240", "250", "260", "270", "280", "290", "300", "320", "350", "380", "400", "416", "420", "450", "500", "560", "600", "A", "GT", "AMG GT", "AMG GT-C", "AMG GT-R", "AMG GT-S", "B", "C", "C 160", "CE", "Citan", "CL", "CLA", "CLC", "CLE", "CLK", "T", "GLA", "CLS", "E", "EQA", "EQB", "EQC", "EQE", "EQS", "EQT", "EQV", "G", "GL", "GLA", "GLB", "GLC", "GLC Coupe", "GLE", "GLE Coupe", "GLK", "GLS", "GLS Maybach", "MB 100", "ML", "R", "S", "S Maybach", "SL", "SLC", "SLK", "SLR", "SLS", "Sprinter", "V", "T", "Vaneo", "Vario", "Viano", "Vito", "X", "Altul"],
  "Opel": ["Adam", "Agila", "Ampera", "Antara", "Arena", "Ascona", "Astra", "Calibra", "Campo", "Cascada", "Cavalier", "Combo",  "Combo Life", "Commodore", "Corsa", "Crossland X", "Diplomat", "Frontera", "Grandland X", "GT", "Insignia", "Insignia CT", "Kadett", "Karl", "Manta", "Meriva", "Mokka", "Mokka X", "Monterey", "Monza", "Movano", "Nova", "Omega", "Pick Up Sportscap", "Rekord", "Senator", "Signum", "Sintra", "Speedster", "Tigra", "Vectra", "Vivaro", "Zafira", "Zafira Life", "Zafira Tourer", "Altul"],
  "Skoda": ["100", "105", "120", "130", "135", "Citigo", "Elroq", "Enyaq", "Fabia", "Favorit", "Felicia", "Forman", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Pick-up", "Praktik", "Rapid", "Roomster", "Scala", "Superb", "Yeti", "Altul"],
  "Volkswagen": ["181", "Amarok", "Arteon", "Beetle", "Bora", "Buggy", "Caddy", "Caddy Maxi", "CC", "Corrado", "Crafter", "Eos", "e-up!", "Fox", "Golf", "Golf Plus", "Golf Sportsvan", "ID.3", "ID.4", "ID.5", "ID.6", "ID.7", "ID. Buzz", "Iltis", "Jetta", "Käfer", "Karmann Ghia", "LT", "Lupo", "New Beetle", "Passat", "Passat Alltrack", "Passat CC", "Phaeton", "Polo", "Routan", "Santana", "Scirocco", "Sharan", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "Taigo", "Taro", "Tayron", "T-Cross", "Tiguan", "Touareg", "Touran", "T-Roc", "up!", "Vento", "XL1", "Altul"],
  "Abarth": ["124 Spider", "500", "500C", "595", "595C", "595 Competizione", "595 Turismo", "600e", "695", "695C", "Grande Punto", "Punto Evo", "Altul"],
  "AC": ["Altul"],
  "Acura": ["MDX", "NSX", "RL", "RSX", "TL", "TSX", "Altul"],
  "Aiways": ["U5", "Altul"],
  "Aixam": ["City", "Coupé", "Cross", "MinAuto", "Roadline", "Scouty R", "Altul"],
  "Alfa Romeo": ["4C", "8C", "Alfa 145", "Alfa 146", "Alfa 147", "Alfa 155", "Alfa 156", "Alfa 159", "Alfa 164", "Alfa 166", "Alfa 33", "Alfa 75", "Alfa 90", "Alfasud", "Alfetta", "Brera", "Crosswagon", "Giulia", "Giulietta", "GT", "GTV", "Junior", "MiTo", "Spider", "Sprint", "Stelvio", "Tonale", "Altul"],
  "ALPINA": ["B10", "B12", "B3", "B4", "B5", "B6", "B7", "B8", "D10", "D3", "D3 S", "D4", "D4 S", "D5", "Roadster S", "XB7", "XD3", "XD4", "Altul"],
  "Alpine": ["A110", "A290", "Altul"],
  "Alvis": ["Altul"],
  "Ariel": ["Atom", "Altul"],
  "Artega": ["GT", "Altul"],
  "Asia Motors": ["Rocsta", "Altul"],
  "Aston Martin": ["AR1", "Cygnet", "DB", "DB11", "DB12", "DB7", "DB9", "DBS", "DBX", "Lagonda", "Rapide", "V12 Vantage", "V8 Vantage", "Vanquish", "Virage", "Altul"],
  "Austin": ["Altul"],
  "Austin Healey": ["Altul"],
  "Auto Union": ["Altul"],
  "BAIC": ["Beijing X35", "Beijing X55", "Beijing X75", "BJ20", "BJ30", "BJ40", "BJ60", "Senova D20", "Senova X25", "Senova X35", "Senova X55", "Senova X65", "X55", "Altul"],
  "Barkas": ["B1000", "Altul"],
  "Bentley": ["Arnage", "Azure", "Bentayga", "Brooklands", "Continental", "Continental", "Continental Flying Spur", "Continental GT", "Continental GTC", "Continental Supersports", "Eight", "Flying Spur", "Mulsanne", "S2", "Turbo R", "Turbo RT", "Turbo S", "Altul"],
  "Bizzarrini": ["Altul"],
  "Borgward": ["Altul"],
  "Brilliance": ["BC3", "BS2", "BS4", "BS6", "Altul"],
  "Bugatti": ["Chiron", "EB 110", "Veyron", "Altul"],
  "Buick": ["Century", "Electra", "Enclave", "La Crosse", "Le Sabre", "Park Avenue", "Regal", "Riviera", "Roadmaster", "Skylark", "Altul"],
  "BYD": ["ATTO 2", "ATTO 3", "DOLPHIN", "ETP 3", "HAN", "SEAL", "SEALION 7", "Seal U", "TANG", "Altul"],
  "Cadillac": ["Allante", "ATS", "BLS", "CT5", "CT6", "CTS", "Deville", "Eldorado", "Escalade", "Fleetwood", "Seville", "SRX", "STS", "XLR", "XT4", "XT5", "XT6", "Altul"],
  "Casalini": ["Altul"],
  "Caterham": ["Altul"],
  "Cenntro": ["Altul"],
  "Chatenet": ["Altul"],
  "Chevrolet": ["2500", "Alero", "Astro", "Avalanche", "Aveo", "Beretta", "Blazer", "C1500", "Camaro", "Caprice", "Captiva", "Cavalier", "Chevelle", "Chevy Van", "Citation", "Colorado", "Corsica", "Cruze", "El Camino", "Epica", "Evanda", "Express", "G", "HHR", "Impala", "K1500", "K30", "Kalos", "Lacetti", "Lumina", "Malibu", "Matiz", "Niva", "Nubira", "Orlando", "Rezzo", "S-10", "Silverado", "Spark", "SSR", "Suburban", "Tahoe", "Trailblazer", "Trans Sport", "Traverse", "Trax", "Venture", "Volt", "Altul"],
  "Chrysler": ["200", "300C", "300 M", "Aspen", "Crossfire", "Daytona", "ES", "Grand Voyager", "GS", "GTS", "Imperial", "Le Baron", "Neon", "New Yorker", "Pacifica", "PT Cruiser", "Saratoga", "Sebring", "Stratus", "Valiant", "Viper", "Vision", "Voyager", "Altul"],
  "Citroën": ["2 CV", "AMI", "AX", "Berlingo", "BX", "C1", "C2", "C3", "C3 Aircross", "C3 Picasso", "C4", "C4 Aircross", "C4 Cactus", "C4 Picasso", "C4 SpaceTourer", "C4X", "C5", "C5 Aircross", "C5X", "C6", "C8", "C-Crosser", "C-Elysée", "CX", "C-Zero", "DS", "DS3", "DS4", "DS5", "GSA", "Jumper", "Jumpy", "Nemo", "SAXO", "SM", "SpaceTourer", "Visa", "Xantia", "XM", "Xsara", "Xsara Picasso", "ZX", "Altul"],
  "Cobra": ["Altul"],
  "Corvette": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "Z06", "ZR 1", "Altul"],
  "Cupra": ["Arona", "Ateca", "Born", "Formentor", "Ibiza", "Leon", "Tavascan", "Terramar", "Altul"],
  "Dacia": ["Bigster", "Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Logan Pick-Up", "Pick Up", "Sandero", "Spring", "Altul"],
  "Daewoo": ["Espero", "Evanda", "Kalos", "Korando", "Lacetti", "Lanos", "Leganza", "Matiz", "Musso", "Nexia", "Nubira", "Rezzo", "Tacuma", "Altul"],
  "Daihatsu": ["Applause", "Charade", "Charmant", "Copen", "Cuore", "Feroza/Sportrak", "Freeclimber", "Gran Move", "Hijet", "MATERIA", "Move", "Rocky/Fourtrak", "Sirion", "Terios", "TREVIS", "YRV", "Altul"],
  "Datsun": ["240Z", "Altul"],
  "Delahaye": ["Altul"],
  "DeLorean": ["DMC-12", "Altul"],
  "DeTomaso": ["Guarà", "Pantera", "Altul"],
  "DFSK": ["EC31", "EC35", "Fengon", "Fengon", "Fengon 5", "Fengon 500", "Fengon 580", "Fengon 600", "Fengon 7", "Fengon E5", "Forthing 4", "Forthing 5", "Forthing 9", "Glory", "K01", "Rich 6", "Seres 3", "Seres 5", "Altul"],
  "Dodge": ["Avenger", "Caliber", "Challenger", "Charger", "Coronet", "Dakota", "Dart", "Demon", "Durango", "Grand Caravan", "Hornet", "Journey", "Magnum", "Neon", "Nitro", "RAM", "Stealth", "Viper", "Altul"],
  "Donkervoort": ["D8", "S7", "S8", "Altul"],
  "DS Automobiles": ["DS3", "DS3 Crossback", "DS4", "DS4 Crossback", "DS5", "DS7 (Crossback)", "DS9", "Nº8", "Altul"],
  "e.GO": ["e.wave X", "Life", "Altul"],
  "Elaris": ["Altul"],
  "Estrima": ["Altul"],
  "Facel Vega": ["Altul"],
  "Ferrari": ["208", "246", "250", "275", "288", "296 GTB", "296 GTS", "308", "328", "330", "348", "360", "365", "400", "412", "456", "458", "488 GTB", "488 Pista", "488 Spider", "512", "550", "575", "599 GTB", "599 GTO", "599 SA Aperta", "612", "750", "812", "California", "Daytona", "Dino GT4", "Enzo Ferrari", "F12", "F355", "F40", "F430", "F50", "F8", "FF", "GTC4Lusso", "LaFerrari", "Mondial", "Monza", "Portofino", "Purosangue", "Roma", "SF90", "Superamerica", "Testarossa", "Altul"],
  "Fiat": ["124", "124 Spider", "126", "127", "130", "131", "500", "500C", "500L", "500S", "500X", "600", "600e", "Albea", "Barchetta", "Brava", "Bravo", "Cinquecento", "Coupe", "Croma", "Dino", "Doblo", "Ducato", "Fiorino", "Freemont", "Fullback", "Grande Panda", "Grande Punto", "Idea", "Linea", "Marea", "Marengo", "Multipla", "New Panda", "Palio", "Panda", "Punto", "Punto Evo", "Qubo", "Regata", "Ritmo", "Scudo", "Sedici", "Seicento", "Siena", "Spider Europa", "Stilo", "Strada", "Talento", "Tempra", "Tipo", "Topolino", "Ulysse", "Uno", "X 1/9", "Altul"],
  "Fisker": ["Karma", "Ocean", "Altul"],
  "Ford": ["Aerostar", "B-Max", "Bronco", "Bronco Sport", "Capri", "C-Max", "Cougar", "Courier", "Crown", "Econoline", "Econovan", "EcoSport", "Edge", "Escape", "Escort", "Excursion", "Expedition", "Explorer", "Express", "F100", "F150", "F250", "F350", "Fairlane", "Falcon", "Fiesta", "Flex", "Focus", "Fusion", "Galaxy", "Granada", "Grand C-Max", "Grand Tourneo", "GT", "Ka/Ka+", "Kuga", "Maverick", "Mercury", "Mondeo", "Mustang", "Mustang Mach-E", "Orion", "Probe", "Puma", "Puma Gen-E", "Ranger", "Raptor", "Scorpio", "Sierra", "S-Max", "Sportka", "Streetka", "Taunus", "Taurus", "Thunderbird", "Tourneo", "Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Connect", "Transit Courier", "Transit Custom", "Windstar", "Altul"],
  "GAC Gonow": ["Altul"],
  "Gemballa": ["Altul"],
  "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80", "Altul"],
  "GMC": ["Acadia", "Envoy", "Safari", "Savana", "Sierra", "Sonoma", "Syclone", "Terrain", "Typhoon", "Vandura", "Yukon", "Altul"],
  "Grecav": ["Sonique", "Altul"],
  "GWM": ["Ora 03", "Ora 07", "Wey 03", "Wey 05", "Altul"],
  "Hamann": ["Altul"],
  "Heinkel": ["Altul"],
  "Holden": ["Altul"],
  "Honda": ["Accord", "Aerodeck", "City", "Civic", "Clarity", "Concerto", "CR-V", "CRX", "CR-Z", "e", "e:Ny1", "Element", "FR-V", "HR-V", "Insight", "Integra", "Jazz", "Legend", "Logo", "NSX", "Odyssey", "Pilot", "Prelude", "Ridgeline", "S2000", "Shuttle", "Stream", "ZR-V", "Altul"],
  "Hongqi": ["E-HS9", "H9", "HS5", "Altul"],
  "Horch": ["Altul"],
  "Hummer": ["H1", "H2", "H3", "Altul"],
  "Hyundai": ["Accent", "Atos", "Azera", "BAYON", "Coupe", "Elantra", "Excel", "Galloper", "Genesis", "Getz", "Grandeur", "Grand Santa Fe", "H-1", "H 100", "H-1 Starex", "H 200", "H350", "i10", "i20", "i30", "i40", "INSTER", "IONIQ", "IONIQ 5", "IONIQ 6", "IONIQ 9", "ix20", "ix35", "ix55", "KONA", "KONA Elektro", "Lantra", "Matrix", "NEXO", "Pony", "SANTA FE", "Santamo", "S-Coupe", "SONATA", "STARIA", "Terracan", "Trajet", "TUCSON", "Veloster", "Veracruz", "XG 30", "XG 350", "Altul"],
  "INEOS": ["Grenadier", "Altul"],
  "Infiniti": ["EX30", "EX35", "EX37", "FX", "G35", "G37", "M30", "M35", "M37", "Q30", "Q45", "Q50", "Q60", "Q70", "QX30", "QX50", "QX56", "QX60", "QX70", "QX80", "Altul"],
  "Invicta": ["Altul"],
  "Isuzu": ["Campo", "D-Max", "Gemini", "Midi", "PICK UP", "Trooper", "Altul"],
  "Iveco": ["Massif", "Altul"],
  "JAC": ["8 Pro", "Altul"],
  "Jaguar": ["Daimler", "E-Pace", "E-Type", "F-Pace", "F-Type", "I-Pace", "MK II", "S-Type", "XE", "XF", "XJ", "XJ12", "XJ40", "XJ6", "XJ8", "XJR", "XJS", "XJSC", "XK", "XK8", "XKR", "X-Type", "Altul"],
  "Jeep": ["Avenger", "Cherokee", "CJ", "Comanche", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Patriot", "Renegade", "Wagoneer", "Willys", "Wrangler", "Altul"],
  "Jiayuan": ["City Spirit", "Altul"],
  "KGM": ["Actyon", "Torres EVX", "Altul"],
  "Kia": ["Besta", "Borrego", "Carens", "Carnival", "Ceed", "Cerato", "Clarus", "Elan", "EV3", "EV6", "EV9", "Joice", "K2500", "K2700", "Leo", "Magentis", "Mentor", "Mini", "Niro", "Niro EV", "Opirus", "Optima", "Picanto", "Pregio", "Pride", "ProCeed", "Retona", "Rio", "Roadster", "Rocsta", "Sephia", "Shuma", "Sorento", "Soul", "Sportage", "Stinger", "Stonic", "Venga", "XCeed", "Altul"],
  "Koenigsegg": ["Agera", "CCR", "CCXR", "Altul"],
  "KTM": ["X-BOW", "Altul"],
  "Lada": ["110", "111", "112", "1200", "2107", "2110", "2111", "2112", "Aleko", "Forma", "Granta", "Kalina", "Niva", "Nova", "Priora", "Samara", "Taiga", "Urban", "Vesta", "X-Ray", "Altul"],
  "Lamborghini": ["Aventador", "Countach", "Diablo", "Espada", "Gallardo", "Huracán", "Jalpa", "LM", "Miura", "Murciélago", "Revuelto", "Urraco", "Urus", "Altul"],
  "Lancia": ["Beta", "Dedra", "Delta", "Flaminia", "Flavia", "Fulvia", "Gamma", "Kappa", "Lybra", "MUSA", "Phedra", "Prisma", "Stratos", "Thema", "Thesis", "Voyager", "Ypsilon", "Zeta", "Altul"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar", "Serie I", "Serie II", "Serie III", "Altul"],
  "Landwind": ["CV-9", "S", "SC2", "SC4", "Altul"],
  "Leapmotor": ["C10", "T03", "Altul"],
  "LEVC": ["Altul"],
  "Lexus": ["CT", "Seria ES","Seria GS", "GS F", "Seria GX", "Seria IS", "IS-F", "LBX", "LC 500", "LC 500h", "LFA", "LM", "Seria LS", "Seria LX", "Seria NX", "Seria RC", "Seria RX", "RZ", "SC 400", "SC 430", "UX", "Altul"],
  "Ligier": ["Ambra", "Be Sun", "JS 50", "JS 50 L", "JS 60", "JS RC", "Myli", "Nova", "Optima", "X - Too", "Altul"],
  "Lincoln": ["Aviator", "Continental", "LS", "Mark", "Navigator", "Town Car", "Altul"],
  "Lotus": ["340 R", "Cortina", "Elan", "Eletre", "Elise", "Elite", "Emeya", "Emira", "Esprit", "Europa", "Evora", "Excel", "Exige", "Super Seven", "Altul"],
  "Lucid": ["Air", "Altul"],
  "Lynk&Co": ["01", "02", "08", "Altul"],
  "Mahindra": ["Altul"],
  "MAN": ["TGE", "Altul"],
  "Maserati": ["222", "224", "228", "3200", "418", "420", "4200", "422", "424", "430", "Biturbo", "Ghibli", "GranCabrio", "Gransport", "Granturismo", "Grecale", "Indy", "Karif", "Levante", "MC12", "MC20", "Merak", "Quattroporte", "Shamal", "Spyder", "Altul"],
  "Maxus": ["Deliver 9", "eDeliver 3", "eDeliver 9", "Euniq 5", "Euniq 6", "Mifa 9", "T90", "Altul"],
  "Maybach": ["57", "62", "Pullman", "S650", "Altul"],
  "Mazda": ["121", "2","3", "323", "5", "6", "626", "929", "Bongo", "Seria B", "BT-50", "CX-3", "CX-30", "CX-5", "CX-60", "CX-7", "CX-80", "CX-9", "Demio", "Seria E", "Millenia", "MPV", "MX-3", "MX-30", "MX-5", "MX-6", "Premacy", "Protege", "RX-6", "RX-7", "RX-8", "Tribute", "Xedos", "Altul"],
  "McLaren": ["540C", "570GT", "570S", "600LT", "620R", "650S", "650S Coupé", "650S Spider", "675LT", "675LT Spider", "720S", "750S", "765", "765LT", "Artura", "Elva", "GT", "MP4-12C", "P1", "Senna GTR", "Speedtail", "Altul"],
  "Messerschmitt": ["Altul"],
  "MG": ["Cyberster", "EHS", "HS", "Marvel R", "MG3", "MG4", "MG5", "MGA", "MGB", "MGF", "Midget", "Montego", "TD", "TF", "ZR", "ZS", "ZT", "Altul"],
  "Microcar": ["DUÈ", "Flex", "M.Go", "M-8", "MC1", "MC2", "Virgo", "Altul"],
  "Microlino": ["Competizione", "Dolce", "Pioneer", "Altul"],
  "Mini": ["MINI", "1000", "1300", "Cooper", "Cooper C", "Cooper D", "Cooper E", "Cooper S", "Cooper SD", "Cooper SE", "John Cooper Works", "ONE", "One D", "Paceman", "Clubvan", "Cabrio Serie", "Cooper Cabrio", "Altul"],
  "Mitsubishi": ["3000 GT", "ASX", "Canter", "Carisma", "Colt", "Cordia", "Cosmos", "Diamante", "Eclipse", "Eclipse Cross", "Galant", "Galloper", "Grandis", "i-MiEV", "L200", "L300", "L400", "Lancer", "Mirage", "Montero", "Outlander", "Pajero", "Pajero Pinin", "Pick-up", "Plug-in Hybrid Outlander", "Santamo", "Sapporo", "Sigma", "Space Gear", "Space Runner", "Space Star", "Space Wagon", "Starion", "Tredia", "Altul"],
  "Morgan": ["3 Wheeler", "4/4", "Aero 8", "Plus 4", "Plus 6", "Plus 8", "Roadster", "Altul"],
  "NIO": ["EL6", "EL7", "EL8", "ET5", "ET7", "Altul"],
  "Nissan": ["100 NX", "200 SX", "240 SX", "280 ZX", "300 ZX", "350Z", "370Z", "Almera", "Almera Tino", "Altima", "Ariya", "Armada", "Bluebird", "Cabstar", "Cargo", "Cherry", "Cube", "e-NV200", "Evalia", "Frontier", "GT-R", "Interstar", "Juke", "King Cab", "Kubistar", "Laurel", "Leaf", "Maxima", "Micra", "Murano", "Navara", "Note", "NP 300", "NV200", "NV250", "NV300", "NV400", "Pathfinder", "Patrol", "PickUp", "Pixo", "Prairie", "Primastar", "Primera", "Pulsar", "Qashqai", "Qashqai+2", "Quest", "Sentra", "Serena", "Silvia", "Skyline", "Sunny", "Terrano", "Tiida", "Titan", "Townstar", "Trade", "Urvan", "Vanette", "X-Trail", "Altul"],
  "NSU": ["Altul"],
  "Oldsmobile": ["Bravada", "Custom Cruiser", "Cutlass", "Delta 88", "Silhouette", "Supreme", "Toronado", "Altul"],
  "ORA": ["Funky Cat", "Altul"],
  "Packard": ["Altul"],
  "Pagani": ["Huayra", "Zonda", "Altul"],
  "Peugeot": ["1007", "104", "106", "107", "108", "2008", "204", "205", "206", "207", "208", "3008", "301", "304", "305", "306", "307", "308", "309", "4007", "4008", "404", "405", "406", "407", "408", "5008", "504", "505", "508", "604", "605", "607", "806", "807", "Bipper", "Bipper Tepee", "Boxer", "e-208", "e-Rifter", "e-Traveller", "Expert", "Expert Tepee", "iOn", "J5", "Partner", "Partner Tepee", "RCZ", "Rifter", "TePee", "Traveller", "Altul"],
  "Piaggio": ["APE", "APE TM", "Porter", "Altul"],
  "Plymouth": ["Prowler", "Altul"],
  "Polestar": ["1", "2", "3", "4", "Altul"],
  "Pontiac": ["6000", "Bonneville", "Fiero", "Firebird", "G6", "Grand-Am", "Grand-Prix", "GTO", "Montana", "Solstice", "Sunbird", "Sunfire", "Targa", "Trans Am", "Trans Sport", "Vibe", "Altul"],
  "Porsche": ["356", "Seria 911", "911 Urmodell", "930", "964", "991", "992", "993", "996", "997", "912", "914", "918", "924", "928", "944", "959", "962", "968", "Boxster", "Carrera GT", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan", "Altul"],
  "Proton": ["300 Serie", "400 Serie", "Altul"],
  "Renault": ["Alaskan", "Alpine A110", "Alpine A310", "Alpine V6", "Arkana", "Austral", "Avantime", "Captur", "Clio", "Coupe", "Espace", "Express", "Fluence", "Fuego", "Grand Espace", "Grand Kangoo", "Grand Kangoo E-TECH", "Grand Modus", "Grand Scenic", "Kadjar", "Kangoo", "Kangoo E-TECH", "Koleos", "Laguna", "Latitude", "Mascott", "Master", "Megane", "Modus", "P 1400", "11", "14", "18", "19", "20", "21", "25", "30", "4", "5", "6", "9", "Rafale", "Rapid", "Safrane", "Scenic", "Spider", "Symbioz", "Talisman", "Trafic", "Twingo", "Twizy", "Vel Satis", "Wind", "ZOE", "Altul"],
  "Riley": ["Altul"],
  "Rolls-Royce": ["Corniche", "Cullinan", "Dawn", "Flying Spur", "Ghost", "Park Ward", "Phantom", "Silver Cloud", "Silver Dawn", "Silver Seraph", "Silver Shadow", "Silver Spirit", "Silver Spur", "Spectre", "Wraith", "Altul"],
  "Rover": ["100", "111", "114", "115", "200", "213", "214", "216", "218", "220", "25", "400", "414", "416", "418", "420", "45", "600", "618", "620", "623", "75", "800", "820", "825", "827", "City Rover", "Metro", "Montego", "SD", "Streetwise", "Altul"],
  "Ruf": ["Altul"],
  "Saab": ["90", "900", "9000", "9-3", "9-4X", "9-5", "96", "9-7X", "99", "Altul"],
  "Santana": ["Altul"],
  "Seat": ["Alhambra", "Altea", "Arona", "Arosa", "Ateca", "Cordoba", "Exeo", "Ibiza", "Inca", "Leon", "Malaga", "Marbella", "Mii", "Tarraco", "Terra", "Toledo", "Altul"],
  "Seres": ["3", "5", "Altul"],
  "Silence": ["S04", "Altul"],
  "Simca": ["Altul"],
  "Smart": ["#1", "#3", "Crossblade", "ForFour", "ForTwo", "Roadster", "Altul"],
  "speedART": ["Altul"],
  "Spyker": ["C8", "C8 AILERON", "C8 DOUBLE 12 S", "C8 LAVIOLETTE SWB", "C8 SPYDER SWB", "Altul"],
  "Ssangyong": ["Actyon", "Family", "Korando", "Kyron", "MUSSO", "REXTON", "Rodius", "Tivoli", "Torres", "XLV", "Altul"],
  "Studebaker": ["Altul"],
  "Subaru": ["B9 Tribeca", "Baja", "BRZ", "Crosstrek", "Forester", "Impreza", "Justy", "Legacy", "Levorg", "Libero", "Outback", "Solterra", "SVX", "Trezia", "Tribeca", "Vivio", "WRX STI", "XT", "XV", "Altul"],
  "Suzuki": ["(SX4) S-Cross", "Across", "Alto", "Baleno", "Cappuccino", "Carry", "Celerio", "Grand Vitara", "Ignis", "iK-2", "Jimny", "Kizashi", "Liana", "LJ", "SJ Samurai", "Splash", "Super-Carry", "Swace", "Swift", "SX4", "Vitara", "Wagon R+", "X-90", "Altul"],
  "SWM": ["G01", "G03", "G05", "Altul"],
  "Talbot": ["Horizon", "Samba", "Altul"],
  "Tata": ["Indica", "Indigo", "Nano", "Safari", "Sumo", "Telcoline", "Telcosport", "Xenon", "Altul"],
  "TECHART": ["Altul"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Roadster", "Altul"],
  "Toyota": ["4-Runner", "Alphard", "Auris", "Auris Touring Sports", "Avalon", "Avensis", "Avensis Verso", "Aygo (X)", "bZ4X", "Camry", "Carina", "Celica", "C-HR", "Corolla", "Corolla Cross", "Corolla Verso", "Cressida", "Crown", "Dyna", "FCV", "FJ", "Fortuner", "GR86", "GT86", "Hiace", "Highlander", "Hilux", "IQ", "Land Cruiser", "Lite-Ace", "Matrix", "Mirai", "MR 2", "Paseo", "Picnic", "Previa", "Prius", "Prius+", "Proace (Verso)", "Proace City", "Proace Max", "Proace Verso Electric", "RAV 4", "Sequoia", "Sienna", "Starlet", "Supra", "Tacoma", "Tercel", "Tundra", "Urban Cruiser", "Verso", "Verso-S", "Yaris", "Yaris Cross", "Altul"],
  "Trabant": ["601", "Altul"],
  "Triumph": ["Dolomite", "Moss", "Spitfire", "TR3", "TR4", "TR5", "TR6", "TR7", "TR8", "Altul"],
  "TVR": ["Chimaera", "Griffith", "Tuscan", "Altul"],
  "TYN-e": ["Altul"],
  "Vincent": ["Altul"],
  "VinFast": ["VF6", "VF7", "VF8", "VF9", "Altul"],
  "Volvo": ["240", "244", "245", "262", "264", "340", "360", "440", "460", "480", "740", "744", "745", "760", "780", "850", "855", "940", "944", "945", "960", "965", "Amazon", "C30", "C40", "C70", "EC40", "ES90", "EX30", "EX40", "EX90", "Polar", "S40", "S60", "S60 Cross Country", "S70", "S80", "S90", "V40", "V40 Cross Country", "V50", "V60", "V60 Cross Country", "V70", "V90", "V90 Cross Country", "XC40", "XC60", "XC70", "XC90", "Altul"],
  "Wartburg": ["311", "353", "Altul"],
  "Westfield": ["Altul"],
  "WEY": ["Coffee 01", "Coffee 02", "Altul"],
  "Wiesmann": ["MF 25", "MF 28", "MF 3", "MF 30", "MF 35", "MF 4", "MF 5", "Altul"],
  "XEV": ["YOYO", "Altul"],
  "XPENG": ["G6", "G9", "P7", "Altul"],
  "Zeekr": ["Altul"],
  "Zhidou": ["Altul"],
  "Altul": ["Altul"],
};

export default brandsModels;