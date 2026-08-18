import { useDoorStore } from '../door/useDoorStore'
import { getHallLocker, isHallLockerId } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { hasDarkHallClues } from '../hallway/darkProgress'
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
  | 'aviso'
  | 'ronda'

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
    line: 'Eu não sei esperar...?',
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
    line: 'Achados e perdidos. Recados, uma foto escura, uma chave desenhada.',
  },
  'hall-mural-2': {
    line: 'Foto da turma. Os rostos não aparecem. Só a data.',
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
    line: 'Depois das 22h o alarme arma. Portas trancam por fora.',
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
    line: 'Ganchos vazios. Embaixo, uma lanterna.',
  },
  'teachers-hooks': {
    line: 'Portaria. Externa. Alunos. Nada.',
  },
  'teachers-flashlight': {
    line: 'Sem pilhas. Não serve.',
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
  },
  'arts-frame-2': {
    line: 'Um corredor. Vazio.',
  },
  'arts-frame-3': {
    line: 'Árvore à noite. Só isso.',
  },
  'arts-frame-4': {
    line: 'Retratos. Nenhum rosto ficou direito.',
  },
  'arts-frame-5': {
    line: 'Segundo andar. O vidro tá quebrado.',
    fragmentId: 'clue-second-floor',
  },
  'arts-frame-6': {
    line: 'Trabalho de cor. Sem nome.',
  },
  'arts-window': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
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
      : { line: 'Está muito escuro. Não consigo ir pra lá.' }
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
    if (locker.kind === 'marina') return { line: 'Não tem nome. Só o número.' }
    return { line: `Armário da ${locker.name}.` }
  }
  return SHARED[key] ?? null
}

export function examineHoldSeconds(id: string) {
  if (isHallLockerId(id) || id === 'quadro-negro' || id === 'teachers-cabinet') return 0
  const entry = getExamineEntry(id)
  if (!entry) return 3.2
  if (entry.collectibleId) return 0
  if (entry.sheet === 'mural' || entry.sheet === 'prontuario' || entry.sheet === 'quadro' || entry.sheet === 'mochila-livia' || entry.sheet === 'aviso' || entry.sheet === 'ronda') return 6.8
  if (entry.sheet) return 5.5
  if (entry.fragmentId) return 5.4
  const n = entry.line?.length ?? 20
  return Math.min(6.4, 2.9 + n * 0.036)
}
