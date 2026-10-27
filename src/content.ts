import type {
  ActivityTemplate,
  Brief,
  Chip,
  ItemSection,
  Kind,
  Milestone,
  Person,
  PhasePlan,
  Project,
  Question,
  SearchHit,
} from './types'
import { statusLabel } from './format'

export const SEED = 'Jag vill skapa en dashboard som hjälper vårt säljteam att förstå hur försäljningen utvecklas.'

export const SECTIONS: { id: string; title: string }[] = [
  { id: 'name', title: 'Projektnamn' },
  { id: 'background', title: 'Bakgrund och problem' },
  { id: 'goals', title: 'Mål och önskat resultat' },
  { id: 'audience', title: 'Målgrupp' },
  { id: 'scope', title: 'Omfattning och avgränsningar' },
  { id: 'deliverables', title: 'Leverabler' },
  { id: 'sources', title: 'Tillgängliga underlag och datakällor' },
  { id: 'constraints', title: 'Tidsram och begränsningar' },
  { id: 'success', title: 'Framgångskriterier' },
  { id: 'assumptions', title: 'Antaganden och öppna frågor' },
]

export const FREDRIK: Person = {
  id: 'fredrik',
  name: 'Fredrik',
  email: 'fredrik@studionord.se',
  kind: 'human',
  role: 'Projektägare',
  skills: [],
  why: '',
  examples: [],
  look: 'fredrik',
}

const BASE = {
  nora: { id: 'nora', name: 'Nora Ek', look: 'nora' },
  elias: { id: 'elias', name: 'Elias Berg', look: 'elias' },
  saga: { id: 'saga', name: 'Saga Lind', look: 'saga' },
  amir: { id: 'amir', name: 'Amir Nouri', look: 'amir' },
  liv: { id: 'liv', name: 'Liv Ahlberg', look: 'liv' },
  noel: { id: 'noel', name: 'Noel Franzén', look: 'noel' },
} as const

function agent(
  id: keyof typeof BASE,
  fields: Omit<Person, 'id' | 'name' | 'look' | 'kind' | 'email'>,
): Person {
  return { ...BASE[id], kind: 'agent', ...fields }
}

const DASHBOARD_TEAM: Person[] = [
  agent('nora', {
    role: 'Projektledare',
    lead: true,
    skills: ['Samordning', 'Planering', 'Uppföljning', 'Beslut'],
    why: 'Dashboarden berör data, ett säljmöte och ett datum i november. Någon behöver hålla isär vad agenterna kan göra själva och vad som väntar på er.',
    examples: [
      'Delar upp arbetet i aktiviteter med en ägare',
      'Säger till när ett beslut saknas innan någon ritar vidare',
      'Sammanfattar läget inför måndagsmötet 23 november',
    ],
  }),
  agent('elias', {
    role: 'Dataanalytiker',
    skills: ['Datakällor', 'Datakvalitet', 'Nyckeltal', 'Analys'],
    why: 'Pipeline, win rate och intäkt mot mål blir bara användbara om definitionerna håller och om Pipedrive och Fortnox går att jämföra.',
    examples: [
      'Föreslår definitioner för pipeline, win rate och intäkt mot mål',
      'Granskar dubbletter, saknade belopp och stängningsdatum',
      'Väntar med själva analysen tills ett utdrag finns',
    ],
  }),
  agent('saga', {
    role: 'Visualiseringsexpert',
    skills: ['Diagram', 'Informationshierarki', 'Presentation av insikter'],
    why: 'Måndagsmötet behöver se var insatserna ska läggas. En vägg av diagram hjälper inte Karin att välja.',
    examples: [
      'Föreslår en förstasida med få tal',
      'Ritar pipeline per steg när nyckeltalen är bekräftade',
      'Tar bort sådant som inte stödjer veckans beslut',
    ],
  }),
  agent('amir', {
    role: 'UX-designer',
    skills: ['Användarbehov', 'Struktur', 'Användarflöden'],
    why: 'Säljare och säljchef använder läget på olika sätt. Vägen in i mötet behöver vara kort.',
    examples: [
      'Skissar flödet från öppnat läge till vald insats',
      'Skriver vad man ser när data saknas',
      'Håller samma vy för Karin och säljarna, med filter på ägare',
    ],
  }),
]

const LAUNCH_TEAM: Person[] = [
  agent('nora', {
    role: 'Projektledare',
    lead: true,
    skills: ['Samordning', 'Tidplan', 'Uppföljning', 'Beslut'],
    why: 'En lansering spricker om budskap, sida och datum inte har samma ägare.',
    examples: [
      'Håller tidplanen mot lanseringsdagen',
      'Pekar ut vad som måste vara klart innan',
      'Samlar öppna frågor så de inte blir tysta antaganden',
    ],
  }),
  agent('liv', {
    role: 'Kommunikationsstrateg',
    skills: ['Budskap', 'Kanaler', 'Material'],
    why: 'Det som lanseras behöver kunna sägas i en mening, och nå rätt personer.',
    examples: [
      'Formulerar löftet och vad som inte ingår',
      'Föreslår kanaler mot den målgrupp ni bekräftar',
      'Skriver underlag säljare kan använda veckan efter',
    ],
  }),
  agent('amir', {
    role: 'UX-designer',
    skills: ['Användarbehov', 'Struktur', 'Användarflöden'],
    why: 'Första mötet med det nya behöver vara begripligt utan en genomgång.',
    examples: [
      'Skissar sidan eller flödet för lanseringen',
      'Tar bort sådant som inte behövs dag ett',
      'Skriver tomtillstånd och första steget',
    ],
  }),
  agent('elias', {
    role: 'Analytiker',
    skills: ['Mål', 'Baslinje', 'Uppföljning'],
    why: 'Utan en baslinje går det inte att veta om lanseringen gjorde någon skillnad.',
    examples: [
      'Föreslår vad som ska räknas veckan efter',
      'Pekar ut var siffrorna finns idag',
      'Väntar med uppföljningen tills målet är bekräftat',
    ],
  }),
]

