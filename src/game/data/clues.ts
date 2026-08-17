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
  door203: 'clue-door-203',
  mysteriousGirl: 'clue-mysterious-girl',
} as const

export const CLUES: ClueDef[] = [
  {
    id: CLUE_IDS.time0317,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: '03:17',
        description: 'A mesma hora do celular. Não está mudando. Algo está errado.',
      },
      {
        title: '03:17',
        description: 'Não é só o relógio da sala. O corredor também está parado em 03:17.',
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
        description: 'Essa é minha. O chaveiro ainda está no zíper.',
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
        description: 'Não sei de quem é, mas não me parece estranha.',
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
        description: 'Dois refrigerantes. Um está quase vazio.',
      },
    ],
  },
  {
    id: CLUE_IDS.lm,
    kind: 'fragment',
    chapter: 'classroom1',
    stages: [
      {
        title: 'L + M',
        description: 'L + M. As mesmas iniciais do quadro.',
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
        description: 'Um jogo da forca no quadro. A palavra está incompleta.',
      },
    ],
  },
  {
    id: CLUE_IDS.door203,
    kind: 'fragment',
    chapter: 'hallway',
    stages: [
      {
        title: 'A porta 203',
        description: 'Tenho quase certeza de que havia uma sala 203 aqui.',
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
        description: 'Vi uma garota de uniforme no corredor. Talvez ela saiba o que está acontecendo.',
      },
    ],
  },
]

/** Deduções ficam cadastradas aqui. A lógica de desbloqueio entra numa etapa futura. */
export const DEDUCTIONS: ClueDef[] = [
  {
    id: 'deduction-not-alone',
    kind: 'deduction',
    chapter: 'classroom1',
    requires: [CLUE_IDS.otherBackpack, CLUE_IDS.twoDrinks, CLUE_IDS.lm],
    stages: [
      {
        title: 'Eu não estava sozinha',
        description: 'Tudo indica que havia outra pessoa comigo antes de eu acordar.',
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
