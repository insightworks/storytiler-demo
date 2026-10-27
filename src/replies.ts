import { agentsFor, findPerson } from './content'
import type { Chat, Project } from './types'

export interface Outgoing {
  authorId: string
  text: string
  proposal?: boolean
  links?: { label: string; activityKey: string }[]
  inviteHint?: boolean
}

type Topic = 'data' | 'viz' | 'ux' | 'comms' | 'general'

function topicOf(text: string): Topic {
  if (/diagram|visual|graf|hierarki|färgsätt|presentation/i.test(text)) return 'viz'
  if (/flöde|användar|ux|skiss|struktur|navig/i.test(text)) return 'ux'
  if (/budskap|kanal|kampanj|press|kommunik/i.test(text)) return 'comms'
  if (/nyckeltal|kpi|pipeline|win rate|fortnox|pipedrive|kvalit|intäkt|crm|data/i.test(text)) return 'data'
  return 'general'
}

function isNextStep(text: string): boolean {
  return /vad behöver vi göra härnäst/i.test(text)
}

export function findMentions(text: string, people: { id: string; name: string }[]): string[] {
  const ids: string[] = []
  const ordered = [...people].sort((a, b) => b.name.length - a.name.length)
  for (const person of ordered) {
    const names = [person.name, person.name.split(' ')[0]].filter(Boolean)
    for (const name of names) {
      const re = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(text)) {
        if (!ids.includes(person.id)) ids.push(person.id)
        break
      }
    }
  }
  return ids
}

function nameOf(id: string, project: Project): string {
  return findPerson(id, project.kind, project.people)?.name ?? 'Personen'
}

function firstAgent(chat: Chat, project: Project): string | null {
  const nora = chat.participantIds.includes('nora') ? 'nora' : null
  if (nora) return nora
  return chat.participantIds.find((id) => findPerson(id, project.kind, project.people)?.kind === 'agent') ?? null
}

function specialistFor(project: Project, topic: Topic): string | null {
  if (topic === 'general') return null
  if (project.kind === 'dashboard') {
    if (topic === 'data') return 'elias'
    if (topic === 'viz') return 'saga'
    if (topic === 'ux') return 'amir'
    return null
  }
  if (project.kind === 'launch') {
    if (topic === 'comms') return 'liv'
    if (topic === 'ux') return 'amir'
    if (topic === 'data') return 'elias'
    return null
  }
  if (topic === 'ux') return 'amir'
  if (topic === 'data') return project.kind === 'service' ? 'noel' : 'elias'
  if (topic === 'viz') return 'saga'
  if (topic === 'comms') return 'liv'
  return null
}

function nextStep(project: Project): Outgoing {
  if (project.kind === 'dashboard') {
    return {
      authorId: 'nora',
      text: 'Vi behöver få tillgång till försäljningsdatan först.\n1. Fredrik laddar upp ett datautdrag.\n2. Dataanalytikern granskar datakvaliteten.\n3. Visualiseringsexperten föreslår diagram när nyckeltalen är bekräftade.',
      links: [
        { label: 'Ladda upp datautdrag', activityKey: 'upload' },
        { label: 'Granska datakvaliteten', activityKey: 'quality' },
        { label: 'Föreslå diagram till måndagsmötet', activityKey: 'charts' },
      ],
    }
  }
  if (project.kind === 'launch') {
    return {
      authorId: 'nora',
      text: 'Vi behöver låsa vad som lanseras och för vem.\n1. Fredrik bekräftar erbjudandet.\n2. Kommunikationsstrateg tar fram budskap och kanaler.\n3. UX skissar sidan när budskapet är bekräftat.',
      links: [
        { label: 'Bekräfta vad som lanseras och för vem', activityKey: 'confirm-offer' },
        { label: 'Ta fram budskap och kanaler', activityKey: 'message' },
        { label: 'Skissa lanseringssidan', activityKey: 'page' },
      ],
    }
  }
  return {
    authorId: 'nora',
    text: 'Vi behöver låsa problemet och vem piloten är till för.\n1. Fredrik beskriver problemet och de första användarna.\n2. Tjänstedesignern avgränsar första versionen.\n3. Underlaget sammanställs när problembeskrivningen finns.',
    links: [
      { label: 'Beskriv problemet och de första användarna', activityKey: 'problem' },
      { label: 'Avgränsa första versionen', activityKey: 'boundary' },
      { label: 'Sammanställ underlag', activityKey: 'evidence' },
    ],
  }
}

