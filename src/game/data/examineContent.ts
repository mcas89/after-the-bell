import { useDoorStore } from '../door/useDoorStore'
import { getHallLocker, isHallLockerId } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { ITEM_IDS } from './items'
import { useInventoryStore } from '../state/useInventoryStore'

export type SheetKind =
  | 'bloco'
  | 'chao'
  | 'prontuario'
  | 'mural'
  | 'mochila-livia'
  | 'mochila-outra'
  | 'quadro'

export type ExamineEntry = {
  line: string | null
  fragmentId?: string
  collectibleId?: string
  sheet?: SheetKind
}

const SHARED: Record<string, ExamineEntry> = {
  'mochila-fechada': {
    line: 'Essa é minha... O chaveiro ainda está no zíper.',
    fragmentId: 'clue-my-backpack',
    sheet: 'mochila-livia',
  },
  'mochila-aberta': {
    line: 'Não sei de quem é... mas não me parece estranha.',
    fragmentId: 'clue-other-backpack',
    sheet: 'mochila-outra',
  },
  refrigerante: {
    line: 'Dois refrigerantes... Um está quase vazio. Por que tem dois?',
    fragmentId: 'clue-two-drinks',
  },
  prontuario: {
    line: 'Lívia Ferreira... Eu estudo aqui.',
    sheet: 'prontuario',
  },
  'livros-professor': {
    line: 'Alguém parece que estava estudando aqui...',
  },
  'canetas-professor': {
    line: 'Algumas canetas estão vazias. Alguém escreveu muito.',
  },
  'bloco-folhas': {
    line: 'L + M...',
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
    line: 'Falta um livro bem no meio. O espaço está vazio de propósito.',
  },
  mural: {
    line: 'Avisos, horário de prova... a foto da turma está escura demais. Não dá pra ver nenhum rosto.',
    sheet: 'mural',
  },
  'quadro-negro': {
    line: 'Um jogo da forca... Qual será a palavra?',
    fragmentId: 'clue-friends',
    sheet: 'quadro',
  },
  relogio: {
    line: 'A mesma hora do celular... mas não está mudando. Algo está errado!',
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
    line: 'Não é só o relógio da sala...\nAqui também...',
  },
  'hall-window': {
    line: 'O pátio está vazio. Nenhuma luz.',
  },
  'hall-window-side': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'hall-passage': {
    line: 'Está muito escuro. Não consigo ir pra lá.',
  },
  'hall-door-11': {
    line: 'Sala 11. A 2º B.\nA sala de onde eu vim.',
  },
  'hall-door-12': {
    line: 'Sala 12.',
  },
  'hall-door-13': {
    line: 'Não tem número.',
  },
  'hall-door-14': {
    line: 'Sala 14.',
  },
  'hall-mural': {
    line: 'Cartaz de um campeonato. As faces estão apagadas.',
  },
  'hall-fountain': {
    line: 'O bebedouro não funciona.',
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
}

const ALIAS: Record<string, string> = {
  'refrigerante-1': 'refrigerante',
  'refrigerante-2': 'refrigerante',
  'janela-1': 'janela',
  'janela-2': 'janela',
  'janela-3': 'janela',
  'hall-window-side-1': 'hall-window-side',
  'hall-window-side-2': 'hall-window-side',
}

export function getExamineEntry(id: string): ExamineEntry | null {
  const key = ALIAS[id] ?? id
  if (key === 'porta') {
    const phase = useDoorStore.getState().phase
    if (phase === 'open') return { line: 'O corredor está escuro.' }
    if (phase === 'ajar' || phase === 'opening') return { line: 'Agora está entreaberta...' }
    return { line: 'Travada. Do lado de fora.' }
  }
  if (key === 'quadro-negro' && useInventoryStore.getState().has(ITEM_IDS.officeKey)) {
    return { ...SHARED[key], line: 'Ganhei uma chave nova. Foi para o inventário.' }
  }
  const locker = getHallLocker(key)
  if (locker) {
    if (useLockerPinStore.getState().isOpen(locker.id)) {
      return locker.kind === 'livia'
        ? { line: 'Cadernos. Uma foto virada. Meu moletom.' }
        : { line: 'Quase vazio.' }
    }
    if (locker.kind === 'livia') return { line: 'Meu armário.' }
    if (locker.kind === 'marina') return { line: 'Armário da Marina.' }
    return { line: `Armário da ${locker.name}.` }
  }
  return SHARED[key] ?? null
}

export function examineHoldSeconds(id: string) {
  if (isHallLockerId(id) || id === 'quadro-negro') return 0
  const entry = getExamineEntry(id)
  if (!entry) return 3.2
  if (entry.collectibleId) return 0
  if (entry.sheet === 'mural' || entry.sheet === 'prontuario' || entry.sheet === 'quadro' || entry.sheet === 'mochila-livia') return 6.8
  if (entry.sheet) return 5.5
  if (entry.fragmentId) return 5.4
  const n = entry.line?.length ?? 20
  return Math.min(6.4, 2.9 + n * 0.036)
}
