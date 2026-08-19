import { useDoorStore } from '../door/useDoorStore'
import { getHallLocker, isHallLockerId } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { ITEM_IDS } from './items'
import { useInventoryStore } from '../state/useInventoryStore'
import { useGameStore } from '../state/useGameStore'

export type SheetKind =
  | 'bloco'
  | 'chao'
  | 'prontuario'
  | 'mural'
  | 'mochila-livia'
  | 'mochila-outra'
  | 'quadro'
  | 'aviso'
  | 'ronda'

export type ExamineEntry = {
  line: string | null
  fragmentId?: string
  collectibleId?: string
  sheet?: SheetKind
  image?: string
}

export const EXAMINE_IMG = {
  turmaSala: '/image/foto-turma-sala.png',
  turmaCorredor: '/image/foto-turma-corredor.png',
  achados: '/image/foto-achados.png',
  fotoVerso: '/image/foto-armario-livia-verso.png',
  natureza: '/image/arte-natureza-morta.png',
  corredor: '/image/arte-corredor.png',
  arvore: '/image/arte-arvore.png',
  retratos: '/image/arte-retratos.png',
  fachada: '/image/arte-fachada.png',
  composicao: '/image/arte-composicao.png',
  mochilaLivia: '/image/dentro-mochila-livia.png',
  mochilaOutra: '/image/dentro-mochila-outra.png',
  armario4: '/image/dentro-armario-4.png',
  armario5: '/image/dentro-armario-5.png',
  professores: '/image/dentro-armario-professores.png',
} as const

export type CollectPrompt = { id: string; label: string }

const COLLECT_LABEL: Record<string, string> = {
  [ITEM_IDS.key]: 'chave',
  [ITEM_IDS.officeKey]: 'chave',
  [ITEM_IDS.batteries]: 'pilhas',
  [ITEM_IDS.flashlight]: 'lanterna',
}

