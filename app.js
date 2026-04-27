const oecd = window.OECD_DATA || {};

const FUNDER_ACCOUNT = {
  name: "Gates Foundation",
  initials: "GF",
  focus: ["Health", "Education", "Agriculture", "Climate"],
  description: "Global Health · Education · Agricultural Development",
};

const projects = [
  {
    id: "offline-learning-ghana",
    title: "Offline-first learning app for rural schools",
    country: "Ghana",
    region: "West Africa",
    sector: "Education",
    subsector: "Digital learning / rural education",
    beneficiaries: "Rural students",
    stage: "Prototype",
    fundingNeed: "$10,000",
    readiness: "Pilot-oriented prototype",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium-High",
    verification: "Self-reported",
    builderId: "ama-boateng",
    builderName: "Ama Boateng",
    builderRole: "Student builder",
    builderLocation: "Ghana",
    description:
      "A young builder in Ghana is building an offline-first learning app for rural schools where students have limited internet access.",
  },
  {
    id: "maternal-health-india",
    title: "Digital maternal health triage tool",
    country: "India",
    region: "South Asia",
    sector: "Health",
    subsector: "Maternal health / digital health",
    beneficiaries: "Rural clinics and pregnant women",
    stage: "Pilot-ready",
    fundingNeed: "$25,000",
    readiness: "Pilot-ready",
    readinessFilter: "Pilot-ready",
    opportunityGap: "High",
    verification: "Self-reported",
    builderId: "aanya-rao-team",
    builderName: "Aanya Rao and student team",
    builderRole: "Student-led health team",
    builderLocation: "India",
    description:
      "A student-led team is building a digital triage tool to help rural clinics identify maternal health risks earlier.",
  },
  {
    id: "sms-climate-kenya",
    title: "SMS climate alert system for smallholder farmers",
    country: "Kenya",
    region: "East Africa",
    sector: "Climate / Agriculture",
    subsector: "Climate adaptation / farmer advisory",
    beneficiaries: "Smallholder farmers",
    stage: "Prototype",
    fundingNeed: "$15,000",
    readiness: "Early pilot",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium",
    verification: "Self-reported",
    builderId: "otieno-climate-lab",
    builderName: "Otieno Climate Lab",
    builderRole: "Young builder team",
    builderLocation: "Kenya",
    description:
      "A young team is building an SMS alert system that sends localized climate and crop-risk information to smallholder farmers.",
  },
  {
    id: "water-quality-nigeria",
    title: "Community water quality reporting tool",
    country: "Nigeria",
    region: "West Africa",
    sector: "Civic Tech / Health",
    subsector: "Water safety",
    beneficiaries: "Low-income communities",
    stage: "Idea",
    fundingNeed: "$8,000",
    readiness: "Early-stage",
    readinessFilter: "Early-stage",
    opportunityGap: "Medium",
    verification: "Self-reported",
    builderId: "zainab-youth-water",
    builderName: "Zainab Youth Water Group",
    builderRole: "Grassroots youth team",
    builderLocation: "Nigeria",
    description:
      "A local youth team wants to build a mobile reporting system for community water quality issues.",
  },
  {
    id: "telemedicine-indonesia",
    title: "Low-cost telemedicine access kiosk",
    country: "Indonesia",
    region: "Southeast Asia",
    sector: "Health",
    subsector: "Rural healthcare access",
    beneficiaries: "Rural patients",
    stage: "Prototype",
    fundingNeed: "$18,000",
    readiness: "Pilot-oriented prototype",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium-High",
    verification: "Self-reported",
    builderId: "raka-pratama",
    builderName: "Raka Pratama",
    builderRole: "Young founder",
    builderLocation: "Indonesia",
    description:
      "A young founder is prototyping a low-cost telemedicine kiosk for rural areas with limited clinic access.",
  },
];

const generatedProjectThemes = [
  ["Solar study hubs for exam prep", "Education", "Digital learning / school access", "Secondary school students", "Prototype"],
  ["Mobile clinic queue coordination tool", "Health", "Primary care access", "Rural patients", "Pilot-ready"],
  ["Low-cost drip irrigation sensor kit", "Agriculture", "Smallholder productivity", "Smallholder farmers", "Prototype"],
  ["Flood reporting map for informal settlements", "Civic Tech", "Disaster response / mapping", "Low-income communities", "Active users"],
  ["Girls coding club learning tracker", "Education", "STEM education / youth skills", "Girls in public schools", "Pilot-ready"],
  ["Community medicine stockout alert", "Health", "Clinic supply chain", "Rural clinics", "Prototype"],
  ["Clean cooking repair network", "Climate", "Clean energy / household resilience", "Women-led households", "Idea"],
  ["Market price voice bot for farmers", "Agriculture", "Farmer advisory / market access", "Smallholder farmers", "Prototype"],
  ["Youth civic issue reporting hotline", "Civic Tech", "Community accountability", "Youth organizers", "Active users"],
  ["Offline teacher resource library", "Education", "Teacher training / offline content", "Rural teachers", "Prototype"],
  ["Maternal appointment reminder system", "Health", "Maternal health / SMS reminders", "Pregnant women", "Pilot-ready"],
  ["Rainwater harvesting maintenance app", "Climate", "Water resilience / adaptation", "Peri-urban households", "Prototype"],
  ["Seed exchange coordination platform", "Agriculture", "Local seed systems", "Farmer cooperatives", "Idea"],
  ["Public library tutoring scheduler", "Education", "Tutoring access / public learning spaces", "Public school students", "Prototype"],
  ["Air quality sensor youth network", "Climate", "Air quality / citizen science", "Urban youth", "Active users"],
  ["Water point repair reporting tool", "Civic Tech", "Water safety / public services", "Rural communities", "Prototype"],
  ["Community health worker route planner", "Health", "Community health delivery", "Community health workers", "Pilot-ready"],
  ["Recycling pickup micro-franchise tracker", "Climate", "Waste management / circular economy", "Young waste collectors", "Prototype"],
  ["Inclusive reading app for low-vision learners", "Education", "Accessible learning", "Students with low vision", "Idea"],
  ["Farm pest image diagnosis assistant", "Agriculture", "Crop risk / pest advisory", "Smallholder farmers", "Prototype"],
];

const generatedCountries = [
  ["Ghana", "West Africa"],
  ["Nigeria", "West Africa"],
  ["Kenya", "East Africa"],
  ["Uganda", "East Africa"],
  ["Tanzania", "East Africa"],
  ["India", "South Asia"],
  ["Bangladesh", "South Asia"],
  ["Nepal", "South Asia"],
  ["Indonesia", "Southeast Asia"],
  ["Philippines", "Southeast Asia"],
  ["Colombia", "Latin America"],
  ["Peru", "Latin America"],
  ["Brazil", "Latin America"],
];

const generatedBuilderNames = [
  "Maya Mensah",
  "Ibrahim Okoro",
  "Njeri Wanjiku",
  "Asha Patel",
  "Rizal Santoso",
  "Camila Rojas",
  "Thandi Ndlovu",
  "Farah Rahman",
  "Joao Silva",
  "Lina Quispe",
  "Samira Khan",
  "Kofi Adjei",
];

function generatedReadiness(stage) {
  if (stage === "Pilot-ready" || stage === "Active users") return "Pilot-ready";
  if (stage === "Prototype") return "Pilot-oriented prototype";
  return "Early-stage";
}

function generatedReadinessFilter(readiness) {
  if (readiness === "Pilot-ready") return "Pilot-ready";
  if (readiness === "Early-stage") return "Early-stage";
  return "Pilot-oriented";
}

function generatedGap(index) {
  return ["Medium", "Medium-High", "High", "Medium", "Low"][index % 5];
}

function makeGeneratedProject(index) {
  const theme = generatedProjectThemes[index % generatedProjectThemes.length];
  const country = generatedCountries[index % generatedCountries.length];
  const builderNameValue = generatedBuilderNames[index % generatedBuilderNames.length];
  const stage = theme[4];
  const readiness = generatedReadiness(stage);
  const fundingNeed = `$${8000 + ((index * 1700) % 34000)}`;
  const suffix = index + 6;
  return {
    id: `generated-project-${suffix}`,
    title: `${theme[0]} ${suffix}`,
    country: country[0],
    region: country[1],
    sector: theme[1],
    subsector: theme[2],
    beneficiaries: theme[3],
    stage,
    fundingNeed,
    readiness,
    readinessFilter: generatedReadinessFilter(readiness),
    opportunityGap: generatedGap(index),
    verification: "Self-reported",
    builderId: `builder-${suffix}`,
    builderName: builderNameValue,
    builderRole: index % 3 === 0 ? "Student builder" : index % 3 === 1 ? "Grassroots project lead" : "Young founder",
    builderLocation: country[0],
    description: `${builderNameValue} is developing ${theme[0].toLowerCase()} for ${theme[3].toLowerCase()} in ${country[0]}, with a focus on practical local adoption and evidence gathering.`,
  };
}

projects.push(...Array.from({ length: 95 }, (_, index) => makeGeneratedProject(index)));

function countBy(items, labels, matcher) {
  return labels.map((label) => ({
    label,
    count: items.filter((item) => matcher(item, label)).length,
  }));
}

const manualSector = countBy(projects, ["Education", "Health", "Climate", "Agriculture", "Civic Tech"], (project, label) =>
  String(project.sector || "").includes(label),
);

const manualRegion = countBy(projects, ["West Africa", "South Asia", "East Africa", "Latin America"], (project, label) => project.region === label);