function eliasLine(topic: Topic): string {
  if (topic === 'viz') {
    return 'Diagrammen lämnar jag till Saga. Jag kan däremot låsa definitionerna först: win rate rullande 90 dagar, viktad pipeline per steg och intäkt mot mål från Fortnox.'
  }
  if (topic === 'ux') {
    return 'Flödet är Amirs. Det jag behöver veta är om säljarna ska se samma nyckeltal som Karin, filtrerat på sina affärer.'
  }
  return 'Jag skulle låsa de här definitionerna för version 1. Viktad pipeline är öppen affär gånger sannolikhet per steg i Pipedrive. Win rate är vunna delat med vunna och förlorade, rullande 90 dagar. Intäkt mot mål hämtas från Fortnox, inte från CRM-prognosen. Säljcykel är median dagar från skapad till stängd. Jag kan lämna det som ett förslag till Karin. Själva kvalitetsgranskningen väntar tills Fredrik laddat upp ett utdrag.'
}

function sagaLine(topic: Topic): string {
  if (topic === 'data') {
    return 'Jag ritar inte förrän definitionerna är låsta. Säg till när pipeline, win rate och intäkt mot mål är bekräftade, så tar jag en förstasida för måndagsmötet.'
  }
  return 'När nyckeltalen är bekräftade föreslår jag en förstasida, inte en rapport. Överst: intäkt mot mål och win rate. Under: viktad pipeline per steg, så det syns var affärerna fastnar. Säljcykeln som en liten jämförelse mot förra kvartalet. Inget diagram för sådant som inte hjälper måndagens beslut.'
}

function amirLine(): string {
  return 'Jag skissar ett kort flöde. Karin öppnar dashboarden och ser direkt om veckan ligger efter. Därifrån ett steg till den del av pipelinen som behöver en insats. Säljarna ser samma läge, filtrerat på sina affärer. Jag behöver veta om de ska kunna ändra något, eller bara läsa.'
}

function noraLine(topic: Topic, project: Project, specialistMissing: boolean): Outgoing {
  const name = project.name
  if (project.kind === 'dashboard' && topic === 'data') {
    return {
      authorId: 'nora',
      proposal: true,
      text: specialistMissing
        ? `För ${name} skulle jag låsa fyra tal i version 1: viktad pipeline, win rate, intäkt mot mål och säljcykelns längd. Affärerna ligger i Pipedrive och intäkten i Fortnox, och de behöver en genomgång innan vi litar på en vy. Elias kan skriva definitionerna innan utdraget finns. Vill du bjuda in honom?`
        : `För ${name} håller jag fyra tal: viktad pipeline, win rate, intäkt mot mål och säljcykelns längd. Elias har definitionerna. Det som återstår innan vi ritar är att ni bekräftar dem.`,
    }
  }
  if (project.kind === 'dashboard' && topic === 'viz') {
    return {
      authorId: 'nora',
      proposal: true,
      text: specialistMissing
        ? 'Diagrammen bör vänta tills nyckeltalen är bekräftade. En förstasida räcker: intäkt mot mål, win rate och pipeline per steg, så måndagsmötet ser var insatserna ska läggas. Saga kan ta den när talen är låsta. Vill du bjuda in henne?'
        : 'Saga tar diagrammen när nyckeltalen är bekräftade. Jag håller ordningen så vi inte ritar innan definitionerna är låsta.',
    }
  }
  if (topic === 'ux') {
    return {
      authorId: 'nora',
      proposal: true,
      text: specialistMissing
        ? 'Flödet ska vara kort. Karin öppnar läget, ser avvikelsen och väljer insats. Amir kan skissa det mot säljmötet. Vill du bjuda in honom?'
        : 'Amir tar flödet. Jag ser till att det inte växer förbi en vy till måndagsmötet.',
    }
  }
  if (topic === 'comms') {
    return {
      authorId: 'nora',
      proposal: true,
      text: specialistMissing
        ? 'Budskap och kanaler bör vänta tills vi vet vad som lanseras och för vem. Liv kan ta det då. Vill du bjuda in henne?'
        : 'Liv tar budskap och kanaler. Jag håller datumet så materialet inte kommer efter lanseringen.',
    }
  }
  const open = project.brief.openQuestions[0]
  return {
    authorId: 'nora',
    proposal: false,
    text: open
      ? `Jag håller ihop ${name}. Närmast behöver vi inte fler vyer, utan att stänga det som blockerar: ${open.text} Fråga vad vi behöver göra härnäst om du vill ha ordningen.`
      : `Jag håller ihop ${name}. Briefen är tillräckligt låst för att ta nästa steg. Fråga vad vi behöver göra härnäst så pekar jag ut ordningen.`,
  }
}