const SHARED: Record<string, ExamineEntry> = {
  'mochila-fechada': {
    line: 'L.F. no chaveiro. É minha.',
    fragmentId: 'clue-my-backpack',
    image: EXAMINE_IMG.mochilaLivia,
  },
  'mochila-aberta': {
    line: 'Tem outra mochila aqui. Está aberta. Algumas coisas me parecem familiares... mas eu não lembro de quem são.',
    fragmentId: 'clue-other-backpack',
    image: EXAMINE_IMG.mochilaOutra,
  },
  refrigerante: {
    line: 'Duas. Uma quase vazia. Eu não estava bebendo as duas.',
    fragmentId: 'clue-two-drinks',
  },
  prontuario: {
    line: 'Lívia Ferreira... 03 de maio. Sou eu.',
    sheet: 'prontuario',
  },
  'livros-professor': {
    line: 'Alguém parece que estava estudando aqui...',
  },
  'canetas-professor': {
    line: 'Algumas canetas estão vazias. Alguém escreveu muito.',
  },
  'bloco-folhas': {
    line: 'L + M. “O meu é o quinto. Código: meu niver.” Quem é M?',
    fragmentId: 'clue-lm',
    sheet: 'bloco',
  },
  'canetas-carteira': {
    line: 'Ainda tem tinta. Alguém parou de escrever no meio da frase.',
  },
  'folhas-chao': {
    line: 'Exercícios de uma prova... com nota B.',
    sheet: 'chao',
  },
  'armario-livros': {
    line: 'Falta um livro no meio.',
  },
  mural: {
    line: 'A foto da turma. Não dá pra ver nenhum rosto.',
    image: EXAMINE_IMG.turmaSala,
  },
  'quadro-negro': {
    line: 'Um jogo da forca... Qual será a palavra?',
    fragmentId: 'clue-friends',
    sheet: 'quadro',
  },
  relogio: {
    line: 'Meu celular e o relógio marcam 03:17. O ponteiro não anda.',
    fragmentId: 'clue-0317',
  },
  janela: {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  porta: {
    line: 'Está fechada.',
  },
  chave: {
    line: 'Uma chave pequena.',
    collectibleId: 'item-key',
  },
  'hall-clock': {
    line: 'Outro relógio. 03:17. Não é só o da sala.',
  },
  'hall-window': {
    line: 'O pátio está vazio. Nenhuma luz.',
  },
  'hall-window-side': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'hall-passage': {
    line: 'Meu corpo não quer ir.',
  },
  'hall-door-11': {
    line: 'Sala 11. A 2º B.\nA sala de onde eu vim.',
  },
  'hall-door-12': {
    line: 'Sala 12. Informática.\nA porta está aberta.',
  },
  'hall-door-13': {
    line: 'Sala dos professores.\nTrancada.',
  },
  'hall-door-14': {
    line: 'Sala de artes.\nTrancada.',
  },
  'hall-mural': {
    line: 'Cartaz de um campeonato. As faces estão apagadas.',
  },
  'hall-mural-1': {
    line: 'Achados e perdidos. A foto está escura.',
    image: EXAMINE_IMG.achados,
  },
  'hall-mural-2': {
    line: 'Foto da turma. Os rostos não aparecem.',
    image: EXAMINE_IMG.turmaCorredor,
  },
  'hall-mural-3': {
    line: 'Recados sobrepostos. Um nome está rasgado no meio.',
  },
  'hall-fountain': {
    line: 'O bebedouro não funciona.',
  },
  'passage-window': {
    line: 'Lá fora ainda está vazio.',
  },
  'lobby-library': {
    line: 'Biblioteca. Trancada.',
  },
  'lobby-storage': {
    line: 'Zeladoria. Trancada.',
  },
  'lobby-bathroom': {
    line: 'Banheiro. Trancada.',
  },
  'lobby-office': {
    line: 'Diretoria. Trancada.',
  },
  'lobby-exit': {
    line: 'Saída. Trancada por fora.',
  },
  'lobby-counter': {
    line: 'Balcão da diretoria. Ninguém.',
  },
  'lobby-switch': {
    line: 'Interruptor.',
  },
  'side-door-11': {
    line: 'O corredor está do outro lado.',
  },
  'side-door-12': {
    line: 'O corredor está do outro lado.',
  },
  'side-door-14': {
    line: 'O corredor está do outro lado.',
  },
  'side-door-teachers': {
    line: 'O corredor está do outro lado.',
  },
  'lab-pc': {
    line: 'Computador desligado.',
  },
  'teachers-notice': {
    line: 'Depois das 22h as portas trancam por fora.',
    fragmentId: 'clue-closing-notice',
    sheet: 'aviso',
  },
  'teachers-board': {
    line: 'Apagaram a reunião. No canto ainda tem 22h.',
  },
  'teachers-sofa': {
    line: 'Capa rasgada no braço. Escola velha.',
  },
  'teachers-chair': {
    line: 'Encostada na parede. Não vou sentar.',
  },
  'teachers-cabinet': {
    line: 'Quatro ganchos. Uma chave. No chão, uma lanterna.',
    image: EXAMINE_IMG.professores,
  },
  'teachers-hooks': {
    line: 'BIB. EXT. DIR. Vazios.',
  },
  'teachers-flashlight': {
    line: 'Pesada. Sem pilhas.',
    collectibleId: 'item-flashlight',
  },
  'teachers-key': {
    line: 'Pesada. Fria.',
    collectibleId: 'item-key-diretoria',
  },
  'teachers-table': {
    line: 'Ronda das 22h. Assinaram e foram embora. As chaves foram junto.',
    sheet: 'ronda',
  },
  'teachers-window': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'arts-frame-1': {
    line: 'Natureza morta. Tinta ainda meio molhada.',
    image: EXAMINE_IMG.natureza,
  },
  'arts-frame-2': {
    line: 'Um corredor. Vazio.',
    image: EXAMINE_IMG.corredor,
  },
  'arts-frame-3': {
    line: 'Árvore à noite. Só isso.',
    image: EXAMINE_IMG.arvore,
  },
  'arts-frame-4': {
    line: 'Retratos. Nenhum rosto ficou direito.',
    image: EXAMINE_IMG.retratos,
  },
  'arts-frame-5': {
    line: 'Uma janela no segundo andar. O vidro está marcado.',
    fragmentId: 'clue-second-floor',
    image: EXAMINE_IMG.fachada,
  },
  'arts-frame-6': {
    line: 'Trabalho de cor. Sem nome.',
    image: EXAMINE_IMG.composicao,
  },
  'arts-window': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'locker-photo': {
    line: 'O verso. Só isso.',
    image: EXAMINE_IMG.fotoVerso,
  },
}

const ALIAS: Record<string, string> = {
  'refrigerante-1': 'refrigerante',
  'refrigerante-2': 'refrigerante',
  'janela-1': 'janela',
  'janela-2': 'janela',
  'janela-3': 'janela',
  'hall-window-side-1': 'hall-window-side',
  'hall-window-side-2': 'hall-window-side',
  'lab-pc-1': 'lab-pc',
  'lab-pc-2': 'lab-pc',
  'lab-pc-3': 'lab-pc',
  'lab-pc-4': 'lab-pc',
  'lab-pc-5': 'lab-pc',
  'lab-pc-6': 'lab-pc',
  'teachers-window-1': 'teachers-window',
  'teachers-window-2': 'teachers-window',
  'teachers-window-3': 'teachers-window',
  'teachers-sofa-2': 'teachers-sofa',
  'teachers-chair-2': 'teachers-chair',
  'teachers-chair-3': 'teachers-chair',
  'arts-window-1': 'arts-window',
  'arts-window-2': 'arts-window',
  'arts-window-3': 'arts-window',
  'arts-frame-7': 'arts-frame-1',
  'arts-frame-8': 'arts-frame-2',
  'arts-frame-9': 'arts-frame-3',
  'arts-frame-10': 'arts-frame-4',
  'arts-frame-11': 'arts-frame-5',
  'arts-frame-12': 'arts-frame-6',
}

function hasFlashlight() {
  const inv = useInventoryStore.getState()
  return inv.has(ITEM_IDS.flashlight) || inv.has(ITEM_IDS.flashlightLit)
}

function hasBatteries() {
  const inv = useInventoryStore.getState()
  return inv.has(ITEM_IDS.batteries) || inv.has(ITEM_IDS.flashlightLit)
}

export function getExamineEntry(id: string): ExamineEntry | null {
  const key = ALIAS[id] ?? id
  if (key === 'porta') {
    const phase = useDoorStore.getState().phase
    if (phase === 'open') return { line: 'O corredor está escuro.' }
    if (phase === 'ajar' || phase === 'opening') return { line: 'Agora está entreaberta...' }
    return { line: 'Travada. Do lado de fora.' }
  }
  if (key === 'hall-door-12') {
    return useHallwayStore.getState().labDoor === 'open'
      ? { line: 'Sala 12. Informática.\nA porta está aberta.' }
      : { line: 'Sala 12. Informática.\nEstá entreaberta.' }
  }
  if (key === 'hall-door-13') {
    return useInventoryStore.getState().has(ITEM_IDS.key)
      ? { line: 'Sala dos professores.' }
      : { line: 'Sala dos professores.\nTrancada.' }
  }
  if (key === 'hall-door-14') {
    return useInventoryStore.getState().has(ITEM_IDS.officeKey)
      ? { line: 'Sala de artes.' }
      : { line: 'Sala de artes.\nTrancada.' }
  }
  if (key === 'hall-passage') {
    return hasDarkHallClues()
      ? { line: 'Uma passagem. Dá pra seguir.' }
      : { line: 'Meu corpo não quer ir.' }
  }
  if (key === 'teachers-cabinet') {
    const takenFlash = hasFlashlight()
    const takenKey = useInventoryStore.getState().has(ITEM_IDS.officeKey)
    const line =
      takenFlash && takenKey
        ? 'Vazio.'
        : takenFlash
          ? 'A chave ainda está no gancho.'
          : takenKey
            ? 'A lanterna ainda está no chão.'
            : 'Quatro ganchos. Uma chave. No chão, uma lanterna.'
    return { line, image: EXAMINE_IMG.professores }
  }
  if (key === 'teachers-flashlight') {
    return hasFlashlight()
      ? { line: 'Não tem mais nada.' }
      : { line: 'Pesada. Sem pilhas.', collectibleId: ITEM_IDS.flashlight }
  }
  if (key === 'teachers-key') {
    return useInventoryStore.getState().has(ITEM_IDS.officeKey)
      ? { line: 'Não tem mais nada.' }
      : { line: 'Pesada. Fria.', collectibleId: ITEM_IDS.officeKey }
  }
  if (key === 'lobby-switch') {
    return useGameStore.getState().flags.lobbyLights
      ? { line: 'A luz voltou. Pouca.' }
      : { line: 'Interruptor.' }
  }
  if (key === 'quadro-negro' && useGameStore.getState().flags.hangmanAmizade) {
    return { ...SHARED[key], line: 'A palavra era AMIZADE.' }
  }
  const locker = getHallLocker(key)
  if (locker) {
    if (useLockerPinStore.getState().isOpen(locker.id)) {
      if (locker.kind === 'livia') {
        return { line: 'Cadernos. Uma foto virada. Meu moletom.', image: EXAMINE_IMG.armario4 }
      }
      if (locker.kind === 'marina') {
        return hasBatteries()
          ? { line: 'Quase vazio.', image: EXAMINE_IMG.armario5 }
          : { line: 'Pilhas. Alguém deixou.', image: EXAMINE_IMG.armario5, collectibleId: ITEM_IDS.batteries }
      }
      return { line: 'Quase vazio.' }
    }
    if (locker.kind === 'livia') return { line: 'Meu armário.' }
    if (locker.kind === 'marina') return { line: 'Todo mundo tem nome... menos esse.' }
    return { line: `Armário da ${locker.name}.` }
  }
  return SHARED[key] ?? null
}

export function collectPromptFor(
  examiningId: string | null,
  detailId: string | null,
): CollectPrompt | null {
  if (!examiningId) return null
  const inv = useInventoryStore.getState()

  if (examiningId === 'teachers-cabinet') {
    if (detailId === 'teachers-flashlight') {
      if (hasFlashlight()) return null
      return { id: ITEM_IDS.flashlight, label: COLLECT_LABEL[ITEM_IDS.flashlight] }
    }
    if (detailId === 'teachers-key') {
      if (inv.has(ITEM_IDS.officeKey)) return null
      return { id: ITEM_IDS.officeKey, label: COLLECT_LABEL[ITEM_IDS.officeKey] }
    }
    return null
  }

  const locker = getHallLocker(examiningId)
  if (locker?.kind === 'marina' && useLockerPinStore.getState().isOpen(locker.id)) {
    if (hasBatteries()) return null
    return { id: ITEM_IDS.batteries, label: COLLECT_LABEL[ITEM_IDS.batteries] }
  }

  const looking = detailId ?? examiningId
  const entry = getExamineEntry(looking)
  if (!entry?.collectibleId || inv.has(entry.collectibleId)) return null
  return { id: entry.collectibleId, label: COLLECT_LABEL[entry.collectibleId] ?? 'item' }
}

export function examineHoldSeconds(id: string) {
  if (isHallLockerId(id) || id === 'quadro-negro' || id === 'teachers-cabinet') return 0
  if (id === 'mochila-fechada' || id === 'mochila-aberta') return 0
  const entry = getExamineEntry(id)
  if (!entry) return 3.2
  if (entry.collectibleId) return 0
  if (entry.image) return 0
  if (
    entry.sheet === 'mural' ||
    entry.sheet === 'prontuario' ||
    entry.sheet === 'quadro' ||
    entry.sheet === 'aviso' ||
    entry.sheet === 'ronda'
  ) {
    return 6.8
  }
  if (entry.sheet) return 5.5
  if (entry.fragmentId) return 5.4
  const n = entry.line?.length ?? 20
  return Math.min(6.4, 2.9 + n * 0.036)
}
