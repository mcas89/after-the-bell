export type ClueKind = 'fragment' | 'deduction'

export type ClueStage = {
  title: string
  description: string
}

export type ClueDef = {
  id: string
  kind: ClueKind
  chapter: string
  stages: ClueStage[]
  requires?: string[]
}

export type ClueProgress = {
  discovered: boolean
  read: boolean
  discoveredAt?: number
  stage: number
  title?: string
  description?: string
}

export type ClueView = {
  id: string
  kind: ClueKind
  title: string
  description: string
  chapter: string
  discovered: true
  read: boolean
  discoveredAt: number
  stage: number
}

export const CLUE_IDS = {
  time0317: 'clue-0317',
  myBackpack: 'clue-my-backpack',
  otherBackpack: 'clue-other-backpack',
  twoDrinks: 'clue-two-drinks',
  lm: 'clue-lm',
  friends: 'clue-friends',
  mysteriousGirl: 'clue-mysterious-girl',
  howToLeave: 'clue-how-to-leave',
  closingNotice: 'clue-closing-notice',
  secondFloor: 'clue-second-floor',
  ma: 'clue-ma',
  plan: 'clue-plan',
  wantedOut: 'clue-wanted-out',
  marina: 'clue-marina',
  fall: 'clue-fall',
  body: 'clue-body',
} as const

export const CLUES: ClueDef[] = [
  {
    id: CLUE_IDS.time0317,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: '03:17',
        description: '03:17. Parado. Não sei há quanto tempo.',
      },
      {
        title: '03:17',
        description: 'Outro relógio. Mesma hora. 03:17.',
      },
    ],
  },
  {
    id: CLUE_IDS.myBackpack,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'Minha mochila',
        description: 'L.F. no chaveiro. É minha.',
      },
    ],
  },
  {
    id: CLUE_IDS.otherBackpack,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'Outra mochila',
        description: 'Tem outra mochila aqui. Está aberta. Algumas coisas me parecem familiares... mas eu não lembro de quem são.',
      },
    ],
  },
  {
    id: CLUE_IDS.twoDrinks,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'Duas bebidas',
        description: 'Duas. Uma quase vazia. Eu não estava bebendo as duas.',
      },
    ],
  },
  {
    id: CLUE_IDS.lm,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'Livia & M',
        description: 'Livia e M. O meu é o quinto. Quem é M?',
      },
    ],
  },
  {
    id: CLUE_IDS.friends,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'A forca',
        description: 'A palavra era AMIZADE.',
      },
    ],
  },
  {
    id: CLUE_IDS.mysteriousGirl,
    kind: 'fragment',
    chapter: 'hallway',
    stages: [
      {
        title: 'A garota',
        description: 'Vi uma garota de uniforme no corredor. Ela fugiu. Preciso achar ela.',
      },
    ],
  },
  {
    id: CLUE_IDS.howToLeave,
    kind: 'fragment',
    chapter: 'room12',
    stages: [
      {
        title: 'Como sair',
        description: 'Amanhecer. Alarme. Porta. Segundo andar. A gente estava tentando sair daqui.',
      },
    ],
  },
  {
    id: CLUE_IDS.closingNotice,
    kind: 'fragment',
    chapter: 'teachers',
    stages: [
      {
        title: 'Alarme',
        description: 'Depois das 22h as portas trancam por fora. A gente ficou. Foi escolha.',
      },
    ],
  },
  {
    id: CLUE_IDS.secondFloor,
    kind: 'fragment',
    chapter: 'room14',
    stages: [
      {
        title: 'Segundo andar',
        description: 'Uma janela no segundo andar foi marcada. É pra lá.',
      },
    ],
  },
  {
    id: CLUE_IDS.ma,
    kind: 'fragment',
    chapter: 'library',
    stages: [
      {
        title: 'M.A.',
        description: 'M.A. no registro. É M.',
      },
    ],
  },
  {
    id: CLUE_IDS.plan,
    kind: 'fragment',
    chapter: 'library',
    stages: [
      {
        title: 'A planta',
        description: 'DIR circulado. Telefone. Chaves. A saída. A chave da diretoria ficou na zeladoria.',
      },
    ],
  },
  {
    id: CLUE_IDS.wantedOut,
    kind: 'fragment',
    chapter: 'bathroom',
    stages: [
      {
        title: 'Ir embora',
        description: 'Ela queria ir embora. Eu que insisti.',
      },
    ],
  },
  {
    id: CLUE_IDS.marina,
    kind: 'fragment',
    chapter: 'office',
    stages: [
      {
        title: 'Marina Alves',
        description: 'Marina Alves. 2º B. A gente ria tanto.',
      },
    ],
  },
  {
    id: CLUE_IDS.fall,
    kind: 'fragment',
    chapter: 'office',
    stages: [
      {
        title: '03:17',
        description: 'A janela. Ela caiu. 03:17. Foi agora.',
      },
    ],
  },
  {
    id: CLUE_IDS.body,
    kind: 'fragment',
    chapter: 'backyard',
    stages: [
      {
        title: 'Por minha causa',
        description: 'Você morreu aqui. Por minha causa.',
      },
    ],
  },
]

export const DEDUCTIONS: ClueDef[] = [
  {
    id: 'deduction-not-alone',
    kind: 'deduction',
    chapter: 'classroom1',
    requires: [CLUE_IDS.otherBackpack, CLUE_IDS.twoDrinks, CLUE_IDS.lm],
    stages: [
      {
        title: 'Eu não estava sozinha',
        description: 'Outra mochila. Duas bebidas. Livia e M. Tinha alguém aqui comigo.',
      },
    ],
  },
]

const byId = new Map<string, ClueDef>([...CLUES, ...DEDUCTIONS].map((clue) => [clue.id, clue]))

export function getClueDef(id: string) {
  return byId.get(id) ?? null
}

export function resolveClue(def: ClueDef, progress: ClueProgress): ClueView | null {
  if (!progress.discovered || progress.discoveredAt == null) return null
  const stage = def.stages[Math.min(progress.stage, def.stages.length - 1)] ?? def.stages[0]
  if (!stage) return null
  return {
    id: def.id,
    kind: def.kind,
    title: progress.title ?? stage.title,
    description: progress.description ?? stage.description,
    chapter: def.chapter,
    discovered: true,
    read: progress.read,
    discoveredAt: progress.discoveredAt,
    stage: progress.stage,
  }
}

export function emptyProgress(): ClueProgress {
  return { discovered: false, read: false, stage: 0 }
}
