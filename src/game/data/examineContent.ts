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
  ultimoArmario: '/image/ultimo_armario.png',
  selfieLivia1: '/image/selfie-livia1.png',
  selfieLivia2: '/image/selfie-livia2.png',
  selfieLiviaMenina: '/image/selfie-livia-e-menina.png',
} as const

export type CollectPrompt = { id: string; label: string }

const COLLECT_LABEL: Record<string, string> = {
  [ITEM_IDS.key]: 'chave',
  [ITEM_IDS.officeKey]: 'chave',
  [ITEM_IDS.janitorKey]: 'chave',
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
    line: 'Biblioteca. Fechada.',
  },
  'lobby-storage': {
    line: 'Zeladoria. Fechada.',
  },
  'lobby-bathroom': {
    line: 'Banheiro. A porta está aberta.',
  },
  'lobby-office': {
    line: 'Diretoria. Trancada.',
  },
  'lobby-exit': {
    line: 'Um portão. Tem escada descendo.',
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
  'side-door-library': {
    line: 'O pátio está do outro lado.',
  },
  'side-door-bathroom': {
    line: 'O pátio está do outro lado.',
  },
  'side-door-storage': {
    line: 'O pátio está do outro lado.',
  },
  'side-door-office': {
    line: 'O pátio está do outro lado.',
  },
  'office-desk': {
    line: 'Mesa da direção. Ninguém.',
  },
  'lib-shelf': {
    line: 'Estantes. A maior parte some no escuro.',
  },
  'lib-ledger': {
    line: 'M.A...\nM.',
    fragmentId: 'clue-ma',
  },
  'lib-note': {
    line: 'Essa frase de novo...',
  },
  'bath-mirror': {
    line: 'Eu pareço péssima.',
  },
  'bath-stall': {
    line: 'Vazio.',
  },
  'bath-stall-empty': {
    line: 'Vazio.',
  },
  'bath-sink': {
    line: 'Ainda está molhado...',
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
  'locker-batteries': {
    line: 'Pilhas. Alguém deixou.',
    collectibleId: 'item-batteries',
  },
  'locker-janitor-key': {
    line: 'Uma chave.',
    collectibleId: 'item-key-zeladoria',
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

function hasJanitorKey() {
  return useInventoryStore.getState().has(ITEM_IDS.janitorKey)
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
    if (takenFlash && takenKey) return { line: 'Armário está vazio.' }
    const line = takenFlash
      ? 'A chave ainda está no gancho.'
      : takenKey
        ? 'A lanterna ainda está no chão.'
        : 'Quatro ganchos. Uma chave. No chão, uma lanterna.'
    return { line, image: EXAMINE_IMG.professores }
  }
  if (key === 'teachers-flashlight') {
    return hasFlashlight()
      ? { line: useInventoryStore.getState().has(ITEM_IDS.officeKey) ? 'Armário está vazio.' : 'A chave ainda está no gancho.' }
      : { line: 'Pesada. Sem pilhas.', collectibleId: ITEM_IDS.flashlight }
  }
  if (key === 'teachers-key') {
    const takenKey = useInventoryStore.getState().has(ITEM_IDS.officeKey)
    if (takenKey) {
      return { line: hasFlashlight() ? 'Armário está vazio.' : 'A lanterna ainda está no chão.' }
    }
    return { line: 'Pesada. Fria.', collectibleId: ITEM_IDS.officeKey }
  }
  if (key === 'locker-batteries') {
    return hasBatteries()
      ? { line: 'Armário está vazio.' }
      : { line: 'Pilhas. Alguém deixou.', collectibleId: ITEM_IDS.batteries }
  }
  if (key === 'locker-janitor-key') {
    return hasJanitorKey()
      ? { line: 'Armário está vazio.' }
      : { line: 'Uma chave.', collectibleId: ITEM_IDS.janitorKey }
  }
  if (key === 'lobby-switch') {
    return useGameStore.getState().flags.lobbyLights
      ? { line: 'Ligado.' }
      : { line: 'Interruptor.' }
  }
  if (key === 'lobby-storage') {
    return hasJanitorKey() ? { line: 'Zeladoria.' } : { line: 'Zeladoria. Fechada.' }
  }
  if (key === 'lobby-exit') {
    const flags = useGameStore.getState().flags
    if (flags.patioGateAgain) return { line: 'Tem alguma coisa lá embaixo...' }
    if (flags.patioGatePushed) return { line: 'Não abre. Tem uma escada descendo.' }
    return { line: 'Um portão. Tem escada descendo.' }
  }
  if (key === 'bath-sink') {
    const game = useGameStore.getState()
    if (game.flags.bathWetGone) return { line: 'Sumiu.' }
    if (!game.flags.bathWetSeen) game.addFlag('bathWetSeen')
    return { line: 'Ainda está molhado...' }
  }
  if (key === 'quadro-negro' && useGameStore.getState().flags.hangmanAmizade) {
    return { ...SHARED[key], line: 'A palavra era AMIZADE.' }
  }
  const locker = getHallLocker(key)
  if (locker) {
    if (locker.kind === 'janitor') {
      return hasJanitorKey()
        ? { line: 'Armário está vazio.' }
        : { line: 'Uma chave. Alguns panos.', collectibleId: ITEM_IDS.janitorKey, image: EXAMINE_IMG.ultimoArmario }
    }
    if (useLockerPinStore.getState().isOpen(locker.id)) {
      if (locker.kind === 'livia') {
        return { line: 'Cadernos. Uma foto virada. Meu moletom.', image: EXAMINE_IMG.armario4 }
      }
      if (locker.kind === 'marina') {
        return hasBatteries()
          ? { line: 'Armário está vazio.' }
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

export function collectPromptsFor(
  examiningId: string | null,
  detailId: string | null,
): CollectPrompt[] {
  if (!examiningId) return []
  const inv = useInventoryStore.getState()
  const label = (id: string) => COLLECT_LABEL[id] ?? 'item'

  if (examiningId === 'teachers-cabinet') {
    if (detailId === 'teachers-flashlight') {
      return hasFlashlight() ? [] : [{ id: ITEM_IDS.flashlight, label: label(ITEM_IDS.flashlight) }]
    }
    if (detailId === 'teachers-key') {
      return inv.has(ITEM_IDS.officeKey) ? [] : [{ id: ITEM_IDS.officeKey, label: label(ITEM_IDS.officeKey) }]
    }
    const list: CollectPrompt[] = []
    if (!hasFlashlight()) list.push({ id: ITEM_IDS.flashlight, label: label(ITEM_IDS.flashlight) })
    if (!inv.has(ITEM_IDS.officeKey)) list.push({ id: ITEM_IDS.officeKey, label: label(ITEM_IDS.officeKey) })
    return list
  }

  const locker = getHallLocker(examiningId)
  if (locker?.kind === 'marina' && useLockerPinStore.getState().isOpen(locker.id)) {
    if (detailId && detailId !== 'locker-batteries') return []
    return hasBatteries() ? [] : [{ id: ITEM_IDS.batteries, label: label(ITEM_IDS.batteries) }]
  }
  if (locker?.kind === 'janitor') {
    if (detailId && detailId !== 'locker-janitor-key') return []
    return hasJanitorKey() ? [] : [{ id: ITEM_IDS.janitorKey, label: label(ITEM_IDS.janitorKey) }]
  }

  const looking = detailId ?? examiningId
  const entry = getExamineEntry(looking)
  if (!entry?.collectibleId || inv.has(entry.collectibleId)) return []
  return [{ id: entry.collectibleId, label: label(entry.collectibleId) }]
}

export function collectPromptFor(
  examiningId: string | null,
  detailId: string | null,
): CollectPrompt | null {
  return collectPromptsFor(examiningId, detailId)[0] ?? null
}

export function examineHoldSeconds(id: string) {
  if (isHallLockerId(id) || id === 'quadro-negro' || id === 'teachers-cabinet' || id === 'lobby-switch') return 0
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