const SERVICE_TEAM: Person[] = [
  agent('nora', {
    role: 'Projektledare',
    lead: true,
    skills: ['Samordning', 'Planering', 'Uppföljning', 'Beslut'],
    why: 'En ny tjänst behöver en smal första version och någon som håller resten utanför.',
    examples: [
      'Håller isär pilot och senare version',
      'Följer upp öppna frågor',
      'Ser till att varje aktivitet har en ägare',
    ],
  }),
  agent('amir', {
    role: 'Tjänstedesigner',
    skills: ['Användarbehov', 'Struktur', 'Användarflöden'],
    why: 'Första versionen ska lösa ett konkret problem för en namngiven grupp, inte ett helt erbjudande.',
    examples: [
      'Avgränsar flödet som ingår i piloten',
      'Beskriver vad användaren gör första gången',
      'Skriver vad som medvetet lämnas utanför',
    ],
  }),
  agent('noel', {
    role: 'Affärsanalytiker',
    skills: ['Målgrupp', 'Löfte', 'Underlag'],
    why: 'Någon behöver säga vem som har problemet och vilket underlag som redan finns.',
    examples: [
      'Sammanställer problem, användare och löfte',
      'Pekar ut vilket underlag som saknas',
      'Föreslår hur ni vet att piloten är värd att gå vidare med',
    ],
  }),
  agent('liv', {
    role: 'Erbjudande och innehåll',
    skills: ['Löfte', 'Tonalitet', 'Exempel'],
    why: 'Tjänsten behöver kunna förklaras utan en workshop.',
    examples: [
      'Skriver löftet i en mening',
      'Ger ett exempel på hur det låter mot kunden',
      'Håller isär internt språk och det kunden hör',
    ],
  }),
]

export function agentsFor(kind: Kind): Person[] {
  if (kind === 'launch') return LAUNCH_TEAM
  if (kind === 'service' || kind === 'custom') return SERVICE_TEAM
  return DASHBOARD_TEAM
}

export function catalog(kind: Kind): Person[] {
  return [FREDRIK, ...agentsFor(kind)]
}

export function leadFor(kind: Kind): Person {
  return agentsFor(kind).find((p) => p.lead) ?? agentsFor(kind)[0]
}

export function findPerson(id: string, kind: Kind, people: Person[] = []): Person | undefined {
  return people.find((p) => p.id === id) ?? catalog(kind).find((p) => p.id === id)
}

function chip(label: string, text: string, also?: Chip['also']): Chip {
  return { label, text, also }
}