function speak(id: string, project: Project, topic: Topic, inChat?: Set<string>): Outgoing {
  if (id === 'elias') return { authorId: id, proposal: topic !== 'general', text: eliasLine(topic) }
  if (id === 'saga') return { authorId: id, proposal: true, text: sagaLine(topic) }
  if (id === 'amir') return { authorId: id, proposal: true, text: amirLine() }
  if (id === 'liv') {
    return {
      authorId: id,
      proposal: true,
      text: 'Jag tar budskapet när vi vet vem det är till för. En mening om löftet, vilka kanaler som bär det, och vad säljarna ska kunna säga veckan efter. Inget mer i första vågen.',
    }
  }
  if (id === 'noel') {
    return {
      authorId: id,
      proposal: true,
      text: 'Jag samlar tre saker: vem som har problemet, vad första versionen lovar och vilket underlag som saknas. Utan det blir piloten ett antagande.',
    }
  }
  if (id === 'nora') {
    const specialist = specialistFor(project, topic)
    const missing = Boolean(specialist && specialist !== 'nora' && !inChat?.has(specialist))
    return noraLine(topic, project, missing)
  }
  return { authorId: id, text: 'Jag läser med och tar det som hör till min roll.' }
}

function humanLine(id: string, project: Project): Outgoing {
  const person = findPerson(id, project.kind, project.people)
  const name = person?.name ?? ''
  if (/karin/i.test(name)) {
    return {
      authorId: id,
      text: 'Jag kan ta det på måndagsmötet den 23 november. Skicka vyn innan, så jag slipper öppna Pipedrive under mötet.',
    }
  }
  const first = name.split(' ')[0] || 'jag'
  return {
    authorId: id,
    text: `${first} här. Jag är med och läser. Pinga mig om något behöver ett beslut från mig.`,
  }
}

export function planReplies(text: string, chat: Chat, project: Project): Outgoing[] {
  const pool = [...project.people, ...agentsFor(project.kind)].filter(
    (p, i, all) => all.findIndex((x) => x.id === p.id) === i,
  )
  const mentions = findMentions(text, pool).filter((id) => id !== 'fredrik')
  const inChat = new Set(chat.participantIds)
  const hasLead = inChat.has('nora')

  if (isNextStep(text)) {
    if (hasLead) return [nextStep(project)]
    const speaker = firstAgent(chat, project)
    if (!speaker) return []
    return [
      {
        authorId: speaker,
        text: 'Nästa steg hålls ihop av projektledaren. Bjud in Nora om hon inte redan är med, så tar hon fram ordningen.',
      },
    ]
  }

  if (mentions.length) {
    const missing = mentions.filter((id) => !inChat.has(id))
    const present = mentions.filter((id) => inChat.has(id))
    const out: Outgoing[] = []
    const hintFrom = missing.length ? (hasLead ? 'nora' : firstAgent(chat, project)) : null
    if (missing.length && hintFrom) {
      const names = missing.map((id) => nameOf(id, project)).join(' och ')
      out.push({
        authorId: hintFrom,
        inviteHint: true,
        text: `${names} är inte med i samtalet ännu. Bjud in dem så får de projektbriefen, sparade beslut och relevant kontext från konversationen.`,
      })
    }
    const topic = topicOf(text)
    for (const id of present) {
      if (id === hintFrom) continue
      const person = findPerson(id, project.kind, project.people)
      if (person?.kind === 'human') out.push(humanLine(id, project))
      else out.push(speak(id, project, topic, inChat))
    }
    return out
  }

  const topic = topicOf(text)
  const specialist = specialistFor(project, topic)
  if (specialist && inChat.has(specialist)) return [speak(specialist, project, topic, inChat)]
  if (hasLead) return [speak('nora', project, topic, inChat)]
  const speaker = firstAgent(chat, project)
  if (speaker) return [speak(speaker, project, topic, inChat)]
  const human = chat.participantIds.find((id) => {
    if (id === 'fredrik') return false
    return findPerson(id, project.kind, project.people)?.kind === 'human'
  })
  if (human) return [humanLine(human, project)]
  return []
}

