# Statistical Analysis Themes from Tilastokeskus

This document identifies key analytical themes from Statistics Finland's Tieto&trendit blog (2015-2025) and provides example queries for AI assistants using the StatFin MCP server.

---

## Table of Contents

1. [Population & Demographics](#1-population--demographics)
2. [Employment & Labor Market](#2-employment--labor-market)
3. [Education & Skills](#3-education--skills)
4. [Immigration & Migration](#4-immigration--migration)
5. [Housing & Real Estate](#5-housing--real-estate)
6. [Economy & GDP](#6-economy--gdp)
7. [Energy & Environment](#7-energy--environment)
8. [Prices & Inflation](#8-prices--inflation)
9. [Income & Inequality](#9-income--inequality)
10. [Digitalization & Technology](#10-digitalization--technology)
11. [Remote Work & Work-Life](#11-remote-work--work-life)
12. [Regional Development](#12-regional-development)
13. [Crime & Safety](#13-crime--safety)
14. [Households & Consumption](#14-households--consumption)
15. [Health & Mortality](#15-health--mortality)
16. [Sustainable Development](#16-sustainable-development)

---

## 1. Population & Demographics

### Key Themes from Tieto&trendit
- **Declining fertility**: Birth rate has dropped from 3.5 children per mother (1940s) to 1.37 (2022)
- **Aging population**: Baby boomers (1945-1950) are now 70+, with 70% still alive
- **Family size shrinking**: Single-person households increasing, family sizes decreasing
- **Population center moving**: Finland's demographic center point shifting southward

### Analysis Ideas

#### 1.1 Finland's Fertility Crisis: A 30-Year Perspective
*How has Finland's birth rate declined and what does it mean for future demographics?*

**Prompt for Claude:**
> Using the StatFin MCP, analyze Finland's fertility trends over the past 30 years. Query the population statistics to show:
> 1. Number of births per year (1995-2024)
> 2. Total fertility rate trends
> 3. Compare fertility rates across regions (Helsinki, Oulu, rural areas)
> Present the data as a timeline showing key demographic shifts.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_synt_pxt_12dx.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["SSS"] },
    { variable: "Vuosi", filter: "top", top: 30 }
  ]
})
```

#### 1.2 The Rise of Single-Person Households
*How is Finland's household structure transforming?*

**Prompt for Claude:**
> Search for household statistics in StatFin and analyze the growth of single-person households versus families. Compare:
> 1. Household size distribution (1985-2024)
> 2. Regional differences between cities and rural areas
> 3. Correlation with housing type (apartments vs houses)

**Example Query:**
```javascript
query_table({
  tableId: "statfin_asas_pxt_116a.px",
  selections: [
    { variable: "Asuntokunnan koko", filter: "item", values: ["1", "2", "3", "4+"] },
    { variable: "Talotyyppi", filter: "item", values: ["1", "2", "3"] },
    { variable: "Vuosi", filter: "top", top: 40 }
  ]
})
```

#### 1.3 Goodbye Baby Boomers: Generational Population Shift
*Track the demographic impact as Finland's largest generation ages*

**Prompt for Claude:**
> Using StatFin data, analyze the age structure evolution in Finland. Show:
> 1. Population pyramid changes from 1990 to 2024
> 2. Size of the 65+ population over time
> 3. Working-age population (15-64) decline since 2009
> Calculate the old-age dependency ratio trends.

---

## 2. Employment & Labor Market

### Key Themes from Tieto&trendit
- **Employment rate fluctuations**: COVID-19 impact and recovery patterns
- **Working-age population decline**: 136,000 fewer working-age people since 2010
- **Gender employment gap closing**: Women caught up with men during pandemic
- **Manager paradox**: More managers despite fewer employed people

### Analysis Ideas

#### 2.1 COVID-19's Lasting Impact on Finnish Employment
*Did the pandemic permanently change employment patterns?*

**Prompt for Claude:**
> Query StatFin employment statistics to analyze COVID-19 impact:
> 1. Monthly employment rates January 2019 - December 2024
> 2. Unemployment rate by gender during the crisis
> 3. Recovery patterns by industry sector
> Compare pre-pandemic, crisis, and post-pandemic levels.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_tyti_pxt_135y.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["SSS", "1", "2"] },
    { variable: "Tiedot", filter: "item", values: ["tyollisyysaste", "tyottomyysaste"] },
    { variable: "Kuukausi", filter: "top", top: 72 }
  ]
})
```

#### 2.2 The Shrinking Workforce Challenge
*Finland's working-age population decline and its economic implications*

**Prompt for Claude:**
> Analyze Finland's workforce demographics using StatFin:
> 1. Working-age population (15-64) from 2000 to 2024
> 2. Employment rate by age group (55-64 vs younger groups)
> 3. International comparison with Nordic countries
> Calculate how many additional workers Finland needs to maintain current employment levels.

#### 2.3 More Managers, Fewer Workers: The Structural Shift
*Why is Finland seeing growth in management positions during employment decline?*

**Prompt for Claude:**
> Search StatFin for employment by occupation categories. Analyze:
> 1. Number of managers vs total employed (2015-2024)
> 2. Growth rates by occupation category
> 3. Sector distribution (public vs private)

---

## 3. Education & Skills

### Key Themes from Tieto&trendit
- **Education level stagnation**: Young Finns no longer outpacing OECD average
- **NEET youth**: Young people not in employment, education, or training
- **Gender gap in education**: Women significantly more educated than men
- **Foreign education recognition**: Challenges in recognizing immigrant qualifications

### Analysis Ideas

#### 3.1 The Education Plateau: When Progress Stopped
*Why did Finland's education advantage disappear?*

**Prompt for Claude:**
> Using StatFin education statistics, analyze:
> 1. Higher education attainment rates for 25-34 year olds (2000-2024)
> 2. Comparison with OECD averages
> 3. Gender differences in educational attainment
> 4. Field of study distribution changes over time

**Example Query:**
```javascript
query_table({
  tableId: "statfin_vkour_pxt_12bs.px",
  selections: [
    { variable: "Ikä", filter: "item", values: ["25-34", "35-44", "45-54"] },
    { variable: "Koulutusaste", filter: "item", values: ["3", "6", "7", "8"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 3.2 The Gender Education Gap: World's Largest?
*Finland's exceptional gender gap in higher education*

**Prompt for Claude:**
> Query education statistics to show:
> 1. University degree holders by gender (1990-2024)
> 2. Field of study by gender
> 3. International comparison of gender education gaps
> Analyze why Finland has one of the largest female-favoring education gaps.

#### 3.3 NEET Youth: The Hidden Crisis
*Tracking young people outside work and education*

**Prompt for Claude:**
> Analyze NEET (Not in Employment, Education or Training) statistics:
> 1. NEET rates by age group (15-19, 20-24, 25-29)
> 2. Regional variation (Uusimaa vs other regions)
> 3. Trend analysis 2010-2024
> 4. Gender differences in NEET patterns

---

## 4. Immigration & Migration

### Key Themes from Tieto&trendit
- **Immigration compensates fertility**: 15% of current births involve immigrant-background parents
- **Labor market contribution**: Immigrants fill specific labor shortages
- **Internal migration**: Movement toward cities, especially during COVID
- **Emigration patterns**: 80% of Western Europeans leave, only 10% of Asians

### Analysis Ideas

#### 4.1 Immigration as a Demographic Solution
*How migration compensates for low birth rates*

**Prompt for Claude:**
> Using StatFin migration and population data, analyze:
> 1. Net migration to Finland (1990-2024)
> 2. Immigrant contribution to population growth by year
> 3. Age distribution of immigrants vs native population
> 4. Birth rates among foreign-background families
> Calculate what Finland's population would be without immigration since 1990.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_muutl_pxt_119z.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["SSS"] },
    { variable: "Tiedot", filter: "item", values: ["vm41", "vm42", "vm43"] },
    { variable: "Vuosi", filter: "top", top: 35 }
  ]
})
```

#### 4.2 Where Immigrants Work: Filling Labor Gaps
*Mapping immigrant employment patterns*

**Prompt for Claude:**
> Analyze immigrant employment in Finland:
> 1. Employment rates by background country groups
> 2. Industry distribution of foreign-born workers
> 3. Comparison with native-born employment patterns
> 4. Geographic concentration of immigrant workers

#### 4.3 Who Stays, Who Leaves: Immigrant Retention Patterns
*Understanding emigration rates by origin country*

**Prompt for Claude:**
> Using StatFin migration data, analyze:
> 1. Emigration rates within 5 years by origin region
> 2. Retention rates for different nationality groups
> 3. Factors correlating with staying vs leaving
> Why do 80% of Western Europeans leave but 90% of Africans and Asians stay?

---

## 5. Housing & Real Estate

### Key Themes from Tieto&trendit
- **Price divergence**: Helsinki prices rising, rural areas falling
- **Debt concentration**: Young families in cities most indebted
- **Rental market**: Large institutional landlords dominating
- **Post-pandemic slump**: Housing transactions at 30-year low (2023)

### Analysis Ideas

#### 5.1 The Great Divide: Housing Prices in Two Finlands
*Urban prices rising while rural areas decline*

**Prompt for Claude:**
> Query StatFin housing price data to analyze:
> 1. Apartment price index by region (2010-2024)
> 2. Price per square meter: Helsinki center vs Kajaani
> 3. Identify regions with rising vs falling prices
> 4. Correlation with population changes
> Map the geographic "winners and losers" in housing markets.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_ashi_pxt_112p.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["pks", "091", "837", "SSS"] },
    { variable: "Huoneluku", filter: "item", values: ["0"] },
    { variable: "Vuosineljännes", filter: "top", top: 60 }
  ]
})
```

#### 5.2 Young Families and Housing Debt
*The debt burden of homeownership in major cities*

**Prompt for Claude:**
> Analyze housing debt patterns:
> 1. Household debt ratios by age group
> 2. Regional variation in debt levels
> 3. Debt composition (mortgage vs other)
> 4. Changes since 2010
> Which demographics are most vulnerable to interest rate rises?

#### 5.3 Rent Price Trends: Who Can Afford to Live Where?
*Rental market evolution across postal codes*

**Prompt for Claude:**
> Using rental price statistics, analyze:
> 1. Rent per square meter by postal code (Helsinki, Espoo, Tampere)
> 2. Rent growth rates vs inflation
> 3. Rent-to-income ratios by region
> Identify areas gentrifying vs becoming more affordable.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_asvu_pxt_13eb.px",
  selections: [
    { variable: "Postinumero", filter: "item", values: ["00100", "00500", "02100", "33100"] },
    { variable: "Huoneluku", filter: "item", values: ["02"] },
    { variable: "Vuosineljännes", filter: "top", top: 20 }
  ]
})
```

---

## 6. Economy & GDP

### Key Themes from Tieto&trendit
- **Export dependency decline**: Shift from export-led to domestic demand growth
- **R&D investment gap**: Still 1% short of 4% GDP target
- **GDP measurement challenges**: Revisions, sharing economy, digitalization
- **Service sector rise**: Services now dominate over manufacturing

### Analysis Ideas

#### 6.1 From Export Giant to Domestic Economy
*How Finland's growth model changed after Nokia*

**Prompt for Claude:**
> Analyze Finland's economic structure evolution:
> 1. GDP by demand component (export, consumption, investment) 2000-2024
> 2. Manufacturing vs services share of GDP
> 3. Export composition changes
> 4. Comparison with 2000s export boom
> When did domestic demand become the growth driver?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_vtp_pxt_11sf.px",
  selections: [
    { variable: "Taloustoimi", filter: "item", values: ["B1GMH", "P3", "P51G", "P6", "P7"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 6.2 The R&D Investment Challenge
*Progress toward Finland's 4% GDP target*

**Prompt for Claude:**
> Query R&D statistics to analyze:
> 1. R&D spending as percentage of GDP (2000-2024)
> 2. R&D by sector (business, government, higher education)
> 3. Comparison with Nordic countries
> 4. Which industries lead in R&D spending?
> How much additional investment is needed to reach 4%?

#### 6.3 Measuring the Unmeasurable: GDP in the Digital Age
*Challenges of capturing sharing economy and digital services*

**Prompt for Claude:**
> Explore how Finland's national accounts capture new economic activities:
> 1. ICT sector contribution to GDP over time
> 2. Platform economy indicators
> 3. Digital services export estimates
> Discuss what might be missing from traditional GDP measures.

---

## 7. Energy & Environment

### Key Themes from Tieto&trendit
- **Energy transition**: Shift from fossil fuels to renewables and nuclear
- **Global triple crisis**: Climate change, biodiversity loss, overconsumption
- **Waste challenges**: Finland lagging in EU waste reduction rankings
- **Carbon neutrality target**: 2035 deadline approaching

### Analysis Ideas

#### 7.1 Finland's Power Mix Evolution
*25 years of electricity generation transformation*

**Prompt for Claude:**
> Using StatFin energy statistics, analyze:
> 1. Electricity production by source (2000-2024)
> 2. Wind power growth trajectory
> 3. Nuclear power share changes
> 4. Fossil fuel phase-out progress
> Project when Finland might achieve carbon-neutral electricity.

**Example Query:**
```javascript
query_table({
  tableId: "statfin_sahatuo_pxt_11sr.px",
  selections: [
    { variable: "Tiedot", filter: "item", values: ["sahkon_tuot", "vesivoima", "tuulivoima", "ydinvoima"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 7.2 The Road to Carbon Neutrality 2035
*Tracking Finland's emissions reduction progress*

**Prompt for Claude:**
> Analyze Finland's greenhouse gas emissions:
> 1. Total emissions by sector (1990-2024)
> 2. Emissions per capita trend
> 3. Comparison with EU targets
> 4. Which sectors have reduced most/least?
> Calculate required annual reduction rate to meet 2035 target.

#### 7.3 Waste and Circular Economy Progress
*Why Finland lags in EU waste statistics*

**Prompt for Claude:**
> Query waste statistics to analyze:
> 1. Municipal waste per capita (Finland vs EU average)
> 2. Recycling rates by waste type
> 3. Trends in waste generation 2010-2024
> Why is Finland generating more waste while others reduce?

---

## 8. Prices & Inflation

### Key Themes from Tieto&trendit
- **Energy price shock**: 40-60% electricity price increases (2022)
- **Food price surge**: Post-Ukraine war agricultural input costs
- **Differential inflation**: Rural vs urban, young vs old experience different inflation
- **Housing cost pressure**: Rising maintenance charges and energy costs

### Analysis Ideas

#### 8.1 The Inflation Shock of 2022-2023
*Anatomy of the price surge*

**Prompt for Claude:**
> Analyze the 2022-2023 inflation episode:
> 1. Consumer price index by component (food, energy, housing)
> 2. Monthly inflation progression
> 3. Comparison with EU neighbors
> 4. Which products saw the largest increases?
> What drove the peak and what brought it down?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_khi_pxt_11xd.px",
  selections: [
    { variable: "Hyödyke", filter: "item", values: ["0", "01", "04", "07"] },
    { variable: "Kuukausi", filter: "top", top: 48 }
  ]
})
```

#### 8.2 Energy Price Impact on Households
*Who suffered most from electricity price rises?*

**Prompt for Claude:**
> Using energy price and household statistics:
> 1. Electricity prices by consumption level
> 2. Regional energy price variations
> 3. Impact on different housing types (electric heating vs district heating)
> 4. Government support measures effectiveness
> Identify the most affected household types.

#### 8.3 My Inflation vs Your Inflation
*How different households experience different price changes*

**Prompt for Claude:**
> Analyze inflation experience by household type:
> 1. Consumption baskets by household type
> 2. Weight differences (urban vs rural, young vs old)
> 3. Calculate "personal" inflation rates for different groups
> Who experienced 15% inflation while others saw only 5%?

---

## 9. Income & Inequality

### Key Themes from Tieto&trendit
- **Gender pay gap**: 16.6% earnings difference (persistent over decades)
- **Global inequality waves**: Globalization helped Asian middle class, not Western workers
- **Self-employment income**: Freelancers earn less than employees in same fields
- **Pension gap**: Gender pension gap at 20%

### Analysis Ideas

#### 9.1 The Stubborn Gender Pay Gap
*Why has Finland's gender wage gap barely moved?*

**Prompt for Claude:**
> Query wage statistics to analyze:
> 1. Gender pay gap by sector (public vs private)
> 2. Pay gap by occupation category
> 3. Trends over 25 years
> 4. Part-time work distribution by gender
> What explains the private sector's larger gap?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_pra_pxt_12h3.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["1", "2"] },
    { variable: "Sektori", filter: "item", values: ["1", "2", "3"] },
    { variable: "Vuosi", filter: "top", top: 20 }
  ]
})
```

#### 9.2 Income Distribution: Who Gained from Globalization?
*Finland's income trends in global context*

**Prompt for Claude:**
> Analyze income distribution trends:
> 1. Real income growth by decile (1995-2024)
> 2. Top 1% income share changes
> 3. Gini coefficient trends
> 4. Comparison with Nordic neighbors
> Did all Finns benefit from globalization?

#### 9.3 The Gig Economy Pay Penalty
*Self-employed earnings vs employee wages*

**Prompt for Claude:**
> Compare self-employment to employment:
> 1. Median income: self-employed vs employees by occupation
> 2. Growth of self-employment over time
> 3. Industry distribution of self-employed
> 4. Age and education patterns
> In which fields can self-employment pay off?

---

## 10. Digitalization & Technology

### Key Themes from Tieto&trendit
- **AI and ChatGPT**: Concerns about hallucination in statistics
- **Data explosion**: Challenges for statistical offices
- **Digital economy savings**: €2.7 billion potential annual savings
- **DESI rankings**: Finland leads in digitalization but lags in economic impact

### Analysis Ideas

#### 10.1 Finland's Digital Paradox
*World leaders in digitalization, slower in economic returns*

**Prompt for Claude:**
> Analyze Finland's digital economy:
> 1. ICT sector employment and value added
> 2. Business digitalization indicators
> 3. E-commerce adoption rates
> 4. Comparison with EU digital leaders
> Why does digital leadership not translate to faster growth?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_tti_pxt_11pk.px",
  selections: [
    { variable: "Toimiala", filter: "item", values: ["J", "J61", "J62", "J63"] },
    { variable: "Vuosi", filter: "top", top: 15 }
  ]
})
```

#### 10.2 AI Adoption in Finnish Businesses
*How are Finnish companies implementing artificial intelligence?*

**Prompt for Claude:**
> Query business statistics on technology adoption:
> 1. AI usage by industry sector
> 2. Company size and AI adoption correlation
> 3. Types of AI applications in use
> 4. International comparison
> Which industries lead in AI implementation?

#### 10.3 The Digital Skills Gap
*Age and digital capability in the workforce*

**Prompt for Claude:**
> Analyze digital skills in the labor force:
> 1. ICT skill levels by age group
> 2. Training participation in digital skills
> 3. Fear of technology obsolescence by age
> 4. Remote work capability by occupation
> How prepared is Finland's workforce for digital transformation?

---

## 11. Remote Work & Work-Life

### Key Themes from Tieto&trendit
- **Remote work revolution**: 15% → 31% working from home (2020)
- **No going back**: 90% of remote workers want to continue
- **Unequal impact**: Knowledge workers vs service workers
- **Sick but working**: Remote work increased presenteeism

### Analysis Ideas

#### 11.1 The Remote Work Experiment: What Stuck?
*Post-pandemic remote work patterns*

**Prompt for Claude:**
> Analyze remote work evolution:
> 1. Remote work rates before, during, and after pandemic
> 2. Industry variation in remote work adoption
> 3. Regional differences in remote work possibility
> 4. Gender patterns in hybrid work
> Which changes are permanent vs temporary?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_tyti_pxt_13ad.px",
  selections: [
    { variable: "Etätyö", filter: "all" },
    { variable: "Toimiala", filter: "item", values: ["SSS", "J", "K", "M", "O"] },
    { variable: "Vuosineljännes", filter: "top", top: 20 }
  ]
})
```

#### 11.2 Winners and Losers of Remote Work
*Who benefited vs who suffered from the work transformation?*

**Prompt for Claude:**
> Compare remote work impacts:
> 1. Work satisfaction by remote work status
> 2. Work-life balance indicators
> 3. Productivity perceptions
> 4. Social isolation indicators
> Which groups thrived vs struggled with remote work?

#### 11.3 Families and Flexibility
*How parents use remote work differently*

**Prompt for Claude:**
> Analyze remote work in families:
> 1. Remote work by parental status
> 2. Gender differences in remote work among parents
> 3. Childcare arrangements and remote work
> 4. Work hour changes with remote work
> How has remote work changed family life?

---

## 12. Regional Development

### Key Themes from Tieto&trendit
- **Population concentration**: Growth only in 5 of 19 regions (2022)
- **Urban exodus reversed**: COVID-era rural interest faded
- **Economic divergence**: Uusimaa pulling away from other regions
- **Housing market split**: Helsinki prices up 50%, elsewhere flat or declining

### Analysis Ideas

#### 12.1 The Demographic Divide: Growing vs Shrinking Regions
*Regional population trends and projections*

**Prompt for Claude:**
> Analyze regional population dynamics:
> 1. Population change by region (2000-2024)
> 2. Net migration between regions
> 3. Natural population change (births minus deaths) by region
> 4. Age structure differences
> Which regions are sustainable long-term?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_vaerak_pxt_11re.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["MK01", "MK02", "MK06", "MK08", "MK17"] },
    { variable: "Ikä", filter: "item", values: ["SSS"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 12.2 COVID's Rural Renaissance: Fact or Fiction?
*Did pandemic-era moves to countryside become permanent?*

**Prompt for Claude:**
> Analyze inter-municipal migration patterns:
> 1. City-to-countryside migration 2019-2024
> 2. Remote work and location choices
> 3. Housing purchases in rural areas
> 4. Return migration to cities
> Was the rural interest a temporary phenomenon?

#### 12.3 Regional Economy Gaps: One Finland or Many?
*Economic divergence between regions*

**Prompt for Claude:**
> Compare regional economic performance:
> 1. GDP per capita by region
> 2. Unemployment rates by municipality
> 3. Average wages by region
> 4. Business creation rates
> Is Finland becoming economically more or less equal between regions?

---

## 13. Crime & Safety

### Key Themes from Tieto&trendit
- **Youth crime perception**: One crime stigmatizes 99 innocent youth
- **Crime statistics methodology**: How recording affects reported crime
- **Foreign background and crime**: Nuanced patterns in data
- **Seasonal patterns**: Crime follows predictable annual cycles

### Analysis Ideas

#### 13.1 Youth Crime: Facts vs Perceptions
*What do the statistics really show about young offenders?*

**Prompt for Claude:**
> Analyze youth crime statistics:
> 1. Crimes by age group of suspect
> 2. Types of crimes committed by youth
> 3. Trends over 10 years
> 4. Regional distribution
> How representative are high-profile cases?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_rpk_pxt_13jt.px",
  selections: [
    { variable: "Rikosryhmä ja teonkuvauksen tarkenne", filter: "item", values: ["101T603", "101T504X406", "101T161"] },
    { variable: "Tiedot", filter: "item", values: ["rikokset_lkm"] },
    { variable: "Kuukausi", filter: "top", top: 60 }
  ]
})
```

#### 13.2 Crime Patterns Over Time
*Long-term trends in reported crime*

**Prompt for Claude:**
> Query crime statistics for trend analysis:
> 1. Total reported crimes per 1000 inhabitants (2000-2024)
> 2. Crime types showing increase vs decrease
> 3. Violent vs property crime trends
> 4. International comparison
> Is Finland becoming safer or more dangerous?

#### 13.3 Seasonal Rhythms of Crime
*When and where crime happens*

**Prompt for Claude:**
> Analyze crime seasonality:
> 1. Monthly crime rates by type
> 2. Day of week patterns
> 3. Regional crime rates
> 4. Weather and crime correlation
> When should police deploy extra resources?

---

## 14. Households & Consumption

### Key Themes from Tieto&trendit
- **Pandemic consumption shift**: Restaurants closed, home spending up
- **Savings surge**: Record household savings rates during COVID
- **Debt reduction**: First decline in household debt ratios since 1990s (2022)
- **Inflation impact**: Discretionary spending down, essentials up

### Analysis Ideas

#### 14.1 The Pandemic Consumption Revolution
*How COVID-19 transformed household spending*

**Prompt for Claude:**
> Analyze consumption pattern changes:
> 1. Household consumption by category (2019 vs 2020 vs 2021)
> 2. Categories with largest increases/decreases
> 3. Recovery patterns post-pandemic
> 4. Comparison with pre-pandemic norms
> Which changes are permanent?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_ktutk_pxt_141p.px",
  selections: [
    { variable: "Kulutusmenon kohde", filter: "item", values: ["01", "04", "07", "09", "11"] },
    { variable: "Vuosi", filter: "top", top: 10 }
  ]
})
```

#### 14.2 Household Debt: A Turning Point?
*The end of decades-long debt accumulation*

**Prompt for Claude:**
> Analyze household debt patterns:
> 1. Household debt to income ratio (1990-2024)
> 2. Debt by household type
> 3. Mortgage vs consumer debt distribution
> 4. Interest rate sensitivity
> Is the debt decline temporary or structural?

#### 14.3 The Inflation Squeeze: Adapting Spending
*How households responded to 2022-2023 price rises*

**Prompt for Claude:**
> Track consumption responses to inflation:
> 1. Real consumption changes by category during inflation
> 2. Trading down patterns (premium to budget)
> 3. Energy consumption adjustments
> 4. Savings rate changes
> How did different income groups cope?

---

## 15. Health & Mortality

### Key Themes from Tieto&trendit
- **Life expectancy gains**: Baby boomers living 10 years longer than expected
- **Centenarians increasing**: More people reaching 100
- **Youth mortality reversal**: 15-19 mortality increasing again
- **COVID mortality**: Challenges in cause-of-death statistics

### Analysis Ideas

#### 15.1 Living Longer: Life Expectancy Trends
*Finland's remarkable gains in longevity*

**Prompt for Claude:**
> Analyze life expectancy data:
> 1. Life expectancy at birth (1970-2024)
> 2. Gender gap in life expectancy
> 3. Life expectancy at age 65
> 4. Regional variations
> How much longer are Finns living compared to projections?

**Example Query:**
```javascript
query_table({
  tableId: "statfin_kuol_pxt_12an.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["1", "2"] },
    { variable: "Ikä", filter: "item", values: ["0", "65"] },
    { variable: "Vuosi", filter: "top", top: 50 }
  ]
})
```

#### 15.2 The 100 Club: Rise of Centenarians
*Finland's oldest citizens*

**Prompt for Claude:**
> Query population by extreme age:
> 1. Number of 90+, 95+, 100+ residents over time
> 2. Gender distribution at advanced ages
> 3. Geographic concentration
> 4. Survival rates by birth decade
> What explains the centenarian boom?

#### 15.3 Mortality Trends by Cause
*How cause of death patterns are changing*

**Prompt for Claude:**
> Analyze mortality statistics:
> 1. Deaths by major cause category (2000-2024)
> 2. Changes in cancer, heart disease, accident mortality
> 3. Age-standardized mortality rates
> 4. COVID-19 impact on overall mortality
> Which causes of death are declining vs increasing?

---

## 16. Sustainable Development

### Key Themes from Tieto&trendit
- **SDG progress lagging**: Global goals at risk of failure
- **Temperature records**: 1.5°C threshold crossed
- **Green transition tracking**: New environmental subsidy statistics
- **Environmental accounting**: Linking economy and environment data

### Analysis Ideas

#### 16.1 Finland's SDG Scorecard
*Progress toward 2030 sustainable development goals*

**Prompt for Claude:**
> Analyze Finland's sustainable development indicators:
> 1. SDG indicator trends (2015-2024)
> 2. Areas of progress vs stagnation
> 3. Comparison with Nordic countries
> 4. Goals at risk of not being met
> Where is Finland succeeding and failing?

**Example Query:**
```javascript
search_statistics({ query: "sustainable development indicators" })
// Then query relevant tables for environmental, social, economic dimensions
```

#### 16.2 The Green Transition Investment Gap
*Tracking environmental subsidies and investments*

**Prompt for Claude:**
> Analyze environmental investment:
> 1. Government environmental subsidies by type
> 2. Business environmental investment
> 3. Green bond issuance
> 4. Renewable energy investment trends
> Is investment keeping pace with climate targets?

#### 16.3 Economic Growth vs Environmental Impact
*Environmental accounting for GDP*

**Prompt for Claude:**
> Explore environment-economy links:
> 1. Emissions per unit of GDP
> 2. Resource intensity of production
> 3. Environmental taxes as share of total taxes
> 4. Material footprint trends
> Is Finland achieving green growth or just greenwashing?

---

## Quick Reference: Example Prompts for Claude

### Basic Discovery
> "What statistics does StatFin have about [topic]?"
> "Search for tables about [keyword] in Finnish"
> "List all subject areas in StatFin"

### Data Exploration
> "Show me the variables and structure of table [tableId]"
> "What region codes are available for [table]?"
> "Get all years available in [table]"

### Analysis Queries
> "Query [table] for Helsinki population for the last 10 years"
> "Compare [metric] between [regions] from 2000 to 2024"
> "Show monthly [indicator] trends for the past 5 years"

### Complex Analysis
> "Analyze the relationship between [variable1] and [variable2] using StatFin data"
> "Create a regional comparison of [topic] across all Finnish regions"
> "Show how [indicator] has changed before, during, and after COVID-19"

---

## Data Sources

All analyses use Statistics Finland's official StatFin database:
- **API**: https://pxdata.stat.fi/PxWeb/api/v1
- **Web interface**: https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/
- **Blog source**: https://stat.fi/tietotrendit/blogit

Statistics Finland is Finland's national statistical institute, producing official statistics since 1865.

---

*This document was created based on analysis of 100+ blog posts from Statistics Finland's Tieto&trendit publication (2015-2025).*
