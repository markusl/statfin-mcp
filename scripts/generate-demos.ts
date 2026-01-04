/**
 * Generate demo content for GitHub Pages by running actual StatFin queries
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://pxdata.stat.fi/PxWeb/api/v1';
const DOCS_DIR = join(import.meta.dirname, '../docs');
const DEMOS_DIR = join(DOCS_DIR, 'demos');

// Ensure directories exist
mkdirSync(DEMOS_DIR, { recursive: true });

interface DemoQuery {
  id: string;
  title: string;
  titleFi: string;
  description: string;
  descriptionFi: string;
  category: string;
  tableId: string;
  tablePath: string;
  prompt: string;
  selections: Array<{
    code: string;
    selection: {
      filter: string;
      values: string[];
    };
  }>;
}

// Demos with correct variable codes from actual table metadata
const DEMO_QUERIES: DemoQuery[] = [
  {
    id: 'helsinki-population',
    title: 'Helsinki Population Trend',
    titleFi: 'Helsingin väestökehitys',
    description: 'Track Helsinki\'s population growth over the last 10 years',
    descriptionFi: 'Seuraa Helsingin väestönkasvua viimeisten 10 vuoden ajalta',
    category: 'population',
    tableId: 'statfin_vaerak_pxt_11re.px',
    tablePath: '/vaerak',
    prompt: 'Show me Helsinki\'s population for the last 10 years',
    selections: [
      { code: 'Alue', selection: { filter: 'item', values: ['KU091'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Vuosi', selection: { filter: 'item', values: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vaesto'] } },
    ],
  },
  {
    id: 'finland-births',
    title: 'Finland Birth Rate Decline',
    titleFi: 'Suomen syntyvyyden lasku',
    description: 'Annual births in Finland showing the demographic shift',
    descriptionFi: 'Vuosittaiset syntymät Suomessa demografisen muutoksen kuvaajana',
    category: 'population',
    tableId: 'statfin_synt_pxt_12dx.px',
    tablePath: '/synt',
    prompt: 'Show annual births in Finland for the last 30 years',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vm01'] } },
    ],
  },
  {
    id: 'unemployment-rate',
    title: 'Unemployment Rate Trend',
    titleFi: 'Työttömyysasteen kehitys',
    description: 'Monthly unemployment rate showing economic cycles and COVID impact',
    descriptionFi: 'Kuukausittainen työttömyysaste taloussuhdanteiden ja COVID:n vaikutusten kuvaajana',
    category: 'employment',
    tableId: 'statfin_tyti_pxt_135z.px',
    tablePath: '/tyti',
    prompt: 'Show Finland\'s monthly unemployment rate trend for the last 5 years',
    selections: [
      { code: 'Tiedot', selection: { filter: 'item', values: ['tyottaste_trendi'] } },
      { code: 'Kuukausi', selection: { filter: 'item', values: ['2020M01', '2020M06', '2020M12', '2021M06', '2021M12', '2022M06', '2022M12', '2023M06', '2023M12', '2024M06', '2024M12'] } },
    ],
  },
  {
    id: 'population-age-structure',
    title: 'Population Age Structure',
    titleFi: 'Väestön ikärakenne',
    description: 'Finland\'s aging population - comparing age groups over time',
    descriptionFi: 'Suomen ikääntyvä väestö - ikäryhmien vertailu ajan kuluessa',
    category: 'population',
    tableId: 'statfin_vaerak_pxt_11rc.px',
    tablePath: '/vaerak',
    prompt: 'Compare Finland\'s population by age groups over the last 20 years',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['2000', '2005', '2010', '2015', '2020', '2024'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['0-4', '20-24', '40-44', '65-69', '85-'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vaesto'] } },
    ],
  },
  {
    id: 'regional-population',
    title: 'Regional Population Comparison',
    titleFi: 'Alueellinen väestövertailu',
    description: 'Population in major Finnish cities',
    descriptionFi: 'Väestö suurimmissa Suomen kaupungeissa',
    category: 'regional',
    tableId: 'statfin_vaerak_pxt_11re.px',
    tablePath: '/vaerak',
    prompt: 'Compare population in Helsinki, Espoo, Tampere, Vantaa, and Oulu',
    selections: [
      { code: 'Alue', selection: { filter: 'item', values: ['KU091', 'KU049', 'KU837', 'KU092', 'KU564'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Vuosi', selection: { filter: 'item', values: ['2010', '2015', '2020', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vaesto'] } },
    ],
  },
  {
    id: 'migration-balance',
    title: 'International Migration Balance',
    titleFi: 'Kansainvälinen muuttotase',
    description: 'Immigration, emigration and net migration over 25 years',
    descriptionFi: 'Maahanmuutto, maastamuutto ja nettomuutto 25 vuoden ajalta',
    category: 'migration',
    tableId: 'statfin_synt_pxt_12dx.px',
    tablePath: '/synt',
    prompt: 'Show Finland\'s immigration and emigration numbers',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['2000', '2005', '2010', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vm41', 'vm42', 'vm43_tilv'] } },
    ],
  },
  {
    id: 'employment-trend',
    title: 'Employment Rate Trend',
    titleFi: 'Työllisyysasteen kehitys',
    description: 'Working-age employment rate showing labor market changes',
    descriptionFi: 'Työikäisten työllisyysaste työmarkkinoiden muutosten kuvaajana',
    category: 'employment',
    tableId: 'statfin_tyti_pxt_135z.px',
    tablePath: '/tyti',
    prompt: 'Show Finland\'s employment rate trend over time',
    selections: [
      { code: 'Tiedot', selection: { filter: 'item', values: ['tyollaste_15_64_trendi'] } },
      { code: 'Kuukausi', selection: { filter: 'item', values: ['2015M01', '2016M01', '2017M01', '2018M01', '2019M01', '2020M01', '2020M06', '2021M01', '2022M01', '2023M01', '2024M01', '2024M06'] } },
    ],
  },
  {
    id: 'population-change',
    title: 'Population Change Components',
    titleFi: 'Väestömuutoksen osatekijät',
    description: 'Births, deaths, and migration driving population change',
    descriptionFi: 'Syntymät, kuolemat ja muuttoliike väestömuutoksen ajureina',
    category: 'population',
    tableId: 'statfin_synt_pxt_12dx.px',
    tablePath: '/synt',
    prompt: 'Show the components of population change in Finland',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vm01', 'vm11', 'luonvalisays', 'vm43_tilv'] } },
    ],
  },
  // === COMPLEX MULTI-DIMENSIONAL DEMOS ===
  {
    id: 'energy-transition',
    title: 'Finland\'s Energy Transition',
    titleFi: 'Suomen energiamurros',
    description: 'The dramatic shift in electricity production: wind power surge, nuclear stability, and declining fossil fuels',
    descriptionFi: 'Sähköntuotannon murros: tuulivoiman nousu, ydinvoiman vakaus ja fossiilisten polttoaineiden lasku',
    category: 'energy',
    tableId: 'statfin_ehk_pxt_12su.px',
    tablePath: '/ehk',
    prompt: 'Show how Finland\'s electricity production mix has changed over the last 10 years - compare hydro, wind, solar, and nuclear power',
    selections: [
      { code: 'Kuukausi', selection: { filter: 'item', values: ['2015M12', '2016M12', '2017M12', '2018M12', '2019M12', '2020M12', '2021M12', '2022M12', '2023M12', '2024M12'] } },
      { code: 'Sähkön tuotanto/hankinta', selection: { filter: 'item', values: ['1.1', '1.2', '1.3', '1.4'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['osuus_sahko_kul'] } },
    ],
  },
  {
    id: 'gender-employment-convergence',
    title: 'Gender Employment Gap Convergence',
    titleFi: 'Sukupuolten työllisyyskuilun kaventuminen',
    description: 'How the employment gap between men and women has narrowed - especially during COVID when women caught up',
    descriptionFi: 'Miten miesten ja naisten työllisyysero on kaventunut - erityisesti COVID:n aikana naiset saavuttivat miehet',
    category: 'employment',
    tableId: 'statfin_tyti_pxt_135y.px',
    tablePath: '/tyti',
    prompt: 'Compare male vs female employment rates over the last 15 years - show how the gender gap has changed',
    selections: [
      { code: 'Kuukausi', selection: { filter: 'item', values: ['2010M01', '2012M01', '2014M01', '2016M01', '2018M01', '2019M01', '2020M01', '2020M06', '2021M01', '2022M01', '2023M01', '2024M01'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['1', '2'] } },
      { code: 'Ikäluokka', selection: { filter: 'item', values: ['15-64'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['Tyollisyysaste'] } },
    ],
  },
  {
    id: 'housing-price-divergence',
    title: 'Housing Market Divergence',
    titleFi: 'Asuntomarkkinoiden eriytyminen',
    description: 'The great divide: Helsinki apartment prices rising while other regions stagnate or decline',
    descriptionFi: 'Suuri jakautuminen: Helsingin asuntohinnat nousevat, muualla stagnaatio tai lasku',
    category: 'housing',
    tableId: 'statfin_ashi_pxt_13mv.px',
    tablePath: '/ashi',
    prompt: 'Compare apartment price trends in Helsinki vs rest of Finland over the last 15 years',
    selections: [
      { code: 'Vuosineljännes', selection: { filter: 'item', values: ['2010Q4', '2012Q4', '2014Q4', '2016Q4', '2018Q4', '2020Q4', '2021Q4', '2022Q4', '2023Q4', '2024Q4'] } },
      { code: 'Alue', selection: { filter: 'item', values: ['091', 'pks', 'msu'] } },
      { code: 'Talotyyppi', selection: { filter: 'item', values: ['3'] } },
      { code: 'Huoneluku', selection: { filter: 'item', values: ['00'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['keskihinta_aritm'] } },
    ],
  },
  {
    id: 'dependency-ratio-crisis',
    title: 'Dependency Ratio Crisis',
    titleFi: 'Huoltosuhteen kriisi',
    description: 'Working-age population shrinking while elderly grow: Finland\'s demographic time bomb visualized',
    descriptionFi: 'Työikäinen väestö supistuu samalla kun ikääntyneiden määrä kasvaa: Suomen demografinen aikapommi',
    category: 'population',
    tableId: 'statfin_vaerak_pxt_11rc.px',
    tablePath: '/vaerak',
    prompt: 'Show the changing balance between working-age (15-64) and elderly (65+) population over 25 years',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['2000', '2005', '2010', '2015', '2020', '2024'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['vaesto'] } },
    ],
  },
  {
    id: 'immigration-compensates-births',
    title: 'Immigration Compensates Declining Births',
    titleFi: 'Maahanmuutto kompensoi syntyvyyden laskua',
    description: 'Natural population change goes negative while net migration keeps Finland growing',
    descriptionFi: 'Luonnollinen väestönmuutos negatiivinen, mutta nettomuutto pitää Suomen väkiluvun kasvussa',
    category: 'migration',
    tableId: 'statfin_synt_pxt_12dx.px',
    tablePath: '/synt',
    prompt: 'Compare natural population change (births minus deaths) with net migration over 25 years',
    selections: [
      { code: 'Vuosi', selection: { filter: 'item', values: ['2000', '2002', '2004', '2006', '2008', '2010', '2012', '2014', '2016', '2018', '2020', '2022', '2024'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['luonvalisays', 'vm4142', 'kokmuutos'] } },
    ],
  },
  {
    id: 'shrinking-workforce',
    title: 'The Shrinking Workforce',
    titleFi: 'Kutistuva työvoima',
    description: 'Finland has lost 136,000 working-age people since 2010 - tracking the workforce decline',
    descriptionFi: 'Suomi on menettänyt 136 000 työikäistä vuodesta 2010 - työvoimapula kasvaa',
    category: 'employment',
    tableId: 'statfin_tyti_pxt_135y.px',
    tablePath: '/tyti',
    prompt: 'Show the decline in working-age population (15-64) and how it affects the labor force',
    selections: [
      { code: 'Kuukausi', selection: { filter: 'item', values: ['2010M01', '2012M01', '2014M01', '2016M01', '2018M01', '2020M01', '2022M01', '2024M01'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Ikäluokka', selection: { filter: 'item', values: ['15-64'] } },
      { code: 'Tiedot', selection: { filter: 'item', values: ['Vaesto', 'Tyovoima', 'Tyolliset'] } },
    ],
  },
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeQuery(demo: DemoQuery): Promise<any> {
  const queryUrl = `${BASE_URL}/fi/StatFin${demo.tablePath}/${demo.tableId}`;

  // Build query body in PxWeb format
  const queryBody = {
    query: demo.selections,
    response: { format: 'json-stat2' },
  };

  console.log(`  Querying: ${queryUrl}`);

  const queryRes = await fetch(queryUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryBody),
  });

  if (!queryRes.ok) {
    const errorText = await queryRes.text();
    throw new Error(`Query failed: ${queryRes.status} - ${errorText.slice(0, 200)}`);
  }

  return await queryRes.json();
}

function transformJsonStat2(data: any): { columns: string[]; rows: Record<string, any>[] } {
  const dimensions = data.id || [];
  const sizes = data.size || [];
  const values = data.value || [];

  const columns = [...dimensions, 'value'];
  const rows: Record<string, any>[] = [];

  // Build dimension labels
  const dimLabels: Record<string, Record<string, string>> = {};
  for (const dim of dimensions) {
    const dimData = data.dimension?.[dim];
    if (dimData?.category?.label) {
      dimLabels[dim] = dimData.category.label;
    }
  }

  // Generate all combinations
  const indices = new Array(dimensions.length).fill(0);
  let valueIndex = 0;

  const getCategoryKey = (dimName: string, index: number): string => {
    const dimData = data.dimension?.[dimName];
    if (dimData?.category?.index) {
      const indexMap = dimData.category.index;
      for (const [key, idx] of Object.entries(indexMap)) {
        if (idx === index) return key;
      }
    }
    return String(index);
  };

  while (valueIndex < values.length) {
    const row: Record<string, any> = {};
    for (let i = 0; i < dimensions.length; i++) {
      const dim = dimensions[i];
      const key = getCategoryKey(dim, indices[i]);
      row[dim] = dimLabels[dim]?.[key] || key;
    }
    row.value = values[valueIndex];
    rows.push(row);

    valueIndex++;

    // Increment indices
    let carry = true;
    for (let i = dimensions.length - 1; i >= 0 && carry; i--) {
      indices[i]++;
      if (indices[i] >= sizes[i]) {
        indices[i] = 0;
      } else {
        carry = false;
      }
    }
    if (carry && valueIndex < values.length) break;
  }

  return { columns, rows };
}

function generateChart(demo: DemoQuery, data: { columns: string[]; rows: Record<string, any>[] }): string {
  const rows = data.rows;
  if (rows.length === 0) return '{}';

  const timeColumn = data.columns.find(c => c === 'Vuosi' || c === 'Kuukausi' || c === 'Vuosineljännes');
  const valueColumn = 'value';

  if (!timeColumn) {
    return generateBarChart(demo, data);
  }

  return generateLineChart(demo, data, timeColumn);
}

function generateLineChart(demo: DemoQuery, data: { columns: string[]; rows: Record<string, any>[] }, timeColumn: string): string {
  const rows = data.rows;
  const otherDims = data.columns.filter(c => c !== timeColumn && c !== 'value');

  // Get unique time labels
  const labels = [...new Set(rows.map(r => r[timeColumn]))];

  // Check if we have multiple series
  const hasMultipleSeries = otherDims.length > 0 && otherDims.some(dim => {
    const uniqueValues = new Set(rows.map(r => r[dim]));
    return uniqueValues.size > 1;
  });

  if (!hasMultipleSeries) {
    const values = labels.map(l => {
      const row = rows.find(r => r[timeColumn] === l);
      return row?.value ?? null;
    });

    return `{
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: '${demo.title}',
          data: ${JSON.stringify(values)},
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: '${demo.title}' }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    }`;
  } else {
    // Multiple series - find the grouping dimension
    const groupDim = otherDims.find(dim => {
      const uniqueValues = new Set(rows.map(r => r[dim]));
      return uniqueValues.size > 1;
    }) || otherDims[0];

    const groups = [...new Set(rows.map(r => r[groupDim]))];

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(239, 68, 68)',
      'rgb(34, 197, 94)',
      'rgb(168, 85, 247)',
      'rgb(249, 115, 22)',
      'rgb(14, 165, 233)',
    ];

    const datasets = groups.map((group, i) => {
      const groupRows = rows.filter(r => r[groupDim] === group);
      const values = labels.map(l => {
        const row = groupRows.find(r => r[timeColumn] === l);
        return row?.value ?? null;
      });
      return {
        label: String(group),
        data: values,
        borderColor: colors[i % colors.length],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.1
      };
    });

    return `{
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: ${JSON.stringify(datasets)}
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: '${demo.title}' }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    }`;
  }
}

function generateBarChart(demo: DemoQuery, data: { columns: string[]; rows: Record<string, any>[] }): string {
  const rows = data.rows;
  const labelCol = data.columns.find(c => c !== 'value') || data.columns[0];

  const labels = rows.map(r => r[labelCol]);
  const values = rows.map(r => r.value);

  return `{
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        label: '${demo.title}',
        data: ${JSON.stringify(values)},
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: '${demo.title}' }
      }
    }
  }`;
}

function formatMcpQuery(demo: DemoQuery): string {
  const selections = demo.selections.map(s => {
    if (s.selection.values.length > 5) {
      return `    { variable: "${s.code}", filter: "item", values: [${s.selection.values.slice(0, 3).map(v => `"${v}"`).join(', ')}, /* ... ${s.selection.values.length} values */] }`;
    }
    return `    { variable: "${s.code}", filter: "item", values: [${s.selection.values.map(v => `"${v}"`).join(', ')}] }`;
  }).join(',\n');

  return `query_table({
  tableId: "${demo.tableId}",
  selections: [
${selections}
  ]
})`;
}

function generateDemoPage(demo: DemoQuery, data: { columns: string[]; rows: Record<string, any>[] }, rawResponse: any): string {
  const chartConfig = generateChart(demo, data);
  const tableRows = data.rows.slice(0, 25);
  const mcpQuery = formatMcpQuery(demo);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${demo.title} - StatFin MCP Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    .chart-container { position: relative; height: 400px; width: 100%; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-blue-600 text-white p-4">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <a href="../index.html" class="text-xl font-bold">StatFin MCP Demos</a>
      <a href="../index.html" class="hover:underline">&larr; Back to demos</a>
    </div>
  </nav>

  <main class="max-w-6xl mx-auto p-6">
    <header class="mb-8">
      <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-2">${demo.category}</span>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${demo.title}</h1>
      <p class="text-lg text-gray-600">${demo.description}</p>
      <p class="text-gray-500 mt-1">${demo.titleFi} - ${demo.descriptionFi}</p>
    </header>

    <!-- User Prompt -->
    <section class="mb-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span class="text-2xl">&#x1F4AC;</span> User Prompt
      </h2>
      <div class="bg-gray-100 rounded-lg p-4 text-lg italic">
        "${demo.prompt}"
      </div>
    </section>

    <!-- MCP Query -->
    <section class="mb-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span class="text-2xl">&#x1F527;</span> MCP Tool Call
      </h2>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto"><code class="language-javascript">${mcpQuery}</code></pre>
    </section>

    <!-- Chart -->
    <section class="mb-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span class="text-2xl">&#x1F4CA;</span> Visualization
      </h2>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
    </section>

    <!-- Data Table -->
    <section class="mb-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span class="text-2xl">&#x1F4CB;</span> Data (${tableRows.length} of ${data.rows.length} rows)
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              ${data.columns.map(col => `<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${tableRows.map(row => `<tr>${data.columns.map(col => `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${row[col] ?? '-'}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Metadata -->
    <section class="mb-8 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
        <span class="text-2xl">&#x2139;&#xFE0F;</span> Metadata
      </h2>
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-gray-500">Table ID</dt>
          <dd class="font-mono text-sm">${demo.tableId}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">Total Rows</dt>
          <dd>${data.rows.length}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">Source</dt>
          <dd>${rawResponse.source || 'Tilastokeskus'}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">Updated</dt>
          <dd>${rawResponse.updated || 'N/A'}</dd>
        </div>
      </dl>
    </section>
  </main>

  <footer class="bg-gray-800 text-white p-6 mt-12">
    <div class="max-w-6xl mx-auto text-center">
      <p>Data source: <a href="https://pxdata.stat.fi" class="underline">Statistics Finland StatFin</a></p>
      <p class="text-gray-400 mt-2">Generated by StatFin MCP Server</p>
    </div>
  </footer>

  <script>
    hljs.highlightAll();
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, ${chartConfig});
  </script>
</body>
</html>`;
}

function generateIndexPage(demos: Array<{ demo: DemoQuery; success: boolean }>): string {
  const categories = [...new Set(demos.map(d => d.demo.category))];

  const categoryEmojis: Record<string, string> = {
    population: '&#x1F465;',
    employment: '&#x1F4BC;',
    housing: '&#x1F3E0;',
    migration: '&#x2708;&#xFE0F;',
    energy: '&#x26A1;',
    economy: '&#x1F4C8;',
    education: '&#x1F393;',
    regional: '&#x1F5FA;&#xFE0F;',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StatFin MCP Server - Live Demos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-blue-600 text-white p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold">StatFin MCP Server</h1>
      <p class="text-blue-100">Live demonstrations of Statistics Finland data queries</p>
    </div>
  </nav>

  <main class="max-w-6xl mx-auto p-6">
    <!-- Hero -->
    <section class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 class="text-3xl font-bold mb-4">Finnish Statistics at Your Fingertips</h2>
      <p class="text-lg text-gray-600 mb-6">
        This MCP server provides AI assistants with access to Statistics Finland's StatFin database -
        4,500+ statistical tables covering population, employment, housing, economy, and more.
      </p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-blue-600">7</div>
          <div class="text-sm text-gray-600">MCP Tools</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-blue-600">149</div>
          <div class="text-sm text-gray-600">Subject Areas</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-blue-600">4,500+</div>
          <div class="text-sm text-gray-600">Data Tables</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-3xl font-bold text-blue-600">3</div>
          <div class="text-sm text-gray-600">Languages</div>
        </div>
      </div>
    </section>

    <!-- Demo Cards by Category -->
    ${categories.map(cat => `
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
        <span>${categoryEmojis[cat] || '&#x1F4CA;'}</span> ${cat}
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        ${demos.filter(d => d.demo.category === cat).map(({ demo, success }) => `
        <a href="demos/${demo.id}.html" class="block bg-white rounded-lg shadow hover:shadow-lg transition p-6 ${!success ? 'opacity-50 pointer-events-none' : ''}">
          <h4 class="font-semibold text-lg mb-2">${demo.title}</h4>
          <p class="text-gray-600 text-sm mb-2">${demo.description}</p>
          <p class="text-gray-400 text-xs">${demo.titleFi}</p>
          <div class="mt-4 flex justify-between items-center">
            <code class="text-xs bg-gray-100 px-2 py-1 rounded">${demo.tableId.slice(0, 25)}...</code>
            ${success ? '<span class="text-green-500 text-sm">&#x2713; Live data</span>' : '<span class="text-red-500 text-sm">&#x2717; Failed</span>'}
          </div>
        </a>
        `).join('')}
      </div>
    </section>
    `).join('')}

    <!-- How It Works -->
    <section class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h3 class="text-2xl font-bold mb-6">How It Works</h3>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-4xl mb-3">&#x1F4AC;</div>
          <h4 class="font-semibold mb-2">1. Ask a Question</h4>
          <p class="text-gray-600 text-sm">"What is Helsinki's population trend?"</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-3">&#x1F50D;</div>
          <h4 class="font-semibold mb-2">2. AI Searches</h4>
          <p class="text-gray-600 text-sm">Claude uses search_statistics to find relevant tables</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-3">&#x1F4CA;</div>
          <h4 class="font-semibold mb-2">3. Get Data</h4>
          <p class="text-gray-600 text-sm">query_table fetches and presents the statistics</p>
        </div>
      </div>
    </section>

    <!-- MCP Tools -->
    <section class="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h3 class="text-2xl font-bold mb-6">Available MCP Tools</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">search_statistics</h4>
          <p class="text-sm text-gray-600">Full-text search across 4,500+ statistical tables</p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">list_subject_areas</h4>
          <p class="text-sm text-gray-600">Browse all 149 topic categories</p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">list_tables</h4>
          <p class="text-sm text-gray-600">List all tables in a subject area</p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">get_table_metadata</h4>
          <p class="text-sm text-gray-600">Get table structure, variables, and codes</p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">get_variable_values</h4>
          <p class="text-sm text-gray-600">Get all possible values for a variable</p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-blue-600">query_table</h4>
          <p class="text-sm text-gray-600">Execute data queries with filters</p>
        </div>
      </div>
    </section>

    <!-- Installation -->
    <section class="bg-gray-800 text-white rounded-lg p-8">
      <h3 class="text-2xl font-bold mb-4">Quick Start</h3>
      <pre class="bg-gray-900 rounded p-4 overflow-x-auto text-sm"><code>{
  "mcpServers": {
    "statfin": {
      "command": "node",
      "args": ["/path/to/statfin-mcp/dist/server.js"]
    }
  }
}</code></pre>
      <p class="mt-4 text-gray-300">Add to your Claude Desktop configuration to get started.</p>
    </section>
  </main>

  <footer class="bg-gray-100 p-6 mt-12">
    <div class="max-w-6xl mx-auto text-center text-gray-600">
      <p>Data source: <a href="https://pxdata.stat.fi" class="underline">Statistics Finland StatFin</a></p>
      <p class="mt-2">Built with the Model Context Protocol (MCP)</p>
    </div>
  </footer>
</body>
</html>`;
}

async function main() {
  console.log('Generating StatFin MCP demos...\n');

  const results: Array<{ demo: DemoQuery; success: boolean }> = [];

  for (const demo of DEMO_QUERIES) {
    console.log(`\n Processing: ${demo.title}`);

    try {
      const rawResponse = await executeQuery(demo);
      const data = transformJsonStat2(rawResponse);

      console.log(`  Got ${data.rows.length} rows`);

      const html = generateDemoPage(demo, data, rawResponse);
      const filePath = join(DEMOS_DIR, `${demo.id}.html`);
      writeFileSync(filePath, html);
      console.log(`  Generated: demos/${demo.id}.html`);

      results.push({ demo, success: true });

      // Rate limiting
      console.log('  Waiting 8s (rate limit)...');
      await delay(8000);

    } catch (error) {
      console.error(`  Error: ${error}`);
      results.push({ demo, success: false });
    }
  }

  // Generate index page
  console.log('\n Generating index page...');
  const indexHtml = generateIndexPage(results);
  writeFileSync(join(DOCS_DIR, 'index.html'), indexHtml);

  console.log('\n Done! Generated demos in docs/');
  console.log(`   Success: ${results.filter(r => r.success).length}/${results.length}`);
}

main().catch(console.error);