const gfFundedProjects = [
  // Health – Malaria
  {id:"gf-001",title:"Malaria Vector Control Scale-up Programme",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Kenya Medical Research Institute",year:2023,amount:4.2},
  {id:"gf-002",title:"Indoor Residual Spraying for Malaria Reduction",country:"Tanzania",region:"Eastern Africa",sector:"Health",recipient:"National Malaria Control Programme TZ",year:2022,amount:3.8},
  {id:"gf-003",title:"Malaria Vaccine Rollout Support",country:"Uganda",region:"Eastern Africa",sector:"Health",recipient:"Uganda National Expanded Programme on Immunisation",year:2023,amount:5.1},
  {id:"gf-004",title:"Integrated Malaria Case Management",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Society for Family Health Nigeria",year:2022,amount:7.3},
  {id:"gf-005",title:"Long-Lasting Insecticidal Net Distribution",country:"Ghana",region:"Western Africa",sector:"Health",recipient:"Ghana Health Service",year:2023,amount:2.9},
  {id:"gf-006",title:"Malaria Elimination Pilot Programme",country:"Mozambique",region:"Eastern Africa",sector:"Health",recipient:"National Malaria Control Programme MZ",year:2022,amount:6.4},
  {id:"gf-007",title:"Malaria Surveillance and Rapid Response",country:"DRC",region:"Central Africa",sector:"Health",recipient:"Institut National de Santé Publique",year:2021,amount:4.8},
  {id:"gf-008",title:"Seasonal Malaria Chemoprevention",country:"Mali",region:"Western Africa",sector:"Health",recipient:"Direction Nationale de la Santé",year:2023,amount:3.1},
  // Health – Maternal & Child Health
  {id:"gf-009",title:"Maternal Health System Strengthening",country:"India",region:"South Asia",sector:"Health",recipient:"Population Foundation of India",year:2023,amount:9.7},
  {id:"gf-010",title:"Skilled Birth Attendant Training Programme",country:"Bangladesh",region:"South Asia",sector:"Health",recipient:"BRAC Health Programme",year:2023,amount:6.2},
  {id:"gf-011",title:"Postnatal Care Quality Improvement",country:"Ethiopia",region:"Eastern Africa",sector:"Health",recipient:"Ethiopian Public Health Institute",year:2022,amount:4.5},
  {id:"gf-012",title:"Newborn Survival Programme",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Maternal Newborn and Child Health Initiative",year:2023,amount:8.1},
  {id:"gf-013",title:"Community Midwifery Scale-up",country:"Pakistan",region:"South Asia",sector:"Health",recipient:"Aga Khan Development Network",year:2022,amount:3.7},
  {id:"gf-014",title:"Maternal Mortality Reduction Initiative",country:"Myanmar",region:"South-East Asia",sector:"Health",recipient:"Myanmar Maternal and Child Welfare Association",year:2021,amount:2.8},
  {id:"gf-015",title:"Prenatal Nutrition Programme",country:"Nepal",region:"South Asia",sector:"Health",recipient:"Nepal Family Health Programme",year:2023,amount:2.1},
  {id:"gf-016",title:"Emergency Obstetric Care Access",country:"Uganda",region:"Eastern Africa",sector:"Health",recipient:"Marie Stopes International Uganda",year:2022,amount:3.4},
  {id:"gf-017",title:"Maternal Death Surveillance System",country:"Tanzania",region:"Eastern Africa",sector:"Health",recipient:"Ifakara Health Institute",year:2023,amount:1.9},
  {id:"gf-018",title:"Obstetric Fistula Repair Programme",country:"Senegal",region:"Western Africa",sector:"Health",recipient:"Fistula Foundation",year:2021,amount:1.4},
  // Health – Vaccines
  {id:"gf-019",title:"Childhood Immunisation Scale-up",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Aliko Dangote Foundation",year:2023,amount:11.2},
  {id:"gf-020",title:"Rotavirus Vaccine Introduction Support",country:"India",region:"South Asia",sector:"Health",recipient:"UNICEF India",year:2022,amount:8.4},
  {id:"gf-021",title:"Polio Eradication Programme",country:"DRC",region:"Central Africa",sector:"Health",recipient:"WHO DRC Office",year:2023,amount:6.7},
  {id:"gf-022",title:"Measles Elimination Campaign",country:"Pakistan",region:"South Asia",sector:"Health",recipient:"Expanded Programme on Immunisation Pakistan",year:2022,amount:5.3},
  {id:"gf-023",title:"HPV Vaccine Pilot Programme",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Kenya National Vaccines & Immunisation Programme",year:2023,amount:2.6},
  {id:"gf-024",title:"Pneumococcal Vaccine Rollout",country:"Bangladesh",region:"South Asia",sector:"Health",recipient:"icddr,b",year:2022,amount:3.9},
  {id:"gf-025",title:"Cold Chain Infrastructure Strengthening",country:"Ethiopia",region:"Eastern Africa",sector:"Health",recipient:"Ethiopian Federal Ministry of Health",year:2023,amount:4.2},
  // Health – HIV / TB
  {id:"gf-026",title:"HIV Treatment Adherence Programme",country:"South Africa",region:"Southern Africa",sector:"Health",recipient:"Treatment Action Campaign",year:2023,amount:12.4},
  {id:"gf-027",title:"TB and HIV Co-infection Management",country:"Zimbabwe",region:"Southern Africa",sector:"Health",recipient:"Zimbabwe Association of Church-Related Hospitals",year:2022,amount:5.8},
  {id:"gf-028",title:"HIV Prevention Community Health Workers",country:"Zambia",region:"Southern Africa",sector:"Health",recipient:"Society for Family Health Zambia",year:2023,amount:7.1},
  {id:"gf-029",title:"Antiretroviral Therapy Access Scale-up",country:"Mozambique",region:"Eastern Africa",sector:"Health",recipient:"FHI 360 Mozambique",year:2022,amount:9.3},
  {id:"gf-030",title:"HIV Testing and Counselling Expansion",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"AIDS Prevention Initiative Nigeria",year:2023,amount:6.5},
  {id:"gf-031",title:"Tuberculosis Case Detection Programme",country:"Tanzania",region:"Eastern Africa",sector:"Health",recipient:"AMREF Health Africa",year:2022,amount:3.7},
  {id:"gf-032",title:"Pediatric HIV Care and Treatment",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Kenya Paediatric Association",year:2023,amount:4.1},
  // Health – Nutrition
  {id:"gf-033",title:"Acute Malnutrition Treatment Programme",country:"Ethiopia",region:"Eastern Africa",sector:"Health",recipient:"Save the Children Ethiopia",year:2023,amount:5.4},
  {id:"gf-034",title:"Community Nutrition Workers Network",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Helen Keller International Nigeria",year:2022,amount:3.8},
  {id:"gf-035",title:"Stunting Reduction Initiative",country:"Bangladesh",region:"South Asia",sector:"Health",recipient:"International Centre for Diarrhoeal Disease Research",year:2023,amount:6.7},
  {id:"gf-036",title:"Iron Deficiency Anaemia Programme",country:"India",region:"South Asia",sector:"Health",recipient:"Micronutrient Initiative India",year:2022,amount:4.3},
  {id:"gf-037",title:"Child Wasting Intervention",country:"Mali",region:"Western Africa",sector:"Health",recipient:"Action Against Hunger Mali",year:2023,amount:2.9},
  {id:"gf-038",title:"Micronutrient Supplementation Programme",country:"Mozambique",region:"Eastern Africa",sector:"Health",recipient:"Vitamin Angels",year:2022,amount:2.1},
  // Health – Digital Health
  {id:"gf-039",title:"Digital Community Health Worker Platform",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Living Goods Kenya",year:2023,amount:3.2},
  {id:"gf-040",title:"mHealth Antenatal Care System",country:"Tanzania",region:"Eastern Africa",sector:"Health",recipient:"D-tree International",year:2022,amount:2.7},
  {id:"gf-041",title:"Telemedicine Rural Access Programme",country:"India",region:"South Asia",sector:"Health",recipient:"Swasth Foundation",year:2023,amount:5.1},
  {id:"gf-042",title:"Community Health Worker Digital Tool",country:"Indonesia",region:"South-East Asia",sector:"Health",recipient:"Yayasan Kusuma Buana",year:2023,amount:2.2},
  {id:"gf-043",title:"Electronic Health Records for Primary Care",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"eHealth Africa",year:2022,amount:4.6},
  {id:"gf-044",title:"Maternal Health Data System",country:"Bangladesh",region:"South Asia",sector:"Health",recipient:"Dhaka Community Hospital Trust",year:2023,amount:3.1},
  {id:"gf-045",title:"Digital Disease Surveillance Network",country:"Rwanda",region:"Eastern Africa",sector:"Health",recipient:"Rwanda Biomedical Centre",year:2022,amount:1.8},
  // Agriculture – Smallholder Farmers
  {id:"gf-046",title:"Climate-Smart Agriculture Scale-up",country:"Kenya",region:"Eastern Africa",sector:"Agriculture",recipient:"One Acre Fund Kenya",year:2023,amount:2.4},
  {id:"gf-047",title:"Smallholder Market Access Programme",country:"Tanzania",region:"Eastern Africa",sector:"Agriculture",recipient:"Kilimo Trust",year:2022,amount:3.1},
  {id:"gf-048",title:"Drought-Tolerant Maize Varieties",country:"Ethiopia",region:"Eastern Africa",sector:"Agriculture",recipient:"CIMMYT Ethiopia",year:2023,amount:4.7},
  {id:"gf-049",title:"Fertiliser Access for Smallholders",country:"Nigeria",region:"Western Africa",sector:"Agriculture",recipient:"Alliance for a Green Revolution in Africa",year:2022,amount:5.2},
  {id:"gf-050",title:"Maize Yield Improvement Programme",country:"Ghana",region:"Western Africa",sector:"Agriculture",recipient:"International Food Policy Research Institute",year:2023,amount:2.8},
  {id:"gf-051",title:"Coffee Value Chain Development",country:"Uganda",region:"Eastern Africa",sector:"Agriculture",recipient:"TechnoServe Uganda",year:2022,amount:1.9},
  {id:"gf-052",title:"Conservation Agriculture Scale-up",country:"Zambia",region:"Southern Africa",sector:"Agriculture",recipient:"Conservation Farming Unit",year:2023,amount:2.3},
  {id:"gf-053",title:"Millet and Sorghum Productivity",country:"Mali",region:"Western Africa",sector:"Agriculture",recipient:"ICRISAT Mali",year:2022,amount:1.6},
  {id:"gf-054",title:"Soil Fertility Management Initiative",country:"Burkina Faso",region:"Western Africa",sector:"Agriculture",recipient:"INERA Burkina Faso",year:2023,amount:1.4},
  {id:"gf-055",title:"Food Systems Resilience Programme",country:"Niger",region:"Western Africa",sector:"Agriculture",recipient:"Catholic Relief Services Niger",year:2022,amount:1.8},
  {id:"gf-056",title:"Potato Value Chain Strengthening",country:"Rwanda",region:"Eastern Africa",sector:"Agriculture",recipient:"International Potato Centre",year:2023,amount:2.1},
  {id:"gf-057",title:"Rice Yield Improvement Programme",country:"Mozambique",region:"Eastern Africa",sector:"Agriculture",recipient:"Africa Rice Centre",year:2022,amount:2.6},
  // Agriculture – Finance & Tools
  {id:"gf-058",title:"Digital Agricultural Finance Platform",country:"Kenya",region:"Eastern Africa",sector:"Agriculture",recipient:"Equity Bank Foundation Kenya",year:2023,amount:3.4},
  {id:"gf-059",title:"Crop Insurance Pilot for Smallholders",country:"Tanzania",region:"Eastern Africa",sector:"Agriculture",recipient:"Agriculture Development Fund TZ",year:2022,amount:2.2},
  {id:"gf-060",title:"Agri-Input Voucher System",country:"Ghana",region:"Western Africa",sector:"Agriculture",recipient:"Esoko Networks",year:2023,amount:1.7},
  {id:"gf-061",title:"Precision Irrigation for Smallholders",country:"India",region:"South Asia",sector:"Agriculture",recipient:"International Water Management Institute",year:2022,amount:4.8},
  {id:"gf-062",title:"Flood-Tolerant Rice Varieties",country:"Bangladesh",region:"South Asia",sector:"Agriculture",recipient:"Bangladesh Rice Research Institute",year:2023,amount:3.3},
  {id:"gf-063",title:"Hill Farming Support Programme",country:"Nepal",region:"South Asia",sector:"Agriculture",recipient:"CARE Nepal",year:2022,amount:1.2},
  {id:"gf-064",title:"Drip Irrigation Expansion",country:"Pakistan",region:"South Asia",sector:"Agriculture",recipient:"Pakistan Agricultural Research Council",year:2023,amount:2.9},
  // Water & Sanitation
  {id:"gf-065",title:"Community Water Quality Reporting",country:"Nigeria",region:"Western Africa",sector:"Water & Sanitation",recipient:"WaterAid Nigeria",year:2023,amount:3.3},
  {id:"gf-066",title:"Rural Water Supply Infrastructure",country:"Kenya",region:"Eastern Africa",sector:"Water & Sanitation",recipient:"Water & Sanitation for the Urban Poor",year:2022,amount:2.8},
  {id:"gf-067",title:"Water Point Management Systems",country:"Uganda",region:"Eastern Africa",sector:"Water & Sanitation",recipient:"IRC Uganda",year:2023,amount:1.9},
  {id:"gf-068",title:"School WASH Programme",country:"Tanzania",region:"Eastern Africa",sector:"Water & Sanitation",recipient:"UNICEF Tanzania",year:2022,amount:2.4},
  {id:"gf-069",title:"Open Defecation Free Campaign",country:"India",region:"South Asia",sector:"Water & Sanitation",recipient:"Gram Vikas India",year:2023,amount:5.6},
  {id:"gf-070",title:"Arsenic-Safe Water Systems",country:"Bangladesh",region:"South Asia",sector:"Water & Sanitation",recipient:"BRAC WASH Programme",year:2022,amount:3.1},
  {id:"gf-071",title:"WASH Governance Strengthening",country:"Ethiopia",region:"Eastern Africa",sector:"Water & Sanitation",recipient:"WaterAid Ethiopia",year:2023,amount:2.2},
  {id:"gf-072",title:"Rural Water Systems Maintenance",country:"Mali",region:"Western Africa",sector:"Water & Sanitation",recipient:"HELVETAS Mali",year:2022,amount:1.4},
  {id:"gf-073",title:"Emergency Water Access Programme",country:"DRC",region:"Central Africa",sector:"Water & Sanitation",recipient:"Mercy Corps DRC",year:2023,amount:2.7},
  {id:"gf-074",title:"Sanitation Infrastructure Programme",country:"Mozambique",region:"Eastern Africa",sector:"Water & Sanitation",recipient:"Plan International Mozambique",year:2022,amount:1.8},
  // Education
  {id:"gf-075",title:"Girls Secondary Education Access",country:"Kenya",region:"Eastern Africa",sector:"Education",recipient:"Camfed Kenya",year:2023,amount:4.2},
  {id:"gf-076",title:"Teacher Professional Development",country:"Ghana",region:"Western Africa",sector:"Education",recipient:"Ghana Education Service",year:2022,amount:3.1},
  {id:"gf-077",title:"Early Childhood Development Programme",country:"Nigeria",region:"Western Africa",sector:"Education",recipient:"Education as a Vaccine",year:2023,amount:5.7},
  {id:"gf-078",title:"Numeracy and Literacy Improvement",country:"Tanzania",region:"Eastern Africa",sector:"Education",recipient:"Twaweza Tanzania",year:2022,amount:2.9},
  {id:"gf-079",title:"School Feeding and Nutrition",country:"Ethiopia",region:"Eastern Africa",sector:"Education",recipient:"World Food Programme Ethiopia",year:2023,amount:3.4},
  {id:"gf-080",title:"Digital Learning Platforms for Rural Schools",country:"India",region:"South Asia",sector:"Education",recipient:"Pratham Education Foundation",year:2022,amount:4.1},
  {id:"gf-081",title:"Higher Education Scholarship Programme",country:"Rwanda",region:"Eastern Africa",sector:"Education",recipient:"Rwanda Education Board",year:2023,amount:2.3},
  {id:"gf-082",title:"Girls Dropout Prevention Programme",country:"Bangladesh",region:"South Asia",sector:"Education",recipient:"BRAC Education Programme",year:2022,amount:3.8},
  // Financial Inclusion
  {id:"gf-083",title:"Mobile Money for Smallholder Farmers",country:"Kenya",region:"Eastern Africa",sector:"Financial Inclusion",recipient:"M-PESA Foundation",year:2023,amount:2.1},
  {id:"gf-084",title:"Village Savings and Loan Groups",country:"Tanzania",region:"Eastern Africa",sector:"Financial Inclusion",recipient:"Opportunity International Tanzania",year:2022,amount:1.6},
  {id:"gf-085",title:"Mobile Banking Infrastructure",country:"Ghana",region:"Western Africa",sector:"Financial Inclusion",recipient:"Ghana Interbank Payment Systems",year:2023,amount:2.7},
  {id:"gf-086",title:"Microfinance Institution Support",country:"Nigeria",region:"Western Africa",sector:"Financial Inclusion",recipient:"LAPO Microfinance Bank",year:2022,amount:3.9},
  {id:"gf-087",title:"Women's Financial Inclusion Programme",country:"India",region:"South Asia",sector:"Financial Inclusion",recipient:"Self Employed Women's Association",year:2023,amount:5.2},
  {id:"gf-088",title:"Digital Payments Infrastructure",country:"Bangladesh",region:"South Asia",sector:"Financial Inclusion",recipient:"bKash Foundation",year:2022,amount:3.4},
  {id:"gf-089",title:"Rural Banking Access",country:"Nepal",region:"South Asia",sector:"Financial Inclusion",recipient:"Nirdhan Utthan Bank",year:2023,amount:1.3},
  {id:"gf-090",title:"Savings Groups for Women",country:"Uganda",region:"Eastern Africa",sector:"Financial Inclusion",recipient:"Plan International Uganda",year:2022,amount:1.8},
  // Population & Reproductive Health
  {id:"gf-091",title:"Family Planning Community Health Workers",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Marie Stopes International Kenya",year:2023,amount:3.7},
  {id:"gf-092",title:"Contraceptive Access Programme",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Society for Family Health Nigeria",year:2022,amount:5.1},
  {id:"gf-093",title:"Adolescent Reproductive Health Initiative",country:"Ethiopia",region:"Eastern Africa",sector:"Health",recipient:"Ethiopian Women Lawyers Association",year:2023,amount:2.8},
  {id:"gf-094",title:"Maternal Family Planning Integration",country:"Tanzania",region:"Eastern Africa",sector:"Health",recipient:"Tanzania Midwives Association",year:2022,amount:2.4},
  {id:"gf-095",title:"Sexual and Reproductive Health Services",country:"Senegal",region:"Western Africa",sector:"Health",recipient:"Association pour le Bien-être Familial",year:2023,amount:1.9},
  {id:"gf-096",title:"Population Policy Research Support",country:"India",region:"South Asia",sector:"Health",recipient:"International Institute for Population Sciences",year:2022,amount:4.3},
  // Emergency Response & Other
  {id:"gf-097",title:"COVID-19 Health System Strengthening",country:"Kenya",region:"Eastern Africa",sector:"Health",recipient:"Amref Health Africa",year:2022,amount:6.8},
  {id:"gf-098",title:"Epidemic Preparedness Programme",country:"Nigeria",region:"Western Africa",sector:"Health",recipient:"Nigeria Centre for Disease Control Foundation",year:2023,amount:4.2},
  {id:"gf-099",title:"Cholera Response and Prevention",country:"DRC",region:"Central Africa",sector:"Health",recipient:"Médecins Sans Frontières",year:2021,amount:3.1},
  {id:"gf-100",title:"Flood Disaster Health Response",country:"Bangladesh",region:"South Asia",sector:"Health",recipient:"Red Crescent Society Bangladesh",year:2023,amount:2.5},
];

const STORAGE_KEYS = {
  submittedProjects: "opportunityAtlas.submittedProjects.v1",
  reviewStatuses: "opportunityAtlas.reviewStatuses.v1",
  builderActivity: "opportunityAtlas.builderActivity.v1",
  messages: "opportunityAtlas.messages.v1",
  recordedAmounts: "opportunityAtlas.recordedAmounts.v1",
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "based",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "project",
  "program",
  "programme",
  "support",
  "the",
  "this",
  "to",
  "with",
]);

function initialPage() {
  const hashPage = window.location.hash.replace("#", "");
  const allowedPages = new Set([
    "overview",
    "opportunity-atlas",
    "discovery",
    "detail",
    "queue",
    "funder-history",
    "signals",
    "submit",
    "builder-history",
    "submission-detail",
    "builder-notifications",
    "messages",
    "builder-profile",
  ]);
  if (allowedPages.has(hashPage)) return hashPage;
  return window.__INITIAL_PAGE__ || "overview";
}

const state = {
  page: initialPage(),
  selectedProjectId: "offline-learning-ghana",
  selectedBuilderId: "",
  selectedThreadId: "",
  builderProfile: null,
  reviewMessage: "",
  filters: {
    country: "All",
    sector: "All",
    stage: "All",
    readiness: "All",
    gap: "All",
    verification: "Self-reported",
  },
  flow: {
    recipient: "",
    sector: "All sectors",
    year: "All years",
    topN: 5,
  },
};

let activeFlowDeck = null;
let visualLibrariesLoading = null;

function currentPortalType() {
  return document.body.dataset.portal || (window.__INITIAL_PAGE__ === "submit" ? "builder" : "funder");
}

function currentSenderLabel() {
  return currentPortalType() === "builder" ? "Builder" : "Funder";
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function gapClass(value) {
  if (value === "High") return "red";
  if (value === "Medium-High") return "amber";
  if (value === "Medium") return "blue";
  return "green";
}

function reviewStatusClass(value) {
  if (value === "Funded") return "green";
  if (value === "Invited to apply") return "green";
  if (value === "Evidence requested") return "blue";
  if (value === "Shortlisted") return "amber";
  return "";
}

function fitClass(value) {
  if (value === "High") return "green";
  if (value === "Medium-High") return "blue";
  return "amber";
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function fundingAmountValue(value) {
  return Number(String(value || "").replace(/[^0-9.]+/g, "")) || 0;
}

function fundingAmountLabel(value) {
  if (!value) return "$0";
  return `$${compactNumber(value)}`;
}

function safeExternalUrl(value) {
  const text = String(value || "").trim();
  return /^https?:\/\//i.test(text) ? text : "";
}

function truncateText(value, limit = 210) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}...`;
}

function slugify(value) {
  return String(value || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);
}

function builderIdFor(name, fallback = "builder") {
  return slugify(name || fallback);
}

function builderName(project) {
  return project.builderName || "Self-reported builder";
}

function builderRole(project) {
  return project.builderRole || "Young builder";
}

function builderLocation(project) {
  return project.builderLocation || project.country || "Local builder";
}

function projectCountForBuilder(builderId) {
  return projects.filter((project) => project.builderId === builderId).length;
}

function projectsForBuilder(builderId) {
  return projects.filter((project) => project.builderId === builderId);
}

function readinessFilterFor(label) {
  if (label === "Pilot-ready") return "Pilot-ready";
  if (label === "Early-stage") return "Early-stage";
  return "Pilot-oriented";
}

function deriveReadinessFromStage(stage) {
  if (stage === "Pilot-ready" || stage === "Active users") return "Pilot-ready";
  if (stage === "Prototype") return "Pilot-oriented prototype";
  return "Early-stage";
}

function getReviewStatus(project) {
  return project.reviewStatus || "Not reviewed";
}

function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function storageGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo persistence should never block the UI if storage is unavailable.
  }
}

function normalizeProject(project) {
  const name = project.builderName || "Self-reported builder";
  return {
    readiness: deriveReadinessFromStage(project.stage),
    readinessFilter: readinessFilterFor(project.readiness || deriveReadinessFromStage(project.stage)),
    opportunityGap: project.opportunityGap || "Medium",
    verification: "Self-reported",
    reviewStatus: "Not reviewed",
    submittedAt: project.submittedAt || new Date().toISOString(),
    builderName: name,
    builderId: project.builderId || builderIdFor(name),
    builderRole: project.builderRole || "Young builder",
    builderLocation: project.builderLocation || project.country || "Local builder",
    ...project,
  };
}

function initializeStoredData() {
  const submitted = storageGet(STORAGE_KEYS.submittedProjects, []);
  submitted.map(normalizeProject).forEach((project) => {
    if (!projects.some((existing) => existing.id === project.id)) projects.push(project);
  });
  const reviewStatuses = storageGet(STORAGE_KEYS.reviewStatuses, {});
  projects.forEach((project) => {
    if (reviewStatuses[project.id]) project.reviewStatus = reviewStatuses[project.id];
    if (project.isSubmitted) initializeBuilderActivity(project);
  });
}

function saveSubmittedProjects() {
  storageSet(
    STORAGE_KEYS.submittedProjects,
    projects.filter((project) => project.isSubmitted),
  );
}

function saveReviewStatuses() {
  const statuses = {};
  projects.forEach((project) => {
    if (project.reviewStatus && project.reviewStatus !== "Not reviewed") {
      statuses[project.id] = project.reviewStatus;
    }
  });
  storageSet(STORAGE_KEYS.reviewStatuses, statuses);
}

function getRecordedAmount(project) {
  const amounts = storageGet(STORAGE_KEYS.recordedAmounts, {});
  return amounts[project.id] || project.fundingNeed || "";
}

function saveRecordedAmount(projectId, amount) {
  const amounts = storageGet(STORAGE_KEYS.recordedAmounts, {});
  amounts[projectId] = amount;
  storageSet(STORAGE_KEYS.recordedAmounts, amounts);
}

function showFundModal(project, isEdit = false) {
  document.getElementById("fund-modal")?.remove();
  const modal = document.createElement("div");
  modal.id = "fund-modal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <h2>${isEdit ? "Edit Recorded Amount" : "Record Funding"}</h2>
      <p>${isEdit ? `Update the recorded amount for <strong>${escapeHtml(project.title)}</strong>.` : `Enter the amount committed to <strong>${escapeHtml(project.title)}</strong>.`}</p>
      <label>Amount<input id="fund-amount-input" type="text" value="${escapeHtml(getRecordedAmount(project))}" placeholder="e.g. $10,000" /></label>
      <div class="modal-actions">
        <button class="btn" id="fund-cancel">Cancel</button>
        <button class="btn primary" id="fund-confirm">${isEdit ? "Save" : "Confirm Funding"}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#fund-amount-input").focus();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector("#fund-cancel").addEventListener("click", () => modal.remove());
  modal.querySelector("#fund-confirm").addEventListener("click", () => {
    const amount = modal.querySelector("#fund-amount-input").value.trim();
    if (amount) saveRecordedAmount(project.id, amount);
    if (!isEdit) {
      project.reviewStatus = "Funded";
      state.reviewMessage = "Funding recorded in funder history.";
      saveReviewStatuses();
      renderDetail();
      renderQueue();
    }
    renderFunderHistory();
    modal.remove();
  });
}

function gfHistoricalAmount(projectId) {
  const intel = getIntel(projectId);
  const gf = (intel.potentialFunders || []).find((f) => f.name === FUNDER_ACCOUNT.name);
  return gf ? gf.amountLabel : null;
}

function seedGatesFoundationDemo() {
  if (localStorage.getItem(STORAGE_KEYS.reviewStatuses) !== null) return;
  const seedIds = ["maternal-health-india", "sms-climate-kenya", "water-quality-nigeria", "telemedicine-indonesia"];
  const statuses = {};
  const amounts = {};
  seedIds.forEach((id) => {
    statuses[id] = "Funded";
    const amt = gfHistoricalAmount(id);
    if (amt) amounts[id] = amt;
  });
  storageSet(STORAGE_KEYS.reviewStatuses, statuses);
  storageSet(STORAGE_KEYS.recordedAmounts, amounts);
}

function builderProjects() {
  return projects.filter((project) => project.isSubmitted);
}

function defaultBuilderActivity(project) {
  return {
    projectId: project.id,
    builderId: project.builderId || builderIdFor(project.builderName),
    submittedAt: project.submittedAt || new Date().toISOString(),
    searchAppearances: 0,
    projectViews: 0,
    profileViews: 0,
    searchEvents: [],
    projectViewers: [],
    viewers: [],
  };
}

function getBuilderActivity(project, store = storageGet(STORAGE_KEYS.builderActivity, {})) {
  return {
    ...defaultBuilderActivity(project),
    ...(store[project.id] || {}),
  };
}

function updateBuilderActivity(project, updater) {
  const store = storageGet(STORAGE_KEYS.builderActivity, {});
  const activity = getBuilderActivity(project, store);
  store[project.id] = updater(activity) || activity;
  storageSet(STORAGE_KEYS.builderActivity, store);
  return store[project.id];
}

function initializeBuilderActivity(project) {
  updateBuilderActivity(project, (activity) => activity);
}

function funderViewerForProject(project, activity) {
  const intel = getIntel(project.id);
  const funders = intel.potentialFunders || [];
  const viewCount = Number(activity.profileViews || 0) + Number(activity.projectViews || 0);
  const funder = funders.length ? funders[viewCount % funders.length] : null;
  const roles = ["Program officer", "Grantmaking associate", "Fellowship scout", "Innovation fund reviewer"];
  return {
    organization: funder?.name || "First Spark review desk",
    role: roles[viewCount % roles.length],
  };
}

function recordBuilderSearchAppearances(visibleProjects, source = "Discovery filters") {
  const eventKey = [
    new Date().toISOString().slice(0, 10),
    source,
    state.filters.country,
    state.filters.sector,
    state.filters.stage,
    state.filters.readiness,
    state.filters.gap,
  ].join("|");

  visibleProjects.filter((project) => project.isSubmitted).forEach((project) => {
    updateBuilderActivity(project, (activity) => {
      const searchEvents = Array.isArray(activity.searchEvents) ? activity.searchEvents : [];
      if (!searchEvents.includes(eventKey)) {
        activity.searchEvents = [...searchEvents, eventKey];
        activity.searchAppearances = activity.searchEvents.length;
        activity.lastSearchAt = new Date().toISOString();
      }
      return activity;
    });
  });
}

function recordBuilderProjectView(project, source = "Evaluation Packet") {
  if (!project) return;
  updateBuilderActivity(project, (activity) => {
    const viewer = funderViewerForProject(project, activity);
    activity.projectViews = Number(activity.projectViews || 0) + 1;
    activity.lastProjectViewedAt = new Date().toISOString();
    activity.projectViewers = [
      {
        ...viewer,
        source,
        viewedAt: activity.lastProjectViewedAt,
      },
      ...(activity.projectViewers || []),
    ].slice(0, 6);
    return activity;
  });
}

function recordBuilderProfileView(project, source = "Builder Profile") {
  if (!project) return;
  updateBuilderActivity(project, (activity) => {
    const viewer = funderViewerForProject(project, activity);
    activity.profileViews = Number(activity.profileViews || 0) + 1;
    activity.lastProfileViewedAt = new Date().toISOString();
    activity.viewers = [
      {
        ...viewer,
        source,
        viewedAt: activity.lastProfileViewedAt,
      },
      ...(activity.viewers || []),
    ].slice(0, 6);
    return activity;
  });
}

function getThreads() {
  return storageGet(STORAGE_KEYS.messages, []);
}

function saveThreads(threads) {
  storageSet(STORAGE_KEYS.messages, threads);
}

function threadIdFor(project) {
  return `thread-${project.builderId || builderIdFor(project.builderName)}-${project.id}`;
}

function ensureThread(project, initiator = currentPortalType()) {
  const threads = getThreads();
  const id = threadIdFor(project);
  let thread = threads.find((item) => item.id === id);
  if (!thread) {
    thread = {
      id,
      projectId: project.id,
      builderId: project.builderId,
      builderName: builderName(project),
      projectTitle: project.title,
      funderName: FUNDER_ACCOUNT.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    threads.unshift(thread);
  }

  const starterText =
    initiator === "builder"
      ? `${builderName(project)} opened a conversation with a potentially relevant funder about ${project.title}.`
      : `A funder opened a conversation with ${builderName(project)} about ${project.title}.`;
  if (!thread.messages.some((message) => message.system && message.text === starterText)) {
    thread.messages.push({
      sender: "First Spark",
      text: starterText,
      at: new Date().toISOString(),
      system: true,
    });
  }
  thread.updatedAt = new Date().toISOString();
  saveThreads(threads);
  state.selectedThreadId = id;
  return thread;
}

function addMessageToThread(threadId, text, sender = currentSenderLabel()) {
  const threads = getThreads();
  const thread = threads.find((item) => item.id === threadId);
  if (!thread || !String(text || "").trim()) return;
  thread.messages.push({
    sender,
    text: String(text).trim(),
    at: new Date().toISOString(),
  });
  thread.updatedAt = new Date().toISOString();
  saveThreads(threads);
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function uniqueTokens(value) {
  return new Set(tokenize(value));
}

function projectSearchText(project) {
  return [
    project.title,
    project.description,
    project.country,
    project.region,
    project.sector,
    project.subsector,
    project.beneficiaries,
    project.teamBackground,
    project.tractionEvidence,
  ].join(" ");
}

function recordSearchText(record) {
  return [
    record.title,
    record.description,
    record.country,
    record.region,
    record.sector,
    record.subsector,
    record.donor,
  ].join(" ");
}

function buildOecdMatchingCorpus() {
  const seen = new Set();
  const records = [];
  Object.values(oecd.projectIntel || {}).forEach((intel) => {
    (intel.similarProjects || []).forEach((record) => {
      const key = [record.title, record.donor, record.country, record.year].join("|");
      if (!seen.has(key)) {
        seen.add(key);
        records.push(record);
      }
    });
  });
  return records;
}

function sameText(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function recordScore(project, record) {
  const projectTokens = uniqueTokens(projectSearchText(project));
  const recordTokens = uniqueTokens(recordSearchText(record));
  let overlap = 0;
  projectTokens.forEach((token) => {
    if (recordTokens.has(token)) overlap += 1;
  });
  let score = overlap;
  if (sameText(project.sector, record.sector)) score += 5;
  if (sameText(project.country, record.country)) score += 6;
  if (sameText(project.region, record.region)) score += 2;
  if (String(record.sector || "").toLowerCase().includes(String(project.sector || "").toLowerCase())) score += 2;
  return score;
}

function generateFundingContext(project) {
  const corpus = buildOecdMatchingCorpus();
  const scored = corpus
    .map((record) => ({ ...record, score: recordScore(project, record) }))
    .filter((record) => record.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const donorMap = new Map();
  scored.forEach((record) => {
    const existing = donorMap.get(record.donor) || {
      name: record.donor,
      records: 0,
      amount: 0,
      countries: new Set(),
      sectors: new Set(),
    };
    existing.records += 1;
    existing.amount += Number(record.amount || 0);
    existing.countries.add(record.country);
    existing.sectors.add(record.sector);
    donorMap.set(record.donor, existing);
  });

  const potentialFunders = Array.from(donorMap.values())
    .sort((a, b) => b.records - a.records || b.amount - a.amount)
    .slice(0, 3)
    .map((funder) => ({
      name: funder.name,
      fit: funder.records >= 3 ? "High" : funder.records >= 2 ? "Medium-High" : "Medium",
      amountLabel: funder.amount ? `$${funder.amount >= 1 ? `${funder.amount.toFixed(1)}M` : `${Math.round(funder.amount * 1000)}K`}` : "Matched records",
      reason: `Appears in ${funder.records} related OECD funding record${funder.records === 1 ? "" : "s"} touching ${Array.from(funder.sectors).slice(0, 2).join(", ")} themes.`,
    }));

  return {
    similarProjects: scored,
    potentialFunders,
    fallback:
      scored.length < 2
        ? "No strong historical matches were found in the available OECD records. This does not mean the project is not valuable; it means the current dataset has limited coverage for this project area."
        : "",
  };
}

function evidenceItems(project) {
  const checks = [
    ["Evidence link provided", "No evidence link", project.evidenceLink],
    ["Pilot partner listed", "No pilot partner confirmation", project.pilotPartner],
    ["Current users / beneficiaries provided", "No current users / beneficiaries count", project.usersReached],
    ["Budget breakdown provided", "No budget breakdown", project.budgetBreakdown],
    ["Traction/evidence provided", "No impact evidence", project.tractionEvidence],
    ["Team background provided", "No team background", project.teamBackground],
  ];
  return {
    available: checks.filter(([, , value]) => Boolean(String(value || "").trim())).map(([yes]) => yes),
    missing: checks.filter(([, , value]) => !String(value || "").trim()).map(([, no]) => no),
  };
}

function computeReadiness(project) {
  const evidence = evidenceItems(project).available.length;
  const hasFunding = Boolean(String(project.fundingNeed || "").trim());
  const hasBeneficiaries = Boolean(String(project.beneficiaries || "").trim());
  if ((project.stage === "Pilot-ready" || project.stage === "Active users") && evidence >= 2) return "Pilot-ready";
  if (project.stage === "Prototype" && hasFunding && hasBeneficiaries) return "Pilot-oriented prototype";
  if (project.description && project.sector) return "Early-stage";
  return "Needs more information";
}

function readinessRationale(project) {
  const items = [];
  if (project.stage) items.push(`${project.stage} stage selected`);
  if (project.beneficiaries) items.push("Target beneficiaries are clear");
  if (project.fundingNeed) items.push("Funding request is specific");
  items.push(project.evidenceLink ? "Evidence link is provided" : "Evidence link is missing");
  items.push(project.pilotPartner ? "Pilot/local partner is listed" : "Pilot partner confirmation is missing");
  items.push(project.budgetBreakdown ? "Budget breakdown is provided" : "Budget breakdown is missing");
  items.push(project.tractionEvidence ? "Traction or early evidence is provided" : "Traction or impact evidence is missing");
  return items;
}

function needsReviewItems(project) {
  const missing = evidenceItems(project).missing;
  const items = [...missing];
  if (!project.impactMeasurement) items.push("Missing impact measurement plan");
  return items.length ? items : ["Evidence package is relatively complete; verify claims with source materials."];
}

function computeGap(project, intel) {
  const topSectorLabels = (oecd.topSectors || []).map((sector) => String(sector.label || "").toLowerCase());
  const sectorActive = topSectorLabels.some((label) => label.includes(String(project.sector || "").toLowerCase()));
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  const sameSectorMatches = (intel.similarProjects || []).filter((record) => sameText(record.sector, project.sector)).length;
  if (!intel.similarProjects?.length) return "Unknown / Needs more data";
  if (sectorActive && sameCountryMatches <= 1) return "Medium-High";
  if (sameCountryMatches >= 3 && sameSectorMatches >= 3) return "Low";
  return "Medium";
}

function opportunityGapScore(project, intel) {
  const gapLabel = project.opportunityGap || intel.gapSignal?.label || computeGap(project, intel);
  const baseScores = {
    High: 92,
    "Medium-High": 78,
    Medium: 56,
    Low: 28,
    "Unknown / Needs more data": 36,
  };
  let score = baseScores[gapLabel] || 45;
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  const similarCount = (intel.similarProjects || []).length;
  if (similarCount && sameCountryMatches === 0) score += 8;
  if (sameCountryMatches >= 3) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function funderAlignmentScore(project, intel) {
  const similarProjects = intel.similarProjects || [];
  const funders = intel.potentialFunders || [];
  const sameSectorMatches = similarProjects.filter((record) => sameText(record.sector, project.sector)).length;
  const sameCountryMatches = similarProjects.filter((record) => sameText(record.country, project.country)).length;
  const sameRegionMatches = similarProjects.filter((record) => sameText(record.region, project.region)).length;
  const bestKeywordMatch = Math.max(0, ...similarProjects.map((record) => record.score || recordScore(project, record)));
  const fitScores = { High: 8, "Medium-High": 6, Medium: 4 };
  const funderFit = Math.min(18, funders.reduce((sum, funder) => sum + (fitScores[funder.fit] || 3), 0));
  const keywordFit = Math.min(22, bestKeywordMatch * 1.4);
  const sectorFit = Math.min(20, sameSectorMatches * 3);
  const countryFit = Math.min(18, sameCountryMatches * 4.5);
  const regionFit = Math.min(10, sameRegionMatches * 2.5);
  const matchDepth = Math.min(12, similarProjects.length * 1.5);
  return Math.max(0, Math.min(100, Math.round(funderFit + keywordFit + sectorFit + countryFit + regionFit + matchDepth)));
}

function gatesFit(project) {
  const sector = (project.sector || "").toLowerCase();
  if (sector.includes("health")) return "High";
  if (FUNDER_ACCOUNT.focus.some((f) => sector.includes(f.toLowerCase()))) return "Medium";
  return "Low";
}

function recommendationSignal(project) {
  const intel = getIntel(project.id);
  const gapScore = opportunityGapScore(project, intel);
  const alignmentScore = funderAlignmentScore(project, intel);
  const score = Math.round(gapScore * 0.55 + alignmentScore * 0.45);
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  return {
    score,
    gapScore,
    alignmentScore,
    intel,
    sameCountryMatches,
    similarCount: intel.similarProjects?.length || 0,
  };
}

function recommendedProjects(limit = 3) {
  return projects
    .map((project) => ({ project, signal: recommendationSignal(project) }))
    .sort((a, b) => b.signal.score - a.signal.score)
    .slice(0, limit);
}

function gapRationale(project, intel) {
  const topSectorLabels = (oecd.topSectors || []).map((sector) => sector.label);
  const sectorActive = topSectorLabels.some((label) => String(label || "").toLowerCase().includes(String(project.sector || "").toLowerCase()));
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  const items = [];
  items.push(
    sectorActive
      ? `${project.sector} appears as an active global funding sector in OECD records.`
      : `${project.sector} has limited representation in the available OECD top-sector view.`,
  );
  items.push(`The submitted project is in ${project.country}.`);
  items.push(`${sameCountryMatches} similar record${sameCountryMatches === 1 ? " was" : "s were"} found for the same country in the available matching corpus.`);
  items.push("A local project signal exists in this underrepresented space.");
  return items;
}

const DONUT_COLORS = [
  "#1d5fd0", "#08795f", "#e08614", "#9b3eab",
  "#d94f45", "#0e9cb5", "#5c7cfa", "#f59e42",
  "#64748b", "#16a34a",
];

function yearLineChart(items, valueKey = "amount") {
  const values = items.map((item) => item[valueKey] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const floor = min - range * 0.6;
  const ceil = max + range * 0.4;
  const span = ceil - floor;

  const W = 540, H = 130, ml = 28, mr = 28, mt = 28, mb = 28;
  const pw = W - ml - mr, ph = H - mt - mb;
  const n = items.length;
  const toX = (i) => ml + (i / (n - 1)) * pw;
  const toY = (v) => mt + ph - ((v - floor) / span) * ph;

  const pts = items.map((item, i) => ({
    x: toX(i),
    y: toY(item[valueKey] || 0),
    label: String(item.label),
    amtLabel: item.amountLabel || compactNumber(item[valueKey] || 0),
    value: item[valueKey] || 0,
  }));

  const polyPts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` +
    pts.slice(1).map((p) => ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("") +
    ` L${pts[n - 1].x.toFixed(1)},${H - mb} L${pts[0].x.toFixed(1)},${H - mb} Z`;

  const deltas = pts.slice(1).map((p, i) => {
    const delta = p.value - pts[i].value;
    const color = delta >= 0 ? "#0d9b72" : "#e05050";
    const mx = ((pts[i].x + p.x) / 2).toFixed(1);
    const my = (Math.min(pts[i].y, p.y) - 10).toFixed(1);
    return `<text x="${mx}" y="${my}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${color}">${delta >= 0 ? "+" : "−"}$${Math.round(Math.abs(delta))}M</text>`;
  });

  return `<div class="lchart-outer"><svg class="lchart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2868c7" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#2868c7" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#lcg)"/>
    <polyline points="${polyPts}" fill="none" stroke="#2868c7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts
      .map(
        (p) =>
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" class="lchart-dot"/>` +
          `<text x="${p.x.toFixed(1)}" y="${(p.y - 12).toFixed(1)}" text-anchor="middle" class="lchart-amt">${escapeHtml(p.amtLabel)}</text>` +
          `<text x="${p.x.toFixed(1)}" y="${(H - 8).toFixed(1)}" text-anchor="middle" class="lchart-lbl">${escapeHtml(p.label)}</text>`,
      )
      .join("")}
    ${deltas.join("")}
  </svg></div>`;
}

function donutChart(items, valueKey = "amount") {
  const slice = items.slice(0, 8);
  const total = slice.reduce((sum, item) => sum + (item[valueKey] || 0), 0) || 1;
  let cum = 0;
  const segments = slice.map((item, i) => {
    const pct = ((item[valueKey] || 0) / total) * 100;
    const start = cum;
    cum += pct;
    return { ...item, pct, start, color: DONUT_COLORS[i] };
  });
  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(", ");
  return `<div class="donut-wrap">
    <div class="donut" style="background:conic-gradient(${gradient})"></div>
    <div class="donut-legend">
      ${segments
        .map(
          (s) => `<div class="donut-item">
        <span class="donut-dot" style="background:${s.color}"></span>
        <span class="donut-name">${escapeHtml(s.label)}</span>
        <span class="donut-amt">${escapeHtml(s.amountLabel || "")}</span>
      </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

function barList(items, valueKey = "count") {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  return `<div class="bar-list">
    ${items
      .map((item) => {
        const value = item[valueKey] || 0;
        const width = Math.max(6, Math.round((value / max) * 100));
        const label = item.amountLabel || compactNumber(value);
        return `<div class="bar-row">
          <strong>${escapeHtml(item.label)}</strong>
          <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="--value: ${width}%"></div></div>
          <span>${escapeHtml(label)}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function kpi(label, value) {
  return `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function sectionHeader(title, kicker = "") {
  return `<div class="section-header">
    <div>
      <h2>${escapeHtml(title)}</h2>
      ${kicker ? `<p>${escapeHtml(kicker)}</p>` : ""}
    </div>
  </div>`;
}

function funderWorkflow(active) {
  const steps = [
    { id: "discover", label: "Discover", text: "Filter and browse self-reported projects." },
    { id: "review", label: "Review", text: "Open an evaluation packet." },
    { id: "act", label: "Act", text: "Shortlist, request evidence, or invite." },
    { id: "manage", label: "Manage", text: "Track projects in the review queue." },
  ];
  return `<section class="workflow" aria-label="Funder workflow">
    ${steps
      .map(
        (step, index) => `<article class="${step.id === active ? "active" : ""}">
          <span>${index + 1}</span>
          <div><strong>${escapeHtml(step.label)}</strong><p>${escapeHtml(step.text)}</p></div>
        </article>`,
      )
      .join("")}
  </section>`;
}

function projectCard(project, featured = false) {
  return `<article class="card project-card">
    <div class="project-card-head">
      <h3>${escapeHtml(project.title)}</h3>
      <div class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)}</div>
      <div class="meta">${escapeHtml(project.sector)} · ${escapeHtml(project.subsector || "General")}</div>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">
        ${escapeHtml(builderName(project))}
        <span>${escapeHtml(builderRole(project))} · ${escapeHtml(projectCountForBuilder(project.builderId))} project${projectCountForBuilder(project.builderId) === 1 ? "" : "s"}</span>
      </button>
    </div>
    <p>${escapeHtml(project.description)}</p>
    <dl class="project-facts">
      <div><dt>Funding Need</dt><dd>${escapeHtml(project.fundingNeed)}</dd></div>
      <div><dt>Stage</dt><dd>${escapeHtml(project.stage)}</dd></div>
    </dl>
    <div class="badge-row">
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
      <span class="badge ${gatesFit(project) === "High" ? "green" : gatesFit(project) === "Medium" ? "blue" : ""}">GF Fit: ${escapeHtml(gatesFit(project))}</span>
    </div>
    <div class="card-footer">
      <span class="money">${featured ? "Featured gap" : "Evaluation packet"}</span>
      <div class="action-row">
        <button class="btn contact-builder-btn" data-project-id="${escapeHtml(project.id)}">Contact Builder</button>
        <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">${featured ? "View" : "View"}</button>
      </div>
    </div>
  </article>`;
}

function recommendationCard(project, signal) {
  return `<article class="card project-card recommendation-card">
    <div class="project-card-head">
      <h3>${escapeHtml(project.title)}</h3>
      <div class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)}</div>
      <div class="meta">${escapeHtml(project.sector)} · ${escapeHtml(project.subsector || "General")}</div>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">
        ${escapeHtml(builderName(project))}
        <span>${escapeHtml(builderRole(project))}</span>
      </button>
    </div>
    <p>${escapeHtml(project.description)}</p>
    <div class="metric-stack">
      <div>
        <span>Opportunity Gap</span>
        <strong>${escapeHtml(signal.gapScore)}/100</strong>
      </div>
      <div>
        <span>Funder Alignment</span>
        <strong>${escapeHtml(signal.alignmentScore)}/100</strong>
      </div>
    </div>
    <div class="badge-row">
      <span class="badge ${gapClass(project.opportunityGap)}">Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
    </div>
    <div class="card-footer">
      <span class="money">Recommended for review</span>
      <div class="action-row">
        <button class="btn contact-builder-btn" data-project-id="${escapeHtml(project.id)}">Contact Builder</button>
        <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">View</button>
      </div>
    </div>
  </article>`;
}

function pageHeader(id, title, subtitle, description = "", actions = "", portal = "Funder Portal") {
  return `<header class="page-header">
    <div>
      <div class="eyebrow">${escapeHtml(portal)}</div>
      <h1 id="${id}">${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(subtitle)}</p>
      ${description ? `<p class="lead">${escapeHtml(description)}</p>` : ""}
    </div>
    ${actions ? `<div class="badge-row">${actions}</div>` : ""}
  </header>`;
}

const flowColors = ["#1d5fd0", "#0d846a", "#9b5de5", "#d97706", "#dc2626", "#0891b2", "#64748b"];

function flowData() {
  return oecd.flowMap || { years: [], sectors: [], recipients: [], donorCountries: [], records: [] };
}

function mapPoint(item) {
  return {
    x: ((Number(item.lon) + 180) / 360) * 1000,
    y: ((90 - Number(item.lat)) / 180) * 520,
  };
}

function shortCountryName(country) {
  return String(country || "")
    .replace("China (People's Republic of)", "China")
    .replace("Democratic Republic of the Congo", "DRC")
    .replace("United Kingdom", "UK")
    .replace("United States", "US");
}

function flowAmountLabel(millions) {
  const value = Number(millions || 0);
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  if (value >= 1) return `$${value.toFixed(1)}M`;
  return `$${Math.round(value * 1000)}K`;
}

function flowRecordsForFilters() {
  const f = state.flow;
  return (flowData().records || []).filter((record) => {
    const sectorMatch = f.sector === "All sectors" || record.sector === f.sector;
    const yearMatch = f.year === "All years" || Number(record.year) === Number(f.year);
    return sectorMatch && yearMatch;
  });
}

function aggregateFlowRecipients() {
  const data = flowData();
  const byCountry = new Map();
  flowRecordsForFilters().forEach((record) => {
    const current = byCountry.get(record.country) || 0;
    byCountry.set(record.country, current + Number(record.amount || 0));
  });
  const baseByCountry = new Map((data.recipients || []).map((recipient) => [recipient.country, recipient]));
  const recipients = Array.from(byCountry.entries())
    .map(([country, amount]) => {
      const base = baseByCountry.get(country);
      return base ? { ...base, filteredAmount: amount, filteredAmountLabel: flowAmountLabel(amount) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.filteredAmount - a.filteredAmount);
  return recipients.length ? recipients : data.recipients || [];
}

function selectedFlowRecipient() {
  const recipients = aggregateFlowRecipients();
  if (!recipients.length) return null;
  if (!state.flow.recipient) return null;
  const selected = recipients.find((recipient) => recipient.country === state.flow.recipient);
  if (selected) return selected;
  state.flow.recipient = "";
  return null;
}

function flowCountryPoint(country) {
  const data = flowData();
  return [...(data.recipients || []), ...(data.donorCountries || [])].find((item) => item.country === country);
}

function filteredCountryProfile(country) {
  if (!country) {
    return { total: 0, totalLabel: "$0", topDonors: [], topSectors: [], yearTrend: [] };
  }
  const records = flowRecordsForFilters().filter((record) => record.country === country);
  const donorTotals = new Map();
  const sectorTotals = new Map();
  const yearTotals = new Map();
  let total = 0;
  records.forEach((record) => {
    const amount = Number(record.amount || 0);
    total += amount;
    donorTotals.set(record.donorCountry, (donorTotals.get(record.donorCountry) || 0) + amount);
    sectorTotals.set(record.sector, (sectorTotals.get(record.sector) || 0) + amount);
    yearTotals.set(record.year, (yearTotals.get(record.year) || 0) + amount);
  });
  const topDonors = Array.from(donorTotals.entries())
    .map(([donorCountry, amount]) => ({ donorCountry, amount, amountLabel: flowAmountLabel(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const topSectors = Array.from(sectorTotals.entries())
    .map(([sector, amount]) => ({ label: sector, amount, amountLabel: flowAmountLabel(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const yearTrend = (flowData().years || [2020, 2021, 2022, 2023]).map((year) => ({
    label: year,
    amount: yearTotals.get(year) || 0,
    amountLabel: flowAmountLabel(yearTotals.get(year) || 0),
  }));
  return { total, totalLabel: flowAmountLabel(total), topDonors, topSectors, yearTrend };
}

function flowArcPath(from, to, index) {
  const start = mapPoint(from);
  const end = mapPoint(to);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 8) {
    const loop = 30 + index * 7;
    return `M ${end.x.toFixed(1)} ${end.y.toFixed(1)} c ${loop} -${loop} ${loop * 1.7} ${loop} 0 ${loop * 1.2}`;
  }
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const lift = Math.min(125, Math.max(32, distance * 0.22)) + index * 7;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${midX.toFixed(1)} ${(midY - lift).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function markerRadius(amount, maxAmount, min = 7, max = 24) {
  const scale = Math.sqrt(Number(amount || 0) / Math.max(Number(maxAmount || 1), 1));
  return min + scale * (max - min);
}

function flowSelectOptions() {
  const data = flowData();
  const sectorOptions = (data.sectors || [{ label: "All sectors" }])
    .map((sector) => `<option value="${escapeHtml(sector.label)}" ${state.flow.sector === sector.label ? "selected" : ""}>${escapeHtml(sector.label)}</option>`)
    .join("");
  const yearOptions = ["All years", ...(data.years || [])]
    .map((year) => `<option value="${escapeHtml(year)}" ${String(state.flow.year) === String(year) ? "selected" : ""}>${escapeHtml(year)}</option>`)
    .join("");
  return `
    <label>Sector
      <select data-flow-filter="sector">${sectorOptions}</select>
    </label>
    <label>Year
      <select data-flow-filter="year">${yearOptions}</select>
    </label>
    <label>Top donor countries
      <select data-flow-filter="topN">
        ${[3, 5, 7].map((value) => `<option value="${value}" ${Number(state.flow.topN) === value ? "selected" : ""}>Top ${value}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderFlowMapSvg(recipient, profile) {
  const recipients = aggregateFlowRecipients();
  const maxRecipient = Math.max(...recipients.map((item) => item.filteredAmount || item.amount || 0), 1);
  const topDonors = recipient ? profile.topDonors.slice(0, Number(state.flow.topN || 5)) : [];
  const arcs = topDonors
    .map((donor, index) => {
      const donorPoint = flowCountryPoint(donor.donorCountry);
      if (!donorPoint) return "";
      const color = flowColors[index % flowColors.length];
      if (!recipient) return "";
      return `<path class="flow-arc" d="${flowArcPath(donorPoint, recipient, index)}" style="--arc-color:${color};" />`;
    })
    .join("");
  const donorMarkers = topDonors
    .map((donor, index) => {
      const donorPoint = flowCountryPoint(donor.donorCountry);
      if (!donorPoint) return "";
      const p = mapPoint(donorPoint);
      const color = flowColors[index % flowColors.length];
      return `<g class="flow-donor" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <circle r="7" fill="${color}"></circle>
        <text y="-12">${escapeHtml(shortCountryName(donor.donorCountry))}</text>
      </g>`;
    })
    .join("");
  const recipientMarkers = recipients
    .map((item) => {
      const p = mapPoint(item);
      const active = recipient && item.country === recipient.country;
      const radius = markerRadius(item.filteredAmount || item.amount, maxRecipient);
      return `<g class="flow-recipient ${active ? "active" : ""}" data-country="${escapeHtml(item.country)}" tabindex="0" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <circle r="${radius.toFixed(1)}"></circle>
        <text y="${(radius + 15).toFixed(1)}">${escapeHtml(shortCountryName(item.country))}</text>
      </g>`;
    })
    .join("");
  return `<svg class="flow-map-svg" viewBox="0 60 1000 420" role="img" aria-label="Donor country to recipient country funding flow map">
    <rect class="ocean" width="1000" height="520"></rect>
    <g class="graticule">
      ${[150, 300, 450, 600, 750, 900].map((x) => `<line x1="${x}" y1="34" x2="${x}" y2="486"></line>`).join("")}
      ${[110, 200, 290, 380, 470].map((y) => `<line x1="36" y1="${y}" x2="964" y2="${y}"></line>`).join("")}
    </g>
    <g class="continents" aria-hidden="true">
      <path d="M110,150 C150,80 265,70 330,130 C365,170 330,230 270,235 C220,238 210,292 160,276 C90,255 70,190 110,150 Z"></path>
      <path d="M275,285 C335,300 360,380 326,460 C294,520 242,470 236,410 C230,354 238,305 275,285 Z"></path>
      <path d="M480,128 C565,94 690,118 772,180 C835,226 815,305 725,316 C655,324 645,390 584,386 C518,382 522,305 468,286 C405,260 398,162 480,128 Z"></path>
      <path d="M505,275 C590,260 640,325 628,410 C620,470 555,476 522,420 C488,364 462,300 505,275 Z"></path>
      <path d="M742,352 C798,332 875,360 890,412 C854,452 770,454 735,420 C710,394 714,366 742,352 Z"></path>
    </g>
    <g class="flow-arcs">${arcs}</g>
    <g class="flow-donors">${donorMarkers}</g>
    <g class="flow-recipients">${recipientMarkers}</g>
  </svg>`;
}

function narrativeSummary(recipient, profile) {
  const firstDonor = profile.topDonors[0];
  const firstSector = profile.topSectors[0];
  const peakYear = [...profile.yearTrend].sort((a, b) => b.amount - a.amount)[0];
  if (!recipient || !firstDonor || !firstSector) {
    return "Select a country to surface the strongest donor, sector, and timing signals from the filtered dataset.";
  }
  return `${shortCountryName(recipient.country)} received ${profile.totalLabel} in the current view. ${shortCountryName(firstDonor.donorCountry)} is the largest donor-country source, while ${firstSector.label} is the dominant sector. The strongest year in this filtered slice is ${peakYear.label} at ${peakYear.amountLabel}.`;
}

function trendDelta(profile) {
  const trend = profile.yearTrend || [];
  const first = trend[0]?.amount || 0;
  const last = trend[trend.length - 1]?.amount || 0;
  if (!first && !last) return "No trend signal";
  const delta = last - first;
  const pct = first ? Math.round((delta / first) * 100) : 100;
  return `${delta >= 0 ? "+" : ""}${pct}% since ${trend[0]?.label || 2020}`;
}

function renderLeaderLens(recipient, profile) {
  const topDonor = profile.topDonors[0];
  const secondDonor = profile.topDonors[1];
  const topSector = profile.topSectors[0];
  const concentration = topDonor && profile.total ? Math.round((topDonor.amount / profile.total) * 100) : 0;
  const cofunding = secondDonor ? `${shortCountryName(secondDonor.donorCountry)} is the next largest source at ${secondDonor.amountLabel}.` : "No strong second donor-country signal in this slice.";
  const sectorShare = topSector && profile.total ? Math.round((topSector.amount / profile.total) * 100) : 0;
  const countryLabel = recipient ? shortCountryName(recipient.country) : "a recipient country";
  return `<section class="leader-lens grid four">
    <article class="leader-card">
      <span>Portfolio Concentration</span>
      <strong>${recipient ? `${concentration}%` : "Select"}</strong>
      <p>${recipient && topDonor ? `${shortCountryName(topDonor.donorCountry)} drives the largest share of ${countryLabel} funding.` : "Pick a country to see dependency on a single donor-country source."}</p>
    </article>
    <article class="leader-card">
      <span>Co-Funder Signal</span>
      <strong>${recipient && secondDonor ? shortCountryName(secondDonor.donorCountry) : "Open"}</strong>
      <p>${recipient ? cofunding : "Identify who else is already active before deciding whether to partner, follow, or avoid duplication."}</p>
    </article>
    <article class="leader-card">
      <span>Cause Mix</span>
      <strong>${recipient && topSector ? `${sectorShare}%` : "Lens"}</strong>
      <p>${recipient && topSector ? `${topSector.label} is the dominant cause area in this filtered view.` : "Use sector filters to test health, education, climate, and systems-change theses."}</p>
    </article>
    <article class="leader-card">
      <span>Timing Signal</span>
      <strong>${recipient ? escapeHtml(trendDelta(profile)) : "Trend"}</strong>
      <p>${recipient ? "Useful for spotting momentum, pullback, or a new opening for catalytic capital." : "Choose a country to see whether funding is rising or fading over time."}</p>
    </article>
  </section>`;
}

function renderCountryProfileDrawer(recipient, profile) {
  const openClass = recipient ? "open" : "";
  return `<aside class="flow-profile-drawer ${openClass}" aria-live="polite">
    <button class="flow-profile-close" type="button" aria-label="Close country profile">×</button>
    ${recipient ? `
      ${sectionHeader("Country Profile", "Decision lens for the selected recipient.")}
      <div class="profile-stat">
        <span>Total received</span>
        <strong>${escapeHtml(profile.totalLabel)}</strong>
      </div>
      <div class="profile-stat">
        <span>Top donor country</span>
        <strong>${escapeHtml(shortCountryName(profile.topDonors[0]?.donorCountry || "n/a"))}</strong>
      </div>
      <div class="mini-section">
        <h3>Top Donor Countries</h3>
        ${barList(profile.topDonors.slice(0, Number(state.flow.topN || 5)).map((donor) => ({ label: shortCountryName(donor.donorCountry), amount: donor.amount, amountLabel: donor.amountLabel })), "amount")}
      </div>
      <div class="mini-section">
        <h3>Sector DNA</h3>
        ${barList(profile.topSectors.slice(0, 5), "amount")}
      </div>
      <div class="mini-section">
        <h3>Year Trend</h3>
        <div id="profile-trend-chart" class="recharts-slot">${yearLineChart(profile.yearTrend, "amount")}</div>
      </div>
    ` : `
      ${sectionHeader("Select a Country", "Country profile appears here after a map selection.")}
      <p class="drawer-empty">Use the map to test where your foundation could coordinate with existing funders, spot concentration risk, or identify an under-served cause area.</p>
    `}
  </aside>`;
}

function loadScriptOnce(src, globalName) {
  if (globalName && window[globalName]) return Promise.resolve();
  const existing = document.querySelector(`script[data-visual-src="${src}"]`);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", resolve, { once: true });
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.visualSrc = src;
    script.onload = resolve;
    script.onerror = resolve;
    document.head.appendChild(script);
  });
}

function loadVisualizationLibraries() {
  if (visualLibrariesLoading) return visualLibrariesLoading;
  visualLibrariesLoading = Promise.all([
    loadScriptOnce("https://unpkg.com/deck.gl@8.9.35/dist.min.js", "deck"),
  ]).then(() => {
    renderOverview();
  });
  return visualLibrariesLoading;
}

function flowLngLat(country) {
  const point = flowCountryPoint(country);
  return point ? [Number(point.lon), Number(point.lat)] : null;
}

function mountDeckFlowMap(recipient, profile) {
  const container = $("#deck-flow-map");
  if (!container || !window.deck) return;
  const DeckGL = window.deck;
  if (activeFlowDeck) {
    activeFlowDeck.finalize();
    activeFlowDeck = null;
  }
  container.classList.add("deck-ready");

  const recipients = aggregateFlowRecipients().map((item) => ({
    ...item,
    position: [Number(item.lon), Number(item.lat)],
    kind: "recipient",
  }));
  const maxRecipient = Math.max(...recipients.map((item) => item.filteredAmount || item.amount || 0), 1);
  const arcData = recipient
    ? profile.topDonors.slice(0, Number(state.flow.topN || 5)).map((donor, index) => ({
        ...donor,
        kind: "arc",
        color: flowColors[index % flowColors.length],
        sourcePosition: flowLngLat(donor.donorCountry),
        targetPosition: flowLngLat(recipient.country),
      })).filter((item) => item.sourcePosition && item.targetPosition)
    : [];
  const donorPoints = arcData.map((item, index) => ({
    country: item.donorCountry,
    amount: item.amount,
    amountLabel: item.amountLabel,
    position: item.sourcePosition,
    color: flowColors[index % flowColors.length],
    kind: "donor",
  }));

  activeFlowDeck = new DeckGL.Deck({
    parent: container,
    initialViewState: { longitude: 18, latitude: 12, zoom: 1.18, pitch: 0, bearing: 0 },
    controller: true,
    layers: [
      new DeckGL.ArcLayer({
        id: "donor-recipient-arcs",
        data: arcData,
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        getSourceColor: (d) => hexToRgb(d.color, 210),
        getTargetColor: [13, 132, 106, 230],
        getWidth: (d) => Math.max(2, Math.sqrt(d.amount || 0) * 0.16),
        greatCircle: true,
        pickable: true,
      }),
      new DeckGL.ScatterplotLayer({
        id: "recipient-points",
        data: recipients,
        getPosition: (d) => d.position,
        getRadius: (d) => 42000 + Math.sqrt((d.filteredAmount || d.amount || 0) / maxRecipient) * 420000,
        getFillColor: (d) => (recipient && d.country === recipient.country ? [13, 132, 106, 230] : [29, 95, 208, 190]),
        getLineColor: [255, 255, 255, 230],
        lineWidthMinPixels: 2,
        pickable: true,
        stroked: true,
        onClick: ({ object }) => {
          if (!object?.country) return;
          state.flow.recipient = object.country;
          renderOverview();
        },
      }),
      new DeckGL.ScatterplotLayer({
        id: "donor-points",
        data: donorPoints,
        getPosition: (d) => d.position,
        getRadius: 105000,
        getFillColor: (d) => hexToRgb(d.color, 230),
        getLineColor: [255, 255, 255, 235],
        lineWidthMinPixels: 2,
        pickable: true,
        stroked: true,
      }),
      new DeckGL.TextLayer({
        id: "donor-labels",
        data: donorPoints,
        getPosition: (d) => d.position,
        getText: (d) => shortCountryName(d.country),
        getColor: [15, 23, 42, 235],
        getSize: 13,
        getTextAnchor: "middle",
        getAlignmentBaseline: "bottom",
        background: true,
        getBackgroundColor: [255, 255, 255, 210],
        backgroundPadding: [4, 2],
      }),
    ],
    getTooltip: ({ object }) => {
      if (!object) return null;
      const label = object.donorCountry || object.country;
      const amount = object.amountLabel || object.filteredAmountLabel || object.amountLabel;
      return `${shortCountryName(label)}${amount ? `\n${amount}` : ""}`;
    },
  });
}

function hexToRgb(hex, alpha = 255) {
  const clean = String(hex || "#1d5fd0").replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, alpha];
}

function mountRechartsTrend(profile) {
  const el = $("#profile-trend-chart");
  if (!el || !window.React || !window.ReactDOM || !window.Recharts || !profile?.yearTrend?.length) return;
  const React = window.React;
  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } = window.Recharts;
  const root = window.ReactDOM.createRoot(el);
  root.render(
    React.createElement(
      ResponsiveContainer,
      { width: "100%", height: 168 },
      React.createElement(
        LineChart,
        { data: profile.yearTrend.map((item) => ({ year: item.label, amount: Number(item.amount || 0) })) },
        React.createElement(XAxis, { dataKey: "year", tickLine: false, axisLine: false }),
        React.createElement(YAxis, { hide: true }),
        React.createElement(Tooltip, {
          formatter: (value) => flowAmountLabel(value),
          labelFormatter: (label) => `Year ${label}`,
        }),
        React.createElement(Line, {
          type: "monotone",
          dataKey: "amount",
          stroke: "#1d5fd0",
          strokeWidth: 3,
          dot: { r: 4, fill: "#0d846a", strokeWidth: 0 },
        }),
      ),
    ),
  );
}

function renderOverview() {
  const data = flowData();
  const recipient = selectedFlowRecipient();
  const profile = filteredCountryProfile(recipient?.country);
  const recipients = aggregateFlowRecipients();
  if (!recipients.length) {
    $("#overview").innerHTML = pageHeader("overview-title", "Follow the Money", "No flow-map data is available yet.");
    return;
  }
  const metrics = oecd.metrics || {};
  $("#overview").innerHTML = `
    ${pageHeader(
      "overview-title",
      "Follow the Money",
      "Interactive donor-country to recipient-country funding flows from the OECD private philanthropy dataset.",
      "Hover over a recipient country to reveal the donor countries funding projects there. Regional and unspecified buckets are kept out of the map so real countries do not get visually drowned out.",
      `<span class="badge blue">Amounts are USD millions</span><span class="badge green">2020-2023</span>`,
      "Product Track Dashboard",
    )}
    <section class="grid four">
      ${kpi("Total Funding", metrics.totalFundingLabel || "$68.2B")}
      ${kpi("Mapped Flow Slice", data.sectors?.[0]?.amountLabel || "$36.1B")}
      ${kpi("Recipient Countries", String((data.recipients || []).length))}
      ${kpi("Donor Countries", String((data.donorCountries || []).length))}
    </section>
    ${renderLeaderLens(recipient, profile)}
    <section class="flow-toolbar section">
      ${flowSelectOptions()}
    </section>
    <section class="flow-dashboard section">
      <article class="flow-map-panel">
        <div class="flow-map-head">
          <div>
            <h2>${escapeHtml(recipient?.country || "Select a recipient country")}</h2>
            <p>${recipient ? `${escapeHtml(recipient.regionMacro || recipient.region || "Mapped recipient")} · global recipient rank #${escapeHtml(recipient.rank || "n/a")}` : "Deck.gl ArcLayer flow map · click a country to open the foundation leader profile"}</p>
          </div>
          <strong>${escapeHtml(recipient ? profile.totalLabel : "Explore")}</strong>
        </div>
        <div id="deck-flow-map" class="deck-flow-map">
          ${renderFlowMapSvg(recipient, profile)}
        </div>
        ${renderCountryProfileDrawer(recipient, profile)}
        <div class="flow-map-footer">
          <span>Deck.gl ArcLayer + ScatterplotLayer when available</span>
          <span>Static SVG fallback for offline demos</span>
        </div>
      </article>
    </section>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Leader Questions", "What a foundation leader can decide from this view.")}
        <div class="decision-list">
          <p><strong>Where are we duplicating?</strong> Compare dominant donor countries before adding more capital.</p>
          <p><strong>Where can we co-fund?</strong> Find active peer funders already moving money into the same place.</p>
          <p><strong>Where is the cause mix too narrow?</strong> Use Sector DNA to see whether health, education, climate, or systems work is crowded or under-served.</p>
          <p><strong>Is momentum changing?</strong> Use the year signal to spot pullbacks, surges, or timing windows.</p>
        </div>
      </article>
      <article class="card insight-card">
        ${sectionHeader("Narrative Summary", "Ready to swap for Claude-generated summaries after API wiring.")}
        <p>${escapeHtml(narrativeSummary(recipient, profile))}</p>
        <div class="badge-row">
          ${(data.ignoredBuckets || []).slice(0, 3).map((bucket) => `<span class="badge amber">Excluded: ${escapeHtml(bucket.label)} ${escapeHtml(bucket.amountLabel)}</span>`).join("")}
        </div>
      </article>
    </section>
  `;
  mountDeckFlowMap(recipient, profile);
  loadVisualizationLibraries();
}

function renderOpportunityAtlas() {
  const recommendations = recommendedProjects(3);
  const countryCount = new Set(projects.map((project) => project.country)).size;
  const highGapCount = projects.filter((project) => project.opportunityGap === "High" || project.opportunityGap === "Medium-High").length;
  const pilotReadyCount = projects.filter((project) => project.readiness === "Pilot-ready").length;
  $("#opportunity-atlas").innerHTML = `
    ${pageHeader(
      "opportunity-atlas-title",
      "Project Pipeline",
      `${escapeHtml(FUNDER_ACCOUNT.name)} · ${escapeHtml(FUNDER_ACCOUNT.description)}`,
      "First Spark turns self-reported local projects into structured, funder-readable opportunity profiles, helping opportunity providers discover young builders beyond traditional credentials and networks.",
    )}
    <section class="grid four">
      ${kpi("Submitted Projects", projects.length)}
      ${kpi("Countries Represented", countryCount)}
      ${kpi("High Gap Projects", highGapCount)}
      ${kpi("Pilot-Ready Projects", pilotReadyCount)}
    </section>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Projects by Sector", "Submitted local projects by primary impact area.")}
        ${barList(manualSector)}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Projects by Region", "Geographic distribution of submitted project signals.")}
        ${barList(manualRegion)}
      </article>
    </section>
    <section class="section">
      ${sectionHeader("Recommended for " + escapeHtml(FUNDER_ACCOUNT.name), "Ranked by opportunity gap and alignment with your portfolio focus areas. This is a review-priority signal, not a quality judgment.")}
      <div class="grid three">
        ${recommendations.map(({ project, signal }) => recommendationCard(project, signal)).join("")}
      </div>
    </section>
    <section class="section note-panel">
      <strong>Responsible recommendation boundary:</strong> First Spark does not automatically decide who deserves funding. It helps funders discover, compare, and review overlooked local projects.
    </section>
  `;
}

function filterOptions(label, key, options) {
  return `<label>${escapeHtml(label)}
    <select data-filter="${escapeHtml(key)}">
      ${options.map((option) => `<option ${state.filters[key] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select>
  </label>`;
}

function matchesFilter(project) {
  const f = state.filters;
  const sectorMatch =
    f.sector === "All" ||
    project.sector === f.sector ||
    project.sector.split(" / ").includes(f.sector);
  return (
    (f.country === "All" || project.country === f.country) &&
    sectorMatch &&
    (f.stage === "All" || project.stage === f.stage) &&
    (f.readiness === "All" || project.readinessFilter === f.readiness) &&
    (f.gap === "All" || project.opportunityGap === f.gap) &&
    project.verification === "Self-reported"
  );
}

function projectCountryOptions() {
  return ["All", ...Array.from(new Set(projects.map((project) => project.country))).sort()];
}

function renderDiscovery() {
  const visible = projects.filter(matchesFilter);
  $("#discovery").innerHTML = `
    ${pageHeader(
      "discovery-title",
      "Discover Projects",
      "Browse self-reported projects from young builders and grassroots teams.",
    )}
    <section class="filter-panel" aria-label="Project filters">
      ${filterOptions("Country", "country", projectCountryOptions())}
      ${filterOptions("Sector", "sector", ["All", "Education", "Health", "Climate", "Agriculture", "Civic Tech"])}
      ${filterOptions("Stage", "stage", ["All", "Idea", "Prototype", "Pilot-ready", "Active users"])}
      ${filterOptions("Readiness", "readiness", ["All", "Early-stage", "Pilot-oriented", "Pilot-ready"])}
      ${filterOptions("Opportunity Gap", "gap", ["All", "Low", "Medium", "Medium-High", "High"])}
      ${filterOptions("Verification", "verification", ["Self-reported"])}
    </section>
    <section class="section">
      <div class="grid three">
        ${visible.length ? visible.map((project) => projectCard(project)).join("") : `<div class="empty">No projects match the selected filters.</div>`}
      </div>
    </section>
  `;
}

function formatMillions(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${Math.round(value)}M`;
}

function gfQueueCard(project) {
  return `<article class="queue-card">
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
      <p class="meta">${escapeHtml(project.recipient)}</p>
    </div>
    <div class="badge-row">
      <span class="badge green">OECD Funded</span>
      <span class="badge blue">$${escapeHtml(String(project.amount))}M · ${escapeHtml(String(project.year))}</span>
    </div>
  </article>`;
}

function gfHistoryCard(project) {
  return `<article class="history-item">
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
      <p class="meta">${escapeHtml(project.recipient)}</p>
    </div>
    <div class="activity-stats">
      <div><span>Recorded Amount</span><strong>$${escapeHtml(String(project.amount))}M</strong></div>
      <div><span>Year</span><strong>${escapeHtml(String(project.year))}</strong></div>
      <div><span>Source</span><strong>OECD / Gates Foundation</strong></div>
    </div>
  </article>`;
}

function queueProjectCard(project) {
  return `<article class="queue-card">
    <button class="queue-card-remove" data-remove-project="${escapeHtml(project.id)}" title="Remove from queue">×</button>
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.sector)}</p>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
    </div>
    <div class="badge-row">
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
    </div>
    <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">View</button>
  </article>`;
}

function fundedProjectCard(project) {
  const intel = getIntel(project.id);
  return `<article class="history-item">
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
      <p class="meta">Recorded by ${escapeHtml(FUNDER_ACCOUNT.name)} as a demo funding decision.</p>
    </div>
    <div class="badge-row">
      <span class="badge green">Funding status: Funded</span>
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
    </div>
    <div class="activity-stats">
      <div><span>Recorded Amount</span><strong>${escapeHtml(getRecordedAmount(project))} <button class="edit-amount-btn" data-project-id="${escapeHtml(project.id)}">Edit</button></strong></div>
      <div><span>Stage</span><strong>${escapeHtml(project.stage)}</strong></div>
      <div><span>Funding Context</span><strong>${escapeHtml(intel.potentialFunders?.length ? "Matched OECD funder signals" : "Limited dataset coverage")}</strong></div>
    </div>
    <div class="action-row">
      <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">Open Evaluation Packet</button>
    </div>
  </article>`;
}

function renderQueueGroup(title, status) {
  const grouped = projects.filter((project) => getReviewStatus(project) === status);
  const gfExtra = status === "Funded" ? gfFundedProjects : [];
  const total = grouped.length + gfExtra.length;
  return `<section class="card queue-group">
    ${sectionHeader(title, `${total} project${total === 1 ? "" : "s"}`)}
    <div class="queue-list">
      ${total
        ? grouped.map(queueProjectCard).join("") + gfExtra.map(gfQueueCard).join("")
        : `<div class="empty">No projects in this status yet.</div>`}
    </div>
  </section>`;
}

function renderQueue() {
  $("#queue").innerHTML = `
    ${pageHeader(
      "queue-title",
      "Review Queue",
      "Manage project review statuses after discovery and evaluation.",
    )}
    <section class="queue-grid">
      ${renderQueueGroup("Shortlisted", "Shortlisted")}
      ${renderQueueGroup("Evidence Requested", "Evidence requested")}
      ${renderQueueGroup("Invited to Apply", "Invited to apply")}
      ${renderQueueGroup("Funded", "Funded")}
    </section>
  `;
}

function renderFunderHistory() {
  const target = $("#funder-history");
  if (!target) return;
  const funded = projects.filter((project) => getReviewStatus(project) === "Funded");
  const demoFundedMM = funded.reduce((sum, project) => sum + fundingAmountValue(getRecordedAmount(project)), 0);
  const gfFundedMM = gfFundedProjects.reduce((sum, p) => sum + p.amount, 0);
  const activePipeline = projects.filter((project) => ["Shortlisted", "Evidence requested", "Invited to apply"].includes(getReviewStatus(project))).length;
  const totalCount = funded.length + gfFundedProjects.length;
  target.innerHTML = `
    ${pageHeader(
      "funder-history-title",
      "Funding History",
      "Track projects your funder team has marked as funded in this demo workflow.",
    )}
    <section class="grid three">
      ${kpi("Funded Projects", totalCount)}
      ${kpi("Recorded Funding", formatMillions(demoFundedMM + gfFundedMM))}
      ${kpi("Active Pipeline", activePipeline)}
    </section>
    <section class="section card">
      ${sectionHeader("Recorded Funding History", "Projects marked funded from the Evaluation Packet action bar.")}
      ${totalCount
        ? `<div class="history-list">${funded.map(fundedProjectCard).join("")}${gfFundedProjects.map(gfHistoryCard).join("")}</div>`
        : `<div class="empty">No funded projects recorded yet. Open an Evaluation Packet and click Record Funding to add one here.</div>`}
    </section>
    <section class="section note-panel">
      <strong>Demo record only:</strong> Recording funding here does not execute a financial transaction. It only helps funders track which projects they have marked as funded inside this prototype.
    </section>
  `;
}

function builderStats(builderId) {
  const builderProjectsList = projectsForBuilder(builderId);
  return builderProjectsList.reduce(
    (totals, project) => {
      const activity = getBuilderActivity(project);
      totals.projectViews += Number(activity.projectViews || 0);
      totals.profileViews += Number(activity.profileViews || 0);
      totals.searchAppearances += Number(activity.searchAppearances || 0);
      return totals;
    },
    { projectViews: 0, profileViews: 0, searchAppearances: 0 },
  );
}

function renderBuilderProfilePage() {
  const target = $("#builder-profile");
  if (!target) return;
  const builderId = state.selectedBuilderId || projects[0].builderId;
  const builderProjectList = projectsForBuilder(builderId);
  const primaryProject = builderProjectList[0] || projects[0];
  const stats = builderStats(builderId);
  target.innerHTML = `
    ${pageHeader(
      "builder-profile-title",
      builderName(primaryProject),
      `${builderRole(primaryProject)} · ${builderLocation(primaryProject)}`,
      "Builder profiles help funders understand who is behind self-reported project submissions without treating credentials as proof of quality.",
      `<button class="btn primary contact-builder-btn" data-project-id="${escapeHtml(primaryProject.id)}">Contact Builder</button>`,
    )}
    <section class="grid four">
      ${kpi("Submitted Projects", builderProjectList.length)}
      ${kpi("Project Views", stats.projectViews)}
      ${kpi("Profile Views", stats.profileViews)}
      ${kpi("Search Appearances", stats.searchAppearances)}
    </section>
    <section class="section card">
      ${sectionHeader("Builder Projects", "Self-reported projects connected to this builder profile.")}
      <div class="grid three">
        ${builderProjectList.map((project) => projectCard(project)).join("")}
      </div>
    </section>
    <section class="section note-panel">
      <strong>Profile view signal:</strong> Opening this profile increments builder profile views. Opening an Evaluation Packet increments project views.
    </section>
  `;
}

function getProject(id = state.selectedProjectId) {
  return projects.find((project) => project.id === id) || projects[0];
}

function getIntel(projectId) {
  const project = getProject(projectId);
  const precomputed = oecd.projectIntel?.[projectId];
  const generated = generateFundingContext(project);
  if (precomputed) {
    return {
      ...precomputed,
      fallback: "",
      coverageNote:
        "Funder relevance is based on available OECD funding records. Funders not represented in the dataset may not appear in this list.",
    };
  }
  return {
    ...generated,
    gapSignal: {
      label: computeGap(project, generated),
      interpretation: "This is a funding-pattern signal for further review, not a conclusion about merit or investability.",
    },
    coverageNote:
      "Funder relevance is based on available OECD funding records. Funders not represented in the dataset may not appear in this list.",
  };
}

function renderProfileField(label, value, wide = false) {
  return `<div class="field${wide ? " full" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>`;
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderChipList(items, tone = "blue") {
  return `<div class="chip-list">
    ${items.map((item) => `<span class="chip ${tone}">${escapeHtml(item)}</span>`).join("")}
  </div>`;
}

function renderEvidenceStatus(project) {
  const evidence = evidenceItems(project);
  return `<article class="card evidence-card">
    ${sectionHeader("Evidence Status", "Self-reported does not mean verified. This section helps funders see what evidence is available and what should be requested next.")}
    <span class="badge green">Verification status: Self-reported</span>
    <div class="split-list section">
      <div>
        <h3>Available Evidence</h3>
        ${evidence.available.length ? renderList(evidence.available) : `<p class="meta">No supporting evidence fields have been provided yet.</p>`}
      </div>
      <div>
        <h3>Missing Evidence</h3>
        ${renderList(evidence.missing.length ? evidence.missing : ["No major evidence gaps flagged by the current form."])}
      </div>
    </div>
  </article>`;
}

function latestViewerLabel(activity) {
  const latest = activity.viewers?.[0];
  if (!latest) return "No profile views yet";
  return `${latest.role} at ${latest.organization}`;
}

function renderBuilderHistory(projectList) {
  if (!projectList.length) {
    return `<div class="empty">No submitted projects yet. Submit a project to build your creator history.</div>`;
  }

  return `<div class="history-list">
    ${projectList
      .map((project) => {
        const activity = getBuilderActivity(project);
        const reviewStatus = getReviewStatus(project);
        return `<article class="history-item">
          <div>
            <h3>${escapeHtml(project.title)}</h3>
            <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
            <p class="meta">Submitted ${escapeHtml(formatDate(activity.submittedAt || project.submittedAt))}</p>
          </div>
          <div class="badge-row">
            <span class="badge green">Verification: Self-reported</span>
            <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
            <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
            <span class="badge ${reviewStatusClass(reviewStatus)}">${escapeHtml(reviewStatus)}</span>
          </div>
          <div class="action-row">
            <button class="btn contact-funder-btn" data-project-id="${escapeHtml(project.id)}">Contact Funder</button>
            <button class="btn primary submission-detail-btn" data-project-id="${escapeHtml(project.id)}">View Detail</button>
          </div>
        </article>`;
      })
      .join("")}
  </div>`;
}

function builderNotifications(projectList) {
  return projectList.flatMap((project) => {
    const activity = getBuilderActivity(project);
    const intel = getIntel(project.id);
    const topFunder = intel.potentialFunders?.[0];
    const notifications = [];

    if (topFunder) {
      notifications.push({
        label: "Funder recommendation",
        title: `${topFunder.name} appeared as a potentially relevant funder`,
        text: `${topFunder.reason} This is a relevance signal from available OECD funding records, not a funding decision.`,
        date: activity.submittedAt,
      });
    } else {
      notifications.push({
        label: "Coverage note",
        title: `Limited funder patterns found for ${project.title}`,
        text: "No strong funder patterns were found in the available records. This may reflect dataset coverage, not lack of project value.",
        date: activity.submittedAt,
      });
    }

    if (activity.searchAppearances) {
      notifications.push({
        label: "Search visibility",
        title: `${project.title} appeared in ${activity.searchAppearances} funder search${activity.searchAppearances === 1 ? "" : "es"}`,
        text: "Search appearances are counted when the self-reported profile appears in the Funder Discovery dashboard during this demo session.",
        date: activity.lastSearchAt || activity.submittedAt,
      });
    }

    if (activity.projectViews) {
      const latest = activity.projectViewers?.[0];
      notifications.push({
        label: "Project view",
        title: latest ? `${latest.role} at ${latest.organization} opened your Evaluation Packet` : `${project.title} received a project view`,
        text: "Project views are counted when a funder opens the project's Evaluation Packet in this browser.",
        date: activity.lastProjectViewedAt || activity.submittedAt,
      });
    }

    if (activity.profileViews) {
      const latest = activity.viewers?.[0];
      notifications.push({
        label: "Profile view",
        title: latest ? `${latest.role} at ${latest.organization} viewed your profile` : `${project.title} received a profile view`,
        text: "Profile views are counted when a funder clicks the builder name or opens the builder profile.",
        date: activity.lastProfileViewedAt || activity.submittedAt,
      });
    }

    const reviewStatus = getReviewStatus(project);
    if (reviewStatus !== "Not reviewed") {
      notifications.push({
        label: "Review status",
        title: `${project.title} is now marked: ${reviewStatus}`,
        text: "This status reflects funder actions taken inside the current First Spark demo workflow.",
        date: activity.lastViewedAt || activity.submittedAt,
      });
    }

    return notifications;
  });
}

function renderBuilderNotifications(projectList) {
  const notifications = builderNotifications(projectList).slice(0, 8);
  if (!projectList.length) {
    return `<div class="empty">Notifications will appear after you submit a project.</div>`;
  }
  if (!notifications.length) {
    return `<div class="empty">No notifications yet.</div>`;
  }

  return `<div class="notification-list">
    ${notifications
      .map(
        (item) => `<article class="notification-item">
          <div class="notification-dot" aria-hidden="true"></div>
          <div>
            <div class="notification-topline">
              <span class="badge blue">${escapeHtml(item.label)}</span>
              <span class="meta">${escapeHtml(formatDate(item.date))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </article>`,
      )
      .join("")}
  </div>`;
}

function renderBuilderDashboard() {
  const submitted = builderProjects();
  const activities = submitted.map((project) => getBuilderActivity(project));
  const searchTotal = activities.reduce((sum, a) => sum + Number(a.searchAppearances || 0), 0);
  const projectViewTotal = activities.reduce((sum, a) => sum + Number(a.projectViews || 0), 0);
  const profileViewTotal = activities.reduce((sum, a) => sum + Number(a.profileViews || 0), 0);
  return `<section class="grid four">
    ${kpi("Submitted Profiles", submitted.length)}
    ${kpi("Appeared in Searches", searchTotal)}
    ${kpi("Project Views", projectViewTotal)}
    ${kpi("Profile Views", profileViewTotal)}
  </section>`;
}

function renderBuilderHistoryPage() {
  const target = $("#builder-history");
  if (!target) return;
  const submitted = builderProjects();
  target.innerHTML = `
    ${pageHeader(
      "builder-history-title",
      "Submission History",
      "Review the self-reported opportunity profiles you have submitted.",
      "",
      "",
      "Builder Portal",
    )}
    <section class="section card">
      ${sectionHeader("Submission History", "Projects you submitted through the Builder Portal.")}
      ${renderBuilderHistory(submitted)}
    </section>
  `;
}

function renderSubmissionDetailPage() {
  const target = $("#submission-detail");
  if (!target) return;
  const project = getProject();
  const evidenceUrl = safeExternalUrl(project.evidenceLink);
  target.innerHTML = `
    ${pageHeader(
      "submission-detail-title",
      project.title,
      "Submitted project record as it appears in your Builder Portal history.",
      "",
      `<button class="btn route-btn" data-page="builder-history" type="button">Back to History</button>`,
      "Builder Portal",
    )}
    <section class="card">
      <div class="card-head-row">
        ${sectionHeader("Submitted Project Detail", "Review the information you submitted for funder screening.")}
        ${evidenceUrl ? `<a class="btn primary" href="${escapeHtml(evidenceUrl)}" target="_blank" rel="noopener noreferrer">Open Evidence Link</a>` : ""}
      </div>
      <div class="profile-grid">
        ${renderProfileField("Builder", builderName(project))}
        ${renderProfileField("Builder Role", builderRole(project))}
        ${renderProfileField("Project Title", project.title)}
        ${renderProfileField("Country", project.country)}
        ${renderProfileField("Region", project.region)}
        ${renderProfileField("Sector", project.sector)}
        ${renderProfileField("Subsector", project.subsector)}
        ${renderProfileField("Target Beneficiaries", project.beneficiaries)}
        ${renderProfileField("Current Stage", project.stage)}
        ${renderProfileField("Funding Need", project.fundingNeed)}
        ${renderProfileField("Verification Status", project.verification)}
        ${renderProfileField("Readiness", project.readiness)}
        ${renderProfileField("Opportunity Gap", project.opportunityGap)}
        ${project.evidenceLink ? renderProfileField("Evidence Link", project.evidenceLink) : ""}
        ${project.pilotPartner ? renderProfileField("Pilot / Local Partner", project.pilotPartner) : ""}
        ${project.usersReached ? renderProfileField("Current Users / Beneficiaries", project.usersReached) : ""}
        ${project.budgetBreakdown ? renderProfileField("Budget Breakdown", project.budgetBreakdown) : ""}
        ${project.teamBackground ? renderProfileField("Team Background", project.teamBackground) : ""}
        ${project.tractionEvidence ? renderProfileField("Traction / Evidence", project.tractionEvidence) : ""}
        ${project.impactMeasurement ? renderProfileField("Impact Measurement Plan", project.impactMeasurement) : ""}
      </div>
      <div class="section card-detail-block">
        <span>Project Description</span>
        <p>${escapeHtml(project.description)}</p>
      </div>
    </section>
  `;
}

function renderBuilderNotificationsPage() {
  const target = $("#builder-notifications");
  if (!target) return;
  const submitted = builderProjects();
  target.innerHTML = `
    ${pageHeader(
      "builder-notifications-title",
      "Notifications",
      "Track funder relevance, search visibility, and profile-view signals.",
      "",
      "",
      "Builder Portal",
    )}
    ${renderBuilderDashboard()}
    <section class="section card">
      ${sectionHeader("Funder Signals", "Demo notifications inspired by professional profile and pipeline workflows.")}
      ${renderBuilderNotifications(submitted)}
      <div class="section note-panel">
        <strong>Demo visibility signals:</strong> These notifications come from local browser activity in this prototype. They are not verified outreach, funding offers, or real-time analytics.
      </div>
    </section>
  `;
}

function renderSimilarTable(records) {
  if (!records.length) {
    return `<div class="empty">No strong historical matches were found in the available OECD records. This does not mean the project is not valuable; it means the current dataset has limited coverage for this project area.</div>`;
  }
  const rows = records.slice(0, 6).map(
    (record) => `<tr>
      <td><strong>${escapeHtml(record.title)}</strong><br><span class="meta">${escapeHtml(truncateText(record.description || "No project description available."))}</span></td>
      <td>${escapeHtml(record.donor)}</td>
      <td>${escapeHtml(record.country)}</td>
      <td>${escapeHtml(record.sector)}</td>
      <td>${escapeHtml(record.year || "N/A")}</td>
      <td>${escapeHtml(record.amountLabel)}</td>
      <td>${escapeHtml(record.relevance)}</td>
    </tr>`,
  );
  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Project / Recipient Title</th>
          <th>Donor</th>
          <th>Country</th>
          <th>Sector</th>
          <th>Year</th>
          <th>Amount</th>
          <th>Relevance</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  </div>`;
}

function renderFunders(funders) {
  if (!funders.length) {
    return `<div class="empty">No strong funder patterns were found in the available records. This may reflect dataset coverage, not lack of project value.</div>`;
  }
  return `<div class="grid three">
    ${funders
      .slice(0, 3)
      .map(
        (funder) => `<article class="card">
          <h3>${escapeHtml(funder.name)}</h3>
          <div class="badge-row">
            <span class="badge ${fitClass(funder.fit)}">Fit: ${escapeHtml(funder.fit)}</span>
            <span class="badge green">Matched funding: ${escapeHtml(funder.amountLabel)}</span>
          </div>
          <p class="meta">${escapeHtml(funder.reason)}</p>
        </article>`,
      )
      .join("")}
  </div>`;
}

function renderReadinessPanel(project, readiness) {
  const strengths = [
    project.description ? "Problem described" : "Problem needs detail",
    project.beneficiaries ? "Beneficiaries named" : "Beneficiaries unclear",
    project.stage ? `${project.stage} stage` : "Stage missing",
    project.fundingNeed ? "Funding ask stated" : "Funding ask missing",
  ];
  const reviewFlags = needsReviewItems(project).slice(0, 5);
  const questions = [
    "Demo or screenshots?",
    "Pilot partner letter?",
    "Budget breakdown?",
    "Beneficiaries reached?",
    "Outcome to measure?",
  ];

  return `<section class="section card readiness-card">
    ${sectionHeader("Readiness & Risks", "Quick scan of what looks reviewable and what still needs evidence.")}
    <div class="readiness-summary">
      <div>
        <span>Readiness</span>
        <strong>${escapeHtml(readiness)}</strong>
      </div>
      <div>
        <span>Stage</span>
        <strong>${escapeHtml(project.stage)}</strong>
      </div>
      <div>
        <span>Needs Review</span>
        <strong>${escapeHtml(reviewFlags.length)}</strong>
      </div>
    </div>
    <div class="readiness-grid section">
      <div>
        <h3>Ready Signals</h3>
        ${renderChipList(strengths, "green")}
      </div>
      <div>
        <h3>Review Flags</h3>
        ${renderChipList(reviewFlags, "amber")}
      </div>
    </div>
    <div class="section">
      <h3>Key Review Questions</h3>
      <div class="question-grid">
        ${questions.map((question, index) => `<span><b>${index + 1}</b>${escapeHtml(question)}</span>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderDetail() {
  const project = getProject();
  const intel = getIntel(project.id);
  const gap = intel.gapSignal || {};
  const gapLabel = project.opportunityGap || gap.label || "Unknown / Needs more data";
  const reviewStatus = getReviewStatus(project);
  const readiness = project.readiness || computeReadiness(project);
  const gapReasons = project.gapRationale || gapRationale(project, intel);
  const stageClass = project.stage === "Pilot-ready" ? "green" : project.stage === "Idea" ? "amber" : "blue";
  const recommendation = recommendationSignal(project);
  const evidenceUrl = safeExternalUrl(project.evidenceLink);
  $("#detail").innerHTML = `
    ${pageHeader(
      "detail-title",
      project.title,
      `${project.country} · ${project.sector} · ${project.stage}`,
      "",
      `<button class="btn review-action" data-action="shortlist">Shortlist</button>
       <button class="btn review-action" data-action="evidence">Request Evidence</button>
       <button class="btn review-action" data-action="invite">Invite to Apply</button>
       <button class="btn contact-builder-btn" data-project-id="${escapeHtml(project.id)}">Contact Builder</button>
       <button class="btn primary review-action" data-action="funded">Record Funding</button>`,
    )}
    ${state.reviewMessage ? `<div class="toast">${escapeHtml(state.reviewMessage)}</div>` : ""}
    <section class="packet-strip">
      <article><span>Packet Type</span><strong>Funder Review</strong></article>
      <article><span>Primary Need</span><strong>${escapeHtml(project.fundingNeed)} pilot grant</strong></article>
      <article><span>Verification</span><strong>Self-reported</strong></article>
      <article><span>OECD Layer</span><strong>Funding intelligence</strong></article>
    </section>
    <section class="section">
      <article class="card">
        <div class="card-head-row">
          ${sectionHeader("Project Snapshot", "Structured project record prepared for funder screening.")}
          ${evidenceUrl ? `<a class="btn primary" href="${escapeHtml(evidenceUrl)}" target="_blank" rel="noopener noreferrer">Open Evidence Link</a>` : ""}
        </div>
        <div class="profile-grid">
          ${renderProfileField("Project", project.title)}
          <div class="field">
            <span>Builder</span>
            <strong>
              <button class="builder-link inline" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
            </strong>
          </div>
          ${renderProfileField("Builder Role", builderRole(project))}
          ${renderProfileField("Country", project.country)}
          ${renderProfileField("Region", project.region)}
          ${renderProfileField("Sector", project.sector)}
          ${renderProfileField("Subsector", project.subsector)}
          ${renderProfileField("Beneficiaries", project.beneficiaries)}
          <div class="field ${stageClass}"><span>Stage</span><strong>${escapeHtml(project.stage)}</strong></div>
          <div class="field blue"><span>Funding Need</span><strong>${escapeHtml(project.fundingNeed)} pilot grant</strong></div>
          <div class="field green"><span>Verification</span><strong>${escapeHtml(project.verification)}</strong></div>
          <div class="field ${reviewStatusClass(reviewStatus)}"><span>Current Review Status</span><strong>${escapeHtml(reviewStatus)}</strong></div>
          ${project.pilotPartner ? renderProfileField("Pilot / Local Partner", project.pilotPartner) : ""}
          ${project.usersReached ? renderProfileField("Current Users / Beneficiaries", project.usersReached) : ""}
          ${project.budgetBreakdown ? renderProfileField("Budget Breakdown", project.budgetBreakdown) : ""}
          ${project.teamBackground ? renderProfileField("Team Background", project.teamBackground) : ""}
          ${project.tractionEvidence ? renderProfileField("Traction / Evidence", project.tractionEvidence) : ""}
          ${project.impactMeasurement ? renderProfileField("Impact Measurement Plan", project.impactMeasurement) : ""}
        </div>
        <div class="section note-panel"><strong>Verification status: Self-reported.</strong></div>
      </article>
    </section>
    <section class="section card">
      ${sectionHeader("Funding Context", "A funding-intelligence view of where this project fits in historical philanthropy patterns.")}
      <p class="lead">This section does not evaluate the builder or prove project quality. It uses OECD funding records to show whether similar themes, countries, sectors, or funders have appeared in past philanthropy activity.</p>
      <div class="badge-row section">
        <span class="badge blue">Funder Alignment: ${escapeHtml(recommendation.alignmentScore)}/100</span>
        <span class="badge green">${escapeHtml(intel.similarProjects?.length || 0)} similar records</span>
        <span class="badge amber">Dataset coverage may be incomplete</span>
      </div>
      <div class="section">
        <h3>Potentially Relevant Funders</h3>
        ${renderFunders(intel.potentialFunders || [])}
      </div>
      <div class="section funding-table-section">
        <h3>Similar Funded Projects from OECD Records</h3>
        ${renderSimilarTable(intel.similarProjects || [])}
      </div>
      <div class="section note-panel"><strong>Similar funded projects indicate funder relevance, not proof of project quality.</strong> ${escapeHtml(intel.coverageNote)}</div>
    </section>

    <section class="section card">
      ${sectionHeader("Opportunity Gap", "Funding-pattern context for responsible investigation.")}
      <div class="badge-row">
        <span class="badge ${gapClass(gapLabel)}">Opportunity Gap: ${escapeHtml(gapLabel)}</span>
        <span class="badge amber">Gap Score: ${escapeHtml(recommendation.gapScore)}/100</span>
        <span class="badge blue">Country-sector funding: ${escapeHtml(gap.countrySectorAmountLabel || "Needs review")}</span>
        <span class="badge green">Sector median by country: ${escapeHtml(gap.sectorMedianCountryAmountLabel || "Needs review")}</span>
      </div>
      <div class="metric-stack section">
        <div>
          <span>Opportunity Gap Score</span>
          <strong>${escapeHtml(recommendation.gapScore)}/100</strong>
          <small>Higher when the sector is active globally but fewer similar same-country records appear.</small>
        </div>
        <div>
          <span>Recommendation Weight</span>
          <strong>55%</strong>
          <small>Gap is treated as a review signal, not a conclusion about deserving funding.</small>
        </div>
      </div>
      <h3 class="section">Why this may be overlooked:</h3>
      ${renderList(gapReasons)}
      <h3 class="section">Interpretation</h3>
      <p class="lead">This may be an overlooked opportunity for funders to investigate, not a guaranteed investment.</p>
      <div class="note-panel"><strong>Underfunding is a signal, not a conclusion.</strong></div>
    </section>
    ${renderReadinessPanel(project, readiness)}
  `;
}

function renderSubmit() {
  const profile = state.builderProfile;
  $("#submit").innerHTML = `
    ${pageHeader(
      "submit-title",
      "Submit a Local Project",
      "Turn an informal project into a funder-readable opportunity profile.",
      "",
      "",
      "Builder Portal",
    )}
    <section class="builder-submit-grid">
      <form id="project-form" class="card">
        <div class="form-grid">
          <label>Builder Name<input name="builderName" required placeholder="Mariana Torres" /></label>
          <label>Builder Role<input name="builderRole" placeholder="Student builder" /></label>
          <label>Project Title<input name="title" required placeholder="Community tutoring map for public libraries" /></label>
          <label>Country<input name="country" required placeholder="Colombia" /></label>
          <label>Region<input name="region" required placeholder="Latin America" /></label>
          <label>Sector<input name="sector" required placeholder="Education" /></label>
          <label>Subsector<input name="subsector" placeholder="Tutoring access / public learning spaces" /></label>
          <label>Current Stage<select name="stage"><option>Idea</option><option>Prototype</option><option>Pilot-ready</option><option>Active users</option></select></label>
          <label>Target Beneficiaries<input name="beneficiaries" required placeholder="Public school students" /></label>
          <label>Funding Need<input name="funding" required placeholder="$12,000" /></label>
          <label>Pilot partner or local partner<input name="pilotPartner" placeholder="School, clinic, NGO, community group" /></label>
          <label>Current users / beneficiaries reached<input name="usersReached" placeholder="e.g. 120 students, 3 schools, 2 workshops" /></label>
          <label class="wide">Evidence Link, optional<input name="evidence" placeholder="https://..." /><small>Demo, photos, website, GitHub, pitch deck, field report, or other proof.</small></label>
          <label class="wide">Project Description<textarea name="description" required placeholder="Student volunteers are mapping local tutoring availability and matching learners to low-cost sessions in public libraries."></textarea></label>
          <label class="wide">Budget breakdown<textarea name="budgetBreakdown" placeholder="How would the requested funding be used?"></textarea></label>
          <label class="wide">Team background<textarea name="teamBackground" placeholder="Who is building this and what local experience do they have?"></textarea></label>
          <label class="wide">Traction or evidence<textarea name="tractionEvidence" placeholder="Any users, pilots, testimonials, workshops, or early results?"></textarea></label>
          <label class="wide">Impact measurement plan<textarea name="impactMeasurement" placeholder="What outcome would be measured during a pilot?"></textarea></label>
        </div>
        <div class="section">
          <button class="btn primary" type="submit">Generate Opportunity Profile</button>
        </div>
      </form>
      <article id="profile-preview" class="card">
        ${sectionHeader("Self-Reported Opportunity Profile", "This preview is structured for funder review.")}
        ${
          profile
            ? `<div class="profile-grid">
                ${renderProfileField("Project title", profile.title)}
                ${renderProfileField("Builder", builderName(profile))}
                ${renderProfileField("Builder role", builderRole(profile))}
                ${renderProfileField("Country", profile.country)}
                ${renderProfileField("Region", profile.region)}
                ${renderProfileField("Sector", profile.sector)}
                ${renderProfileField("Subsector", profile.subsector)}
                ${renderProfileField("Beneficiaries", profile.beneficiaries)}
                ${renderProfileField("Stage", profile.stage)}
                ${renderProfileField("Funding need", profile.fundingNeed)}
                ${renderProfileField("Readiness", profile.readiness)}
                ${renderProfileField("Opportunity gap", profile.opportunityGap)}
                ${renderProfileField("Verification status", "Self-reported")}
                ${renderProfileField("Pilot / local partner", profile.pilotPartner)}
                ${renderProfileField("Current users / beneficiaries", profile.usersReached)}
                ${renderProfileField("Evidence link", profile.evidenceLink)}
                ${renderProfileField("Project description", profile.description, true)}
                ${renderProfileField("Budget breakdown", profile.budgetBreakdown, true)}
                ${renderProfileField("Team background", profile.teamBackground, true)}
                ${renderProfileField("Traction or evidence", profile.tractionEvidence, true)}
                ${renderProfileField("Impact measurement plan", profile.impactMeasurement, true)}
              </div>
              <div class="section note-panel">Your project has been converted into a self-reported opportunity profile and added to the Funder Discovery Dashboard.</div>
              <div class="section badge-row">
                <a class="btn" href="../funder/index.html#discovery">View in Funder Dashboard</a>
                <button class="btn route-btn" data-page="builder-history" type="button">View History</button>
                <button class="btn primary packet-btn" data-project-id="${escapeHtml(profile.id)}">View Evaluation Packet</button>
              </div>`
            : `<div class="empty">Submit a project to generate a structured funder-readable preview.</div>`
        }
      </article>
    </section>
  `;
}

function threadPreview(thread) {
  const latest = thread.messages?.[thread.messages.length - 1];
  return latest ? latest.text : "No messages yet.";
}

function threadPrimaryName(thread) {
  return currentPortalType() === "builder"
    ? thread.funderName || "Funder"
    : thread.builderName || "Builder";
}

function threadMeta(thread) {
  return currentPortalType() === "builder"
    ? `${thread.projectTitle} · ${thread.builderName || "Your profile"}`
    : `${thread.projectTitle} · ${thread.funderName || "Funder"}`;
}

function messageSide(sender) {
  if (sender === currentSenderLabel()) return "mine";
  if (sender === "Builder" || sender === "Funder") return "theirs";
  return "system";
}

function messageSenderName(message, thread) {
  if (message.system) return "First Spark";
  if (message.sender === currentSenderLabel()) return "You";
  if (message.sender === "Builder") return thread.builderName || "Builder";
  if (message.sender === "Funder") return thread.funderName || "Funder";
  return message.sender || "Message";
}

function renderMessages() {
  const target = $("#messages");
  if (!target) return;
  const portal = currentPortalType();
  const threads = getThreads().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const activeThread = threads.find((thread) => thread.id === state.selectedThreadId) || threads[0];
  if (activeThread) state.selectedThreadId = activeThread.id;

  target.innerHTML = `
    ${pageHeader(
      "messages-title",
      "Messages",
      portal === "builder"
        ? "Manage local demo conversations with funders."
        : "Manage local demo conversations with builders.",
      "Messages in this prototype stay in browser localStorage. They are not sent externally.",
      "",
      portal === "builder" ? "Builder Portal" : "Funder Portal",
    )}
    <section class="messages-shell">
      <aside class="thread-list card">
        ${sectionHeader("Threads", `${threads.length} conversation${threads.length === 1 ? "" : "s"}`)}
        ${
          threads.length
            ? threads
                .map(
                  (thread) => `<button class="thread-item ${thread.id === state.selectedThreadId ? "active" : ""}" data-thread-id="${escapeHtml(thread.id)}" type="button">
                    <strong>${escapeHtml(threadPrimaryName(thread))}</strong>
                    <span>${escapeHtml(threadMeta(thread))}</span>
                    <p>${escapeHtml(truncateText(threadPreview(thread), 96))}</p>
                  </button>`,
                )
                .join("")
            : `<div class="empty">No messages yet. Use Contact Builder or Contact Funder to start a local demo thread.</div>`
        }
      </aside>
      <section class="message-panel card">
        ${
          activeThread
            ? `<div class="message-header">
                <div>
                  <h2>${escapeHtml(threadPrimaryName(activeThread))}</h2>
                  <p class="meta">${escapeHtml(threadMeta(activeThread))}</p>
                </div>
                <span class="badge blue">Local demo thread</span>
              </div>
              <div class="message-list">
                ${(activeThread.messages || [])
                  .map(
                    (message) => `<article class="message-bubble ${messageSide(message.sender)}">
                      <span>${escapeHtml(messageSenderName(message, activeThread))} · ${escapeHtml(formatDate(message.at))}</span>
                      <p>${escapeHtml(message.text)}</p>
                    </article>`,
                  )
                  .join("")}
              </div>
              <form id="message-form" class="message-form">
                <input name="message" placeholder="${portal === "builder" ? "Write a local reply to the funder..." : "Write a local message to the builder..."}" required />
                <button class="btn primary" type="submit">Add Message</button>
              </form>`
            : `<div class="empty">Start from a project card, builder profile, or history item to create a conversation.</div>`
        }
      </section>
    </section>
  `;
}

function renderSignals() {
  const metrics = oecd.metrics || {};
  const yearly = oecd.fundingByYear || [];
  $("#signals").innerHTML = `
    ${pageHeader(
      "signals-title",
      "OECD Funding Signals",
      "Explore historical philanthropy funding patterns used to contextualize local projects.",
    )}
    <section class="grid four">
      ${kpi("Total Funding", metrics.totalFundingLabel || "$68.2B")}
      ${kpi("Funding Records", metrics.recordCountLabel || "116K+")}
      ${kpi("Recipient Countries", String(metrics.recipientCountries || 163))}
      ${kpi("Donor Organizations", String(metrics.donorOrganizations || 506))}
    </section>
    <article class="card chart-card section">
      ${sectionHeader("Funding by Year", "Total disbursements per year · USD millions, deflated")}
      ${yearLineChart(yearly.map((item) => ({ label: item.year, amount: item.amount, amountLabel: item.amountLabel })), "amount")}
    </article>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Funding by Sector", "Share of total disbursements")}
        ${donutChart(oecd.topSectors || [], "amount")}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Top Funders")}
        ${barList(oecd.topFunders || [], "amount")}
      </article>
    </section>
    <article class="card chart-card section">
      ${sectionHeader("Top Recipient Countries")}
      ${barList(oecd.topRecipientCountries || [], "amount")}
    </article>
    <section class="section note-panel">
      <strong>OECD data is used as funding intelligence, not talent data.</strong> It helps funders understand historical philanthropy funding patterns, similar funded projects, and funder relevance.
    </section>
  `;
}

function renderCurrentPage() {
  renderOverview();
  renderOpportunityAtlas();
  renderDiscovery();
  renderDetail();
  renderBuilderProfilePage();
  renderQueue();
  renderFunderHistory();
  renderSignals();
  renderMessages();
  renderSubmit();
  renderBuilderHistoryPage();
  renderSubmissionDetailPage();
  renderBuilderNotificationsPage();
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === state.page));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === state.page));
  document.querySelectorAll(".top-tab").forEach((link) => link.classList.toggle("active", link.dataset.page === state.page));
}

function goTo(page) {
  state.page = page;
  if (page === "discovery") {
    recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discover Projects");
  }
  renderCurrentPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const menuToggle = event.target.closest(".menu-toggle");
  if (menuToggle) {
    const isOpen = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    return;
  }

  const profileClose = event.target.closest(".flow-profile-close");
  if (profileClose) {
    state.flow.recipient = "";
    renderOverview();
    return;
  }

  const flowRecipient = event.target.closest(".flow-recipient");
  if (flowRecipient) {
    state.flow.recipient = flowRecipient.dataset.country;
    renderOverview();
    return;
  }

  const nav = event.target.closest(".nav-link");
  if (nav) {
    document.body.classList.remove("nav-open");
    $(".menu-toggle")?.setAttribute("aria-expanded", "false");
    goTo(nav.dataset.page);
    return;
  }

  const route = event.target.closest(".route-btn");
  if (route) {
    if (route.dataset.resetFilters === "true") {
      Object.assign(state.filters, {
        country: "All",
        sector: "All",
        stage: "All",
        readiness: "All",
        gap: "All",
        verification: "Self-reported",
      });
    }
    goTo(route.dataset.page);
    return;
  }

  const packet = event.target.closest(".packet-btn");
  if (packet) {
    state.selectedProjectId = packet.dataset.projectId;
    const project = getProject(state.selectedProjectId);
    if (currentPortalType() === "funder" && ["overview", "opportunity-atlas", "discovery", "queue", "funder-history", "builder-profile"].includes(state.page)) {
      recordBuilderProjectView(project, "Evaluation Packet");
    }
    state.reviewMessage = "";
    goTo("detail");
    return;
  }

  const builderLink = event.target.closest(".builder-link");
  if (builderLink) {
    const project = getProject(builderLink.dataset.projectId);
    state.selectedBuilderId = builderLink.dataset.builderId || project.builderId;
    if (currentPortalType() === "funder") recordBuilderProfileView(project, "Builder Profile");
    goTo("builder-profile");
    return;
  }

  const contactBuilder = event.target.closest(".contact-builder-btn");
  if (contactBuilder) {
    const project = getProject(contactBuilder.dataset.projectId);
    ensureThread(project, "funder");
    goTo("messages");
    return;
  }

  const contactFunder = event.target.closest(".contact-funder-btn");
  if (contactFunder) {
    const project = getProject(contactFunder.dataset.projectId);
    ensureThread(project, "builder");
    goTo("messages");
    return;
  }

  const submissionDetail = event.target.closest(".submission-detail-btn");
  if (submissionDetail) {
    state.selectedProjectId = submissionDetail.dataset.projectId;
    goTo("submission-detail");
    return;
  }

  const thread = event.target.closest(".thread-item");
  if (thread) {
    state.selectedThreadId = thread.dataset.threadId;
    renderMessages();
    return;
  }

  const reviewAction = event.target.closest(".review-action");
  if (reviewAction) {
    const project = getProject();
    if (reviewAction.dataset.action === "funded") {
      showFundModal(project);
      return;
    }
    const messages = {
      shortlist: ["Shortlisted", "Project added to shortlist."],
      evidence: ["Evidence requested", "Evidence request marked."],
      invite: ["Invited to apply", "Project marked as invited to apply."],
    };
    const [status, message] = messages[reviewAction.dataset.action] || messages.shortlist;
    project.reviewStatus = status;
    state.reviewMessage = message;
    saveReviewStatuses();
    renderDetail();
  }

  const editAmountBtn = event.target.closest(".edit-amount-btn");
  if (editAmountBtn) {
    const project = projects.find((p) => p.id === editAmountBtn.dataset.projectId);
    if (project) showFundModal(project, true);
  }

  const removeBtn = event.target.closest(".queue-card-remove");
  if (removeBtn) {
    const project = projects.find((p) => p.id === removeBtn.dataset.removeProject);
    if (project) {
      project.reviewStatus = "Not reviewed";
      saveReviewStatuses();
      renderQueue();
      renderFunderHistory();
    }
  }
});

document.addEventListener("mouseover", (event) => {
  const flowRecipient = event.target.closest(".flow-recipient");
  if (!flowRecipient || state.page !== "overview") return;
  if (state.flow.recipient === flowRecipient.dataset.country) return;
  state.flow.recipient = flowRecipient.dataset.country;
  renderOverview();
});

document.addEventListener("keydown", (event) => {
  const flowRecipient = event.target.closest(".flow-recipient");
  if (!flowRecipient || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  state.flow.recipient = flowRecipient.dataset.country;
  renderOverview();
});

document.addEventListener("change", (event) => {
  const flowFilter = event.target.closest("[data-flow-filter]");
  if (flowFilter) {
    const key = flowFilter.dataset.flowFilter;
    state.flow[key] = key === "topN" ? Number(flowFilter.value) : flowFilter.value;
    state.flow.recipient = "";
    renderOverview();
    return;
  }

  const filter = event.target.closest("[data-filter]");
  if (!filter) return;
  state.filters[filter.dataset.filter] = filter.value;
  if (state.page === "discovery") {
    recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discovery filter");
  }
  renderDiscovery();
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "message-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    addMessageToThread(state.selectedThreadId, form.get("message"));
    renderMessages();
    return;
  }

  if (event.target.id !== "project-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const title = form.get("title");
  const stage = form.get("stage") || "Idea";
  const submittedBuilderName = form.get("builderName") || "Self-reported builder";
  const newProject = {
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title: title || "Untitled local project",
    builderName: submittedBuilderName,
    builderId: builderIdFor(submittedBuilderName),
    builderRole: form.get("builderRole") || "Young builder",
    country: form.get("country") || "Unspecified",
    region: form.get("region") || "Unspecified",
    builderLocation: form.get("country") || "Local builder",
    sector: form.get("sector") || "Unspecified",
    subsector: form.get("subsector") || "General",
    beneficiaries: form.get("beneficiaries") || "Unspecified",
    stage,
    fundingNeed: form.get("funding") || "Needs review",
    verification: "Self-reported",
    description: form.get("description") || "No description provided.",
    evidenceLink: form.get("evidence") || "",
    pilotPartner: form.get("pilotPartner") || "",
    usersReached: form.get("usersReached") || "",
    budgetBreakdown: form.get("budgetBreakdown") || "",
    teamBackground: form.get("teamBackground") || "",
    tractionEvidence: form.get("tractionEvidence") || "",
    impactMeasurement: form.get("impactMeasurement") || "",
    reviewStatus: "Not reviewed",
    submittedAt: new Date().toISOString(),
    isSubmitted: true,
  };
  newProject.readiness = computeReadiness(newProject);
  newProject.readinessFilter = readinessFilterFor(newProject.readiness);
  const newProjectIntel = generateFundingContext(newProject);
  newProject.opportunityGap = computeGap(newProject, newProjectIntel);
  newProject.gapRationale = gapRationale(newProject, newProjectIntel);
  projects.push(newProject);
  state.builderProfile = newProject;
  state.selectedProjectId = newProject.id;
  state.reviewMessage = "";
  initializeBuilderActivity(newProject);
  saveSubmittedProjects();
  renderSubmit();
});

seedGatesFoundationDemo();
initializeStoredData();
if (state.page === "discovery") {
  recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discover Projects");
}
renderCurrentPage();