const DASHBOARD_QUESTIONS: Question[] = [
  {
    id: 'audience',
    sectionId: 'audience',
    prompt: 'Vilka ska använda dashboarden i vardagen?',
    openText: 'Vilka ska använda dashboarden?',
    keywords: ['säljare', 'säljchef', 'karin', 'användare', 'ledning', 'målgrupp', 'chefen'],
    assumption: 'Troligen säljare och säljchef Karin Wallin, eftersom dashboarden ska hjälpa säljteamet att prioritera.',
    chips: [
      chip(
        'Säljare och säljchef',
        'Säljare på Studio Nord och säljchef Karin Wallin. Säljarna tittar på sina affärer, Karin använder den på måndagsmötet.',
      ),
      chip('Bara ledningsgruppen', 'Ledningsgruppen. Säljarna är inte vardagsanvändare i första versionen.'),
    ],
  },
  {
    id: 'decisions',
    sectionId: 'goals',
    prompt: 'Vilka beslut ska den hjälpa till med?',
    openText: 'Vilka beslut ska dashboarden stödja?',
    keywords: ['beslut', 'prioriter', 'insats', 'fokus', 'lägga', 'affär'],
    assumption: 'Troligen beslut om var teamet ska lägga insatserna den kommande veckan.',
    chips: [
      chip(
        'Var vi lägger insatserna',
        'Besluta var teamet ska lägga nästa insatser: vilka affärer som behöver hjälp, vilka säljare som ligger efter och var pipelinen tappar fart.',
      ),
      chip(
        'Om vi når målet',
        'Besluta om intäkten ligger mot mål och var prognosen behöver en insats den här veckan.',
      ),
    ],
  },
  {
    id: 'kpis',
    sectionId: 'deliverables',
    prompt: 'Vilka nyckeltal spelar roll i första versionen?',
    openText: 'Vilka nyckeltal ska med i första versionen?',
    keywords: ['nyckeltal', 'kpi', 'pipeline', 'win rate', 'intäkt', 'säljcykel', 'omsättning'],
    assumption: 'Troligen viktad pipeline, win rate och intäkt mot mål. Det är så säljteamet brukar läsa läget.',
    chips: [
      chip(
        'Pipeline, win rate och intäkt mot mål',
        'Version 1 visar viktad pipeline, win rate, intäkt mot mål och längd på säljcykeln.',
        [{ sectionId: 'success', text: 'De fyra talen ska räcka för att välja insats på måndagsmötet.' }],
      ),
      chip('Bara intäkt mot mål', 'Första versionen visar intäkt mot mål. Pipeline och win rate får vänta.'),
    ],
  },
  {
    id: 'sources',
    sectionId: 'sources',
    prompt: 'Var finns försäljningsdatan idag?',
    openText: 'Var finns försäljningsdatan idag?',
    keywords: ['pipedrive', 'fortnox', 'excel', 'crm', 'kalkyl', 'källa', 'ekonomisystem', 'hubspot'],
    assumption: 'Troligen ett CRM och ekonomisystemet, med manuell sammanställning däremellan.',
    chips: [
      chip(
        'Pipedrive och Fortnox',
        'Affärer och pipeline ligger i Pipedrive. Intäkt mot mål tas ur Fortnox. Idag sammanställs det i kalkylblad inför möten.',
      ),
      chip('Mest i kalkylblad', 'Läget samlas i kalkylblad. Det finns inget CRM som teamet litar på ännu.'),
    ],
  },
  {
    id: 'scope',
    sectionId: 'scope',
    prompt: 'Vad ska första versionen innehålla, och vad ska den inte innehålla?',
    openText: 'Vad ingår i första versionen, och vad ingår inte?',
    keywords: ['version', 'omfattning', 'ingår', 'vy', 'måndag', 'avgräns', 'första'],
    assumption: 'Troligen en smal vy för säljmötet, inte prognosmodell, provision eller en mobilapp.',
    chips: [
      chip(
        'En vy för måndagsmötet',
        'Första versionen är en vy för måndagsmötet. Prognosmodeller, provision och mobilapp ingår inte.',
        [{ sectionId: 'deliverables', text: 'En dashboardvy som går att använda utan kalkylblad.' }],
      ),
      chip('Flera vyer från start', 'Första versionen har separata vyer för säljare, säljchef och ledning.'),
    ],
  },
  {
    id: 'deadline',
    sectionId: 'constraints',
    prompt: 'Finns det ett datum eller någon annan gräns?',
    openText: 'Vilken tidsram och vilka begränsningar gäller?',
    keywords: ['november', 'december', 'deadline', 'datum', 'vecka', 'årsskifte', 'tidsram', 'oktober', 'fredag'],
    assumption: 'Inget datum är satt. Ett rimligt första mål är 20 november 2026, med måndagsmötet 23 november som första skarpa tillfälle.',
    chips: [
      chip(
        'Klar till 20 november',
        'Första versionen ska kunna användas 20 november 2026. Måndagsmötet 23 november är första skarpa tillfället. Datautdraget behövs senast 30 oktober.',
      ),
      chip('Ingen fast deadline', 'Det finns inget hårt datum. Arbetet får ta den tid underlaget kräver.'),
    ],
  },
  {
    id: 'success',
    sectionId: 'success',
    prompt: 'Hur vet vi att dashboarden räcker?',
    openText: 'Hur vet vi att det lyckades?',
    keywords: ['framgång', 'lyck', 'vet att', 'utan att', 'räcker', 'slipper'],
    assumption: 'Troligen att säljchefen kan prioritera insatser på måndagsmötet utan att samla siffror för hand.',
    chips: [
      chip(
        'Karin prioriterar utan att byta system',
        'Karin kan på måndagsmötet 23 november peka ut var insatserna ska läggas utan att öppna Pipedrive, Fortnox och kalkylbladet.',
      ),
      chip('Säljarna öppnar den varje vecka', 'Säljarna öppnar dashboarden varje vecka utan att bli påminda.'),
    ],
  },
]