export function joinNotice(name: string): string {
  const first = name.split(' ')[0]
  return `${name} är med i samtalet. ${first} har fått projektbriefen, sparade beslut och relevant kontext från konversationen.`
}

export function joinFollowup(personId: string, project: Project, chat: Chat): string {
  if (project.kind !== 'dashboard') {
    return 'Jag har läst briefen, sparade beslut och det ni redan sagt. Jag tar det som hör till min roll och väntar med sådant som kräver ett besked från er.'
  }
  const talked = chat.messages.some((m) => /nyckeltal|pipeline|win rate|intäkt/i.test(m.text))
  if (personId === 'elias') {
    return talked
      ? 'Jag har läst briefen och det ni redan sagt om nyckeltalen. Definitionerna kan jag skriva nu: viktad pipeline, win rate rullande 90 dagar, intäkt mot mål från Fortnox och medianlängd på säljcykeln. Kvalitetsgranskningen börjar först när utdraget finns, med affär, steg, värde, ägare och stängningsdatum.'
      : 'Jag har läst briefen. Jag kan föreslå nyckeltalen för version 1 direkt. Analysen av datakvalitet väntar på ett utdrag från Pipedrive och Fortnox.'
  }
  if (personId === 'saga') {
    return talked
      ? 'Jag har tagit del av briefen och samtalet om nyckeltalen. Jag ritar inte förrän definitionerna är bekräftade. Då föreslår jag en förstasida: intäkt mot mål, win rate och viktad pipeline per steg.'
      : 'Jag har läst briefen. Jag väntar med diagrammen tills nyckeltalen är bekräftade, och börjar sedan med en enda vy för måndagsmötet.'
  }
  if (personId === 'amir') {
    return 'Jag har läst briefen. Jag kan skissa flödet för måndagsmötet nu: öppna läget, se avvikelsen, välj insats. Samma vy för Karin och säljarna, med filter på ägare.'
  }
  if (personId === 'liv') {
    return 'Jag har läst briefen. Jag kan ta budskap och kanaler så fort vi vet vad som lanseras och för vem.'
  }
  if (personId === 'noel') {
    return 'Jag har läst briefen. Jag kan samla vilket löfte första versionen ger och vilket underlag som saknas innan någon bygger vidare.'
  }
  return 'Jag har läst briefen och tar det härifrån min roll.'
}

export function attachmentReplies(chat: Chat, project: Project): Outgoing[] {
  const eliasIn = chat.participantIds.includes('elias')
  if (!chat.participantIds.includes('nora') && !eliasIn) return []
  const nora: Outgoing = {
    authorId: 'nora',
    text:
      project.kind === 'dashboard'
        ? `Tack. Jag har lagt in forsaljning-oktober-2026.csv som underlag och markerat uppladdningen som klar.${eliasIn ? ' Datakvaliteten är nu att göra.' : ' Elias kan granska kvaliteten när han är med i samtalet.'}`
        : 'Tack, jag har lagt in filen som underlag i projektet.',
  }
  if (project.kind === 'dashboard' && eliasIn && chat.participantIds.includes('nora')) {
    return [
      nora,
      {
        authorId: 'elias',
        text: 'Jag tar utdraget. Först tittar jag efter saknade belopp, dubbletter och stängningsdatum, och om pipelinestegen används likadant. Sen säger jag vad vi kan lita på inför nyckeltalen.',
      },
    ]
  }
  if (chat.participantIds.includes('nora')) return [nora]
  return [
    {
      authorId: 'elias',
      text: 'Jag tar utdraget och börjar med saknade belopp, dubbletter och stängningsdatum.',
    },
  ]
}

export function humanJoinLine(name: string): string {
  if (/karin/i.test(name)) {
    return 'Jag kan ta det på måndagsmötet den 23 november. Skicka vyn innan, så jag slipper öppna Pipedrive under mötet.'
  }
  const first = name.split(' ')[0]
  return `${first} här. Jag är med och läser. Pinga mig om något behöver ett beslut från mig.`
}