const LAUNCH_QUESTIONS: Question[] = [
  {
    id: 'what',
    sectionId: 'deliverables',
    prompt: 'Vad är det som ska lanseras?',
    openText: 'Vad är det som ska lanseras?',
    keywords: ['funktion', 'kampanj', 'produkt', 'erbjudande', 'lanserar', 'release'],
    assumption: 'Troligen något befintliga kunder ska märka, inte en intern omorganisation.',
    chips: [
      chip('En ny funktion', 'Det som lanseras är en ny funktion i produkten, inte ett helt nytt varumärke.'),
      chip('En kampanj', 'Det som lanseras är en kampanj mot befintliga kunder.'),
    ],
  },
  {
    id: 'who',
    sectionId: 'audience',
    prompt: 'Vem är lanseringen till för?',
    openText: 'Vem är lanseringen till för?',
    keywords: ['kund', 'marknad', 'användare', 'sälj', 'internt'],
    assumption: 'Troligen befintliga kunder och säljarna som ska prata om det.',
    chips: [
      chip('Befintliga kunder', 'Första vågen är befintliga kunder. Nya marknader ingår inte.'),
      chip('En ny marknad', 'Lanseringen riktar sig till en ny marknad, inte bara dagens kunder.'),
    ],
  },
  {
    id: 'when',
    sectionId: 'constraints',
    prompt: 'Vilket datum siktar ni på?',
    openText: 'Vilket datum siktar lanseringen på?',
    keywords: ['december', 'november', 'datum', 'vecka', 'årsskifte'],
    assumption: 'Inget datum är satt. Ett rimligt mål är början av december 2026.',
    chips: [
      chip('1 december 2026', 'Lanseringsdag 1 december 2026.'),
      chip('Innan årsskiftet', 'Lanseringen ska vara ute innan årsskiftet 2026.'),
    ],
  },
  {
    id: 'ready',
    sectionId: 'scope',
    prompt: 'Vad måste vara klart innan dess?',
    openText: 'Vad måste vara klart före lanseringen?',
    keywords: ['budskap', 'sida', 'material', 'klart', 'ingår', 'stöd'],
    assumption: 'Troligen budskap, en sida och något säljarna kan säga i mötet.',
    chips: [
      chip(
        'Sida, budskap och säljstöd',
        'Innan lanseringen behövs en sida, ett budskap och stöd till säljarna. Betald kampanj ingår inte i första vågen.',
      ),
    ],
  },
  {
    id: 'success',
    sectionId: 'success',
    prompt: 'Hur vet ni att lanseringen lyckades?',
    openText: 'Hur vet ni att lanseringen lyckades?',
    keywords: ['lyck', 'framgång', 'använder', 'veckan'],
    assumption: 'Troligen att de första kunderna faktiskt använder det veckan efter.',
    chips: [chip('De använder det veckan efter', 'De första kunderna använder det under veckan efter lanseringen.')],
  },
]

const SERVICE_QUESTIONS: Question[] = [
  {
    id: 'problem',
    sectionId: 'background',
    prompt: 'Vilket problem ska tjänsten lösa?',
    openText: 'Vilket problem ska tjänsten lösa?',
    keywords: ['problem', 'fastnar', 'köp', 'krångel', 'behöver', 'saknar'],
    assumption: 'Troligen ett konkret hinder innan köp, inte ett allmänt önskemål om mer service.',
    chips: [chip('Kunder fastnar innan de köper', 'Kunder fastnar innan de köper. Tjänsten ska ta bort det hindret, inte lägga till fler steg.')],
  },
  {
    id: 'users',
    sectionId: 'audience',
    prompt: 'Vilka är de första användarna?',
    openText: 'Vilka är de första användarna?',
    keywords: ['pilot', 'kund', 'användare', 'team', 'första'],
    assumption: 'Troligen ett pilotteam hos en kund, inte hela marknaden.',
    chips: [chip('Ett pilotteam', 'Första användarna är ett pilotteam hos en kund. Bred lansering ingår inte.')],
  },
  {
    id: 'scope',
    sectionId: 'scope',
    prompt: 'Vad ingår i en första version, och vad ingår inte?',
    openText: 'Vad ingår i första versionen av tjänsten?',
    keywords: ['version', 'ingår', 'flöde', 'pilot', 'avgräns', 'inte'],
    assumption: 'Troligen ett avgränsat flöde. Resten av plattformen lämnas utanför.',
    chips: [
      chip(
        'Ett avgränsat flöde',
        'Första versionen är ett avgränsat flöde. Administration, integrationer och fler roller ingår inte.',
      ),
    ],
  },
  {
    id: 'when',
    sectionId: 'constraints',
    prompt: 'När behöver den finnas?',
    openText: 'När behöver första versionen finnas?',
    keywords: ['december', 'november', 'pilot', 'datum', 'vecka'],
    assumption: 'Inget datum är satt. En pilot i december 2026 är ett rimligt antagande.',
    chips: [chip('En pilot i december', 'En pilot ska kunna köras i december 2026.')],
  },
  {
    id: 'success',
    sectionId: 'success',
    prompt: 'Hur vet ni att den är värd att gå vidare med?',
    openText: 'Hur vet ni att tjänsten är värd att gå vidare med?',
    keywords: ['vidare', 'fortsätta', 'lyck', 'pilot', 'veckor'],
    assumption: 'Troligen att piloten vill fortsätta efter fyra veckor.',
    chips: [chip('Piloten vill fortsätta', 'Piloten vill fortsätta efter fyra veckor, utan att vi behöver övertyga dem på nytt.')],
  },
]

const CUSTOM_QUESTIONS: Question[] = [
  {
    id: 'outcome',
    sectionId: 'goals',
    prompt: 'Vad ska vara annorlunda när det är klart?',
    openText: 'Vad ska vara annorlunda när det är klart?',
    keywords: ['klart', 'resultat', 'annorlunda', 'mål', 'vill'],
    assumption: 'Troligen ett konkret resultat någon kan använda, inte bara en utredning.',
    chips: [chip('Något man kan använda', 'Klart betyder att någon kan använda resultatet i sitt vanliga arbete.')],
  },
  {
    id: 'who',
    sectionId: 'audience',
    prompt: 'Vem är det till för?',
    openText: 'Vem är projektet till för?',
    keywords: ['kund', 'team', 'användare', 'vi', 'chef'],
    assumption: 'Troligen en namngiven grupp internt eller hos en kund, inte alla på en gång.',
    chips: [chip('Ett team hos oss', 'Det är till för ett team på Studio Nord.')],
  },
  {
    id: 'scope',
    sectionId: 'scope',
    prompt: 'Vad ingår i en första version?',
    openText: 'Vad ingår i en första version?',
    keywords: ['version', 'ingår', 'första', 'bara'],
    assumption: 'Troligen en smal första version. Resten får vänta tills den är prövad.',
    chips: [chip('En smal första version', 'Första versionen är medvetet smal. Sådant som kan vänta ingår inte.')],
  },
  {
    id: 'when',
    sectionId: 'constraints',
    prompt: 'Finns det ett datum eller någon annan gräns?',
    openText: 'Finns det ett datum eller någon annan gräns?',
    keywords: ['november', 'december', 'datum', 'vecka', 'deadline'],
    assumption: 'Inget datum är satt.',
    chips: [chip('Senare i november', 'Ett första resultat ska finnas senare i november 2026.')],
  },
  {
    id: 'success',
    sectionId: 'success',
    prompt: 'Hur vet ni att det lyckades?',
    openText: 'Hur vet ni att det lyckades?',
    keywords: ['lyck', 'framgång', 'vet', 'räcker'],
    assumption: 'Troligen att målgruppen använder det utan en extra genomgång.',
    chips: [chip('De använder det utan genomgång', 'Målgruppen kan använda resultatet utan en extra genomgång.')],
  },
]

export function questionsFor(kind: Kind): Question[] {
  if (kind === 'dashboard') return DASHBOARD_QUESTIONS
  if (kind === 'launch') return LAUNCH_QUESTIONS
  if (kind === 'service') return SERVICE_QUESTIONS
  return CUSTOM_QUESTIONS
}

export function detectKind(text: string): Kind {
  const t = text.toLowerCase()
  if (t.includes('dashboard') || t.includes('försäljning') || t.includes('forsaljning')) return 'dashboard'
  if (t.includes('lansering') || t.includes('lansera')) return 'launch'
  if (t.includes('tjänst') || t.includes('tjanst')) return 'service'
  return 'custom'
}

export function defaultName(kind: Kind, text: string): string {
  if (kind === 'dashboard') return 'Försäljningsdashboard'
  if (kind === 'launch') return 'Lansering'
  if (kind === 'service') return 'Ny tjänst'
  const words = text.replace(/[.?!].*$/, '').trim().split(/\s+/).slice(0, 6).join(' ')
  if (words.length < 8) return 'Nytt projekt'
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function openingFor(kind: Kind): string {
  const asks = questionsFor(kind)
    .slice(0, 2)
    .map((q) => q.prompt)
    .join('\n')
  const intro =
    kind === 'dashboard'
      ? 'Jag är Nora. Jag tar det här som en försäljningsdashboard för säljteamet på Studio Nord: ni vill förstå hur försäljningen utvecklas och prioritera rätt insatser. Briefen växer här bredvid. Antaganden är markerade, så du ser vad jag har föreslagit själv.'
      : kind === 'launch'
        ? 'Jag är Nora. Jag tar det här som en lansering och samlar briefen här bredvid. Antaganden är markerade, så du ser vad jag har föreslagit själv.'
        : kind === 'service'
          ? 'Jag är Nora. Jag tar det här som en ny tjänst och samlar briefen här bredvid. Antaganden är markerade, så du ser vad jag har föreslagit själv.'
          : 'Jag är Nora. Jag tar det här som starten på ett projekt och samlar briefen här bredvid. Antaganden är markerade, så du ser vad jag har föreslagit själv.'
  return `${intro}\n\n${asks}`
}

export function initialItems(kind: Kind, userText: string): { sectionId: ItemSection; text: string; origin: 'confirmed' | 'assumption' }[] {
  if (kind === 'dashboard') {
    return [
      {
        sectionId: 'background',
        origin: 'assumption',
        text: 'Säljteamet saknar en samlad bild av hur försäljningen utvecklas. Inför möten plockas läget ihop från flera ställen, och det är otydligt var insatserna gör mest nytta.',
      },
      { sectionId: 'goals', origin: 'confirmed', text: userText.trim() },
      {
        sectionId: 'deliverables',
        origin: 'assumption',
        text: 'En första dashboard med få vyer, tillräcklig för säljmötet. Inte en komplett säljplattform.',
      },
    ]
  }
  if (kind === 'launch') {
    return [
      { sectionId: 'background', origin: 'confirmed', text: userText.trim() },
      {
        sectionId: 'goals',
        origin: 'assumption',
        text: 'En lansering med tydligt datum, budskap och en lista på vad som måste vara klart innan.',
      },
    ]
  }
  if (kind === 'service') {
    return [
      { sectionId: 'background', origin: 'confirmed', text: userText.trim() },
      {
        sectionId: 'goals',
        origin: 'assumption',
        text: 'En avgränsad första version av en ny tjänst, tillräcklig för att testa om den är värd att gå vidare med.',
      },
    ]
  }
  return [
    { sectionId: 'background', origin: 'confirmed', text: userText.trim() },
    {
      sectionId: 'goals',
      origin: 'assumption',
      text: 'Ett konkret resultat som målgruppen kan använda, snarare än en öppen utredning.',
    },
  ]
}

export function activitiesFor(kind: Kind): ActivityTemplate[] {
  if (kind === 'dashboard') {
    return [
      {
        key: 'upload',
        title: 'Ladda upp datautdrag',
        description:
          'Exportera affärer från Pipedrive och intäkt mot mål från Fortnox för 2026. En CSV räcker till första genomgången: affär, steg, värde, ägare och stängningsdatum.',
        ownerId: 'fredrik',
        status: 'todo',
        deadline: '2026-10-30',
        dependsOn: [],
        blockers: [],
        agentCanStart: false,
        needsHuman: 'Bara en människa kan ta ut data ur Pipedrive och Fortnox.',
      },
      {
        key: 'quality',
        title: 'Granska datakvaliteten',
        description:
          'Gå igenom utdraget: saknade belopp, dubbletter, stängningsdatum och om pipelinestegen används likadant.',
        ownerId: 'elias',
        contributorIds: ['nora'],
        status: 'waiting',
        deadline: '2026-11-03',
        dependsOn: ['upload'],
        blockers: ['Väntar på att Fredrik laddar upp datautdraget.'],
        agentCanStart: false,
        needsHuman: 'Analysen kan inte börja förrän en människa laddat upp försäljningsdatan.',
      },
      {
        key: 'kpis',
        title: 'Föreslå nyckeltal för version 1',
        description:
          'Skriv definitioner för viktad pipeline, win rate, intäkt mot mål och säljcykelns längd. Förslaget kan skrivas innan datan är uppladdad.',
        ownerId: 'elias',
        contributorIds: ['nora'],
        status: 'todo',
        deadline: '2026-11-04',
        dependsOn: [],
        blockers: [],
        agentCanStart: true,
        needsHuman: 'Förslaget kan skrivas av agenten. En människa behöver sedan bekräfta definitionerna.',
      },
      {
        key: 'confirm-kpi',
        title: 'Bekräfta nyckeltalen',
        description:
          'Säg ja eller justera förslaget: viktad pipeline, win rate, intäkt mot mål och längd på säljcykeln.',
        ownerId: 'fredrik',
        status: 'todo',
        deadline: '2026-11-04',
        dependsOn: ['kpis'],
        blockers: [],
        agentCanStart: false,
        needsHuman: 'En människa behöver godkänna vilka tal som styr version 1.',
      },
      {
        key: 'charts',
        title: 'Föreslå diagram till måndagsmötet',
        description:
          'När nyckeltalen är bekräftade: en förstasida med intäkt mot mål, win rate och viktad pipeline per steg.',
        ownerId: 'saga',
        contributorIds: ['nora'],
        status: 'waiting',
        deadline: '2026-11-11',
        dependsOn: ['confirm-kpi'],
        blockers: ['Väntar på att nyckeltalen är bekräftade.'],
        agentCanStart: false,
        needsHuman: 'Diagrammen ritas först när en människa har bekräftat nyckeltalen.',
      },
      {
        key: 'flow',
        title: 'Skissa flödet för måndagsmötet',
        description:
          'Strukturera vägen från öppnad dashboard till ett beslut om nästa insats. Håll det till en vy, med filter på ägare för säljarna.',
        ownerId: 'amir',
        status: 'todo',
        deadline: '2026-11-06',
        dependsOn: [],
        blockers: [],
        agentCanStart: true,
      },
    ]
  }
  if (kind === 'launch') {
    return [
      {
        key: 'confirm-offer',
        title: 'Bekräfta vad som lanseras och för vem',
        description: 'Skriv i en mening vad som lanseras och vem första vågen är till för.',
        ownerId: 'fredrik',
        status: 'todo',
        dependsOn: [],
        blockers: [],
        agentCanStart: false,
        needsHuman: 'Bara ni kan bekräfta erbjudandet och målgruppen.',
      },
      {
        key: 'message',
        title: 'Ta fram budskap och kanaler',
        description: 'Formulera löftet och föreslå kanaler när målgruppen är bekräftad.',
        ownerId: 'liv',
        status: 'waiting',
        dependsOn: ['confirm-offer'],
        blockers: ['Väntar på att erbjudandet och målgruppen är bekräftade.'],
        agentCanStart: false,
        needsHuman: 'Budskapet kan skrivas först när en människa bekräftat vad som lanseras.',
      },
      {
        key: 'page',
        title: 'Skissa lanseringssidan',
        description: 'En sida som bär budskapet, utan extra avsnitt.',
        ownerId: 'amir',
        status: 'waiting',
        dependsOn: ['message'],
        blockers: ['Väntar på bekräftat budskap.'],
        agentCanStart: false,
        needsHuman: 'Sidan skissas när budskapet är överenskommet.',
      },
    ]
  }
  return [
    {
      key: 'problem',
      title: 'Beskriv problemet och de första användarna',
      description: 'En kort text: vem som har problemet, och vem som är med i piloten.',
      ownerId: 'fredrik',
      status: 'todo',
      dependsOn: [],
      blockers: [],
      agentCanStart: false,
      needsHuman: 'Problemet och pilotgruppen behöver bekräftas av en människa.',
    },
    {
      key: 'boundary',
      title: 'Avgränsa första versionen',
      description: 'Vad flödet innehåller och vad som lämnas utanför.',
      ownerId: 'amir',
      status: 'todo',
      dependsOn: [],
      blockers: [],
      agentCanStart: true,
    },
    {
      key: 'evidence',
      title: 'Sammanställ underlag',
      description: 'Vilket underlag som redan finns och vad som saknas innan någon bygger vidare.',
      ownerId: 'noel',
      status: 'waiting',
      dependsOn: ['problem'],
      blockers: ['Väntar på en bekräftad problembeskrivning.'],
      agentCanStart: false,
      needsHuman: 'Underlaget blir träffsäkert först när problemet är bekräftat.',
    },
  ]
}

export function phasesFor(kind: Kind): PhasePlan[] {
  if (kind === 'dashboard') {
    return [
      { title: 'Underlag och nyckeltal', period: '27 okt–4 nov', detail: 'Få fram data och lås vad som ska mätas.' },
      { title: 'Första versionen', period: '5–18 nov', detail: 'En vy med rätt hierarki för måndagsmötet.' },
      { title: 'Provkörning', period: '19–27 nov', detail: 'Säljteamet använder den på riktigt, och ni justerar.' },
    ]
  }
  if (kind === 'launch') {
    return [
      { title: 'Löfte och målgrupp', period: '27 okt–6 nov', detail: 'Lås vad som lanseras och för vem.' },
      { title: 'Material', period: '7–24 nov', detail: 'Budskap, sida och säljstöd.' },
      { title: 'Lanseringsvecka', period: '25 nov–1 dec', detail: 'Publicera och följ första användningen.' },
    ]
  }
  return [
    { title: 'Problem och avgränsning', period: '27 okt–6 nov', detail: 'Vem, vilket problem, vad som inte ingår.' },
    { title: 'Pilot', period: '9 nov–4 dec', detail: 'Ett flöde som går att prova med riktiga användare.' },
    { title: 'Beslut', period: 'december', detail: 'Avgör om det är värt att gå vidare.' },
  ]
}

export function milestonesFor(kind: Kind): Milestone[] {
  if (kind === 'dashboard') {
    return [
      { date: '30 okt', title: 'Datautdraget är uppladdat' },
      { date: '4 nov', title: 'Nyckeltalen är bekräftade' },
      { date: '18 nov', title: 'Första versionen kan användas internt' },
      { date: '23 nov', title: 'Karin kör den på måndagsmötet' },
    ]
  }
  if (kind === 'launch') {
    return [
      { date: '6 nov', title: 'Erbjudande och målgrupp är låsta' },
      { date: '20 nov', title: 'Budskap och sida är granskade' },
      { date: '1 dec', title: 'Lanseringsdag' },
    ]
  }
  return [
    { date: '6 nov', title: 'Problem och pilotgrupp är bekräftade' },
    { date: '20 nov', title: 'Första flödet går att prova' },
    { date: '4 dec', title: 'Beslut om nästa steg' },
  ]
}

export function reviewSummary(brief: Brief): string {
  const confirmed = (section: ItemSection) => brief.items.find((i) => i.sectionId === section && i.origin === 'confirmed')?.text
  const open = brief.openQuestions.length
  if (brief.kind === 'dashboard') {
    const bits = [
      `${brief.projectName} ska ge säljteamet på Studio Nord en gemensam bild av hur försäljningen utvecklas, så att rätt insatser prioriteras.`,
      confirmed('audience') ? `Målgrupp: ${confirmed('audience')}` : 'Målgruppen är inte bekräftad än.',
      confirmed('deliverables') ? `I version 1: ${confirmed('deliverables')}` : 'Innehållet i version 1 bygger ännu delvis på antaganden.',
      confirmed('constraints') ? `Tidsram: ${confirmed('constraints')}` : 'Ingen tidsram är låst.',
      open ? `${open} frågor följer med in i projektet.` : 'Inga öppna frågor kvar i briefen.',
    ]
    return bits.join(' ')
  }
  return `${brief.projectName} utgår från det ni beskrivit. ${open ? `${open} frågor är fortfarande öppna och följer med.` : 'Briefen har inga öppna frågor kvar.'} Teamet nedan är ett förslag. Ta bort den som inte behövs, eller lägg till en person, innan arbetsytan öppnas.`
}

export function dependencyNotes(kind: Kind): string[] {
  if (kind === 'dashboard') {
    return [
      'Kvalitetsgranskningen kan inte börja förrän ett datautdrag finns.',
      'Elias kan föreslå nyckeltal innan datan är uppladdad. Själva analysen väntar.',
      'Diagrammen väntar tills en människa har bekräftat nyckeltalen.',
    ]
  }
  if (kind === 'launch') {
    return ['Budskap och sida väntar tills det är bekräftat vad som lanseras och för vem.']
  }
  return ['Underlaget väntar på en bekräftad problembeskrivning. Avgränsningen kan skissas direkt.']
}

export const SAMPLE_FILE = 'forsaljning-oktober-2026.csv'

export const SAMPLE_ROWS = [
  ['Nordisk linje', 'Förhandling', '480 000', 'Sara', '2026-11-12'],
  ['Hamnkontoret', 'Offert', '190 000', 'Jon', '2026-12-02'],
  ['Ateljé Väst', 'Vunnen', '260 000', 'Sara', '2026-10-20'],
  ['Klinik Öst', 'Förlorad', '140 000', 'Mira', '2026-10-08'],
]

export function documentCount(project: Project): number {
  const files = project.chats.reduce((n, c) => n + c.messages.filter((m) => m.attachmentName).length, 0)
  return 1 + project.decisions.length + files
}

export function myTasks(project: Project) {
  return project.activities.filter((a) => a.ownerId === 'fredrik' && a.status !== 'done')
}

export function nowLine(personId: string, project: Project): string {
  if (project.kind !== 'dashboard') {
    if (personId === 'nora') return 'Håller ihop nästa steg utifrån briefen.'
    return 'Läser briefen och tar det som hör till rollen.'
  }
  const act = (key: string) => project.activities.find((a) => a.key === key)
  if (personId === 'nora') {
    if (act('upload')?.status === 'done') return 'Datautdraget är inne. Nästa är datakvaliteten.'
    return 'Håller ihop nästa steg mot datautdraget.'
  }
  if (personId === 'elias') {
    if (act('quality')?.status === 'todo' || act('quality')?.status === 'doing') return 'Kan granska datakvaliteten nu.'
    if (act('kpis')?.status !== 'done') return 'Kan föreslå nyckeltal. Analysen väntar på data.'
    return 'Nyckeltalen är föreslagna. Kvar är att läsa datan.'
  }
  if (personId === 'saga') {
    if (act('charts')?.status === 'waiting') return 'Väntar på bekräftade nyckeltal innan diagrammen ritas.'
    return 'Tar fram diagram till måndagsmötet.'
  }
  if (personId === 'amir') return 'Kan skissa flödet för måndagsmötet.'
  if (personId === 'liv') return 'Kan ta budskap och kanaler när målgruppen är låst.'
  if (personId === 'noel') return 'Kan samla löfte och underlag.'
  return 'Tillgänglig i projektet.'
}

export function leadSummary(project: Project): string {
  const open = project.brief.openQuestions.length
  const waiting = project.activities.filter((a) => a.status === 'waiting')
  const done = project.activities.filter((a) => a.status === 'done').length
  if (project.kind === 'dashboard') {
    const uploadDone = project.activities.find((a) => a.key === 'upload')?.status === 'done'
    return `Vi har en godkänd brief för ${project.name}. Första versionen ska hjälpa säljteamet att se hur försäljningen utvecklas och välja rätt insats på måndagsmötet 23 november. ${uploadDone ? 'Datautdraget är inne, så kvalitetsgranskningen kan börja.' : 'Det som styr takten är att vi får ett datautdrag och att nyckeltalen bekräftas.'} ${done} av ${project.activities.length} aktiviteter är klara. ${waiting.length ? `${waiting.length} aktiviteter väntar på input.` : 'Inget ligger och väntar på input just nu.'} ${open ? `${open} frågor är fortfarande öppna.` : 'Inga öppna frågor kvar i briefen.'}`
  }
  return `Briefen för ${project.name} är godkänd. ${done} av ${project.activities.length} aktiviteter är klara. ${waiting.length ? `${waiting.length} väntar på input.` : ''} ${open ? `${open} frågor är öppna.` : ''}`.replace(/\s+/g, ' ').trim()
}

export function recommendedSteps(project: Project): { label: string; activityKey: string }[] {
  if (project.kind === 'dashboard') {
    return [
      { label: 'Fredrik laddar upp ett datautdrag', activityKey: 'upload' },
      { label: 'Dataanalytikern granskar datakvaliteten', activityKey: 'quality' },
      { label: 'Visualiseringsexperten föreslår diagram när nyckeltalen är bekräftade', activityKey: 'charts' },
    ]
  }
  return project.activities
    .filter((a) => a.status !== 'done')
    .slice(0, 3)
    .map((a) => ({ label: a.title, activityKey: a.key }))
}

export function currentPhase(project: Project): PhasePlan {
  const phases = phasesFor(project.kind)
  if (project.kind !== 'dashboard') return phases[0]
  const upload = project.activities.find((a) => a.key === 'upload')
  const charts = project.activities.find((a) => a.key === 'charts')
  if (charts && (charts.status === 'doing' || charts.status === 'done')) return phases[1]
  if (upload?.status === 'done') return phases[1]
  return phases[0]
}

export function searchHits(project: Project, query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits: SearchHit[] = []
  if (project.name.toLowerCase().includes(q)) hits.push({ type: 'project', label: project.name })
  for (const p of project.people) {
    if (`${p.name} ${p.role}`.toLowerCase().includes(q)) {
      hits.push({ type: 'person', id: p.id, label: p.name, meta: p.role })
    }
  }
  for (const a of project.activities) {
    if (`${a.title} ${a.description}`.toLowerCase().includes(q)) {
      hits.push({ type: 'activity', id: a.id, label: a.title, meta: statusLabel(a.status) })
    }
  }
  for (const c of project.chats) {
    for (const m of c.messages) {
      if (m.authorId === 'system') continue
      if (m.text.toLowerCase().includes(q)) {
        hits.push({
          type: 'message',
          chatId: c.id,
          messageId: m.id,
          label: m.text.slice(0, 90),
          meta: c.title,
        })
      }
    }
  }
  return hits.slice(0, 8)
}
