import { useDoorStore } from '../door/useDoorStore'
import { getHallLocker, isHallLockerId } from '../hallway/lockers'
import { useLockerPinStore } from '../hallway/useLockerPin'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { ITEM_IDS } from './items'
import { CLUE_IDS } from './clues'
import { useInventoryStore } from '../state/useInventoryStore'
import { useGameStore } from '../state/useGameStore'
import { canDescendPatio } from '../rooms/patioProgress'

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
  | 'pasta'
  | 'manutencao'
  | 'saida'
  | 'guiche'
  | 'lib-note'
  | 'office-floor'

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
  plantaPavimento: '/image/planta-segundo-andar.png',
  gavetaChaves: '/image/gaveta-chaves-fechamento.png',
  zelEsqueleto: '/image/armario-zeladoria-esqueleto.png',
} as const

export type CollectPrompt = { id: string; label: string }

const COLLECT_LABEL: Record<string, string> = {
  [ITEM_IDS.key]: 'chave',
  [ITEM_IDS.officeKey]: 'chave',
  [ITEM_IDS.janitorKey]: 'chave',
  [ITEM_IDS.bibKey]: 'chave',
  [ITEM_IDS.dirKey]: 'chave',
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
    line: 'Lívia Ferreira... 03 de maio. Sou eu. Meu niver.',
    sheet: 'prontuario',
  },
  'livros-professor': {
    line: 'Dois cadernos abertos. Eu só uso um.',
  },
  'canetas-professor': {
    line: 'Tem uma roxa. Eu não uso essa cor.',
  },
  'bloco-folhas': {
    line: 'Livia e M. O meu é o quinto. Quem é M?',
    fragmentId: 'clue-lm',
    sheet: 'bloco',
  },
  'canetas-carteira': {
    line: 'Ainda tem tinta. A letra não é a minha.',
  },
  'folhas-chao': {
    line: 'Nota B. Eu não tiro B.',
    sheet: 'chao',
  },
  'armario-livros': {
    line: 'Falta um livro no meio. Não fui eu.',
  },
  mural: {
    line: 'Duas na frente. Nenhum rosto.',
    image: EXAMINE_IMG.turmaSala,
  },
  'quadro-negro': {
    line: 'Um jogo da forca... Qual será a palavra?',
    sheet: 'quadro',
  },
  relogio: {
    line: 'O relógio marca 03:17. O ponteiro não anda.',
    fragmentId: 'clue-0317',
  },
  janela: {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  porta: {
    line: 'A porta está trancada por fora !!',
  },
  chave: {
    line: 'Chave da sala dos professores.',
    collectibleId: 'item-key',
  },
  'hall-clock': {
    line: 'O relógio marca 03:17. O ponteiro não anda.',
    fragmentId: 'clue-0317',
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
  'hall-bin': {
    line: 'Vazia.',
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
    line: 'Fechado. Ninguém.',
    sheet: 'guiche',
  },
  'lobby-bench': {
    line: 'Banco frio.',
  },
  'lobby-bin': {
    line: 'Vazia.',
  },
  'lobby-extinguisher': {
    line: 'Lacre intacto.',
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
    line: 'Ela sentou aqui.',
  },
  'office-chair': {
    line: 'Encostada. Não vou sentar.',
  },
  'office-files': {
    line: 'Arquivos. Fechado.',
  },
  'office-folder': {
    line: 'Uma pasta.',
  },
  'office-papers-files': {
    line: 'Pastas. Fechadas.',
  },
  'office-papers-floor': {
    line: 'Folhas no chão.',
  },
  'office-papers-window': {
    line: 'Molhada. O vento.',
  },
  'office-exit-note': {
    line: 'Portão do pátio. Escada descendo.',
    sheet: 'saida',
  },
  'office-counter': {
    line: 'Fechado do outro lado.',
    sheet: 'guiche',
  },
  'lib-shelf': {
    line: 'Estantes. A maior parte some no escuro.',
  },
  'lib-ledger': {
    line: 'M.A. Rabiscado. É M.',
    fragmentId: 'clue-ma',
  },
  'lib-note': {
    line: 'Eu quero ir embora. Essa frase de novo.',
    sheet: 'lib-note',
  },
  'lib-hours': {
    line: 'Fecha às 17h. A gente ainda estava aqui.',
  },
  'lib-card': {
    line: 'Sem nome. Ela tirou.',
  },
  'lib-stack': {
    line: 'Pilha. Nada na lombada.',
  },
  'lib-pile': {
    line: 'DIR. Telefone. Chaves. Zeladoria.',
    fragmentId: 'clue-plan',
    image: EXAMINE_IMG.plantaPavimento,
  },
  'lib-drawer': {
    line: 'Acho que a chave está na zeladoria.',
    image: EXAMINE_IMG.gavetaChaves,
  },
  'lib-chair': {
    line: 'Encostada.',
  },
  'bath-mirror': {
    line: 'Eu pareço péssima.',
  },
  'bath-stall': {
    line: 'O trinco está por dentro. Ela travou. Eu chamei.',
  },
  'bath-stall-empty': {
    line: 'Vazio.',
  },
  'bath-sink': {
    line: 'Ainda escorrendo.',
  },
  'bath-bin': {
    line: 'Um lenço. Molhado.',
  },
  'bath-elastic': {
    line: 'Caiu. Ela puxa quando fica assim.',
  },
  'office-window': {
    line: 'Aberta. Sem grade.',
  },
  'yard-body': {
    line: 'Você morreu aqui. Por minha causa.',
    fragmentId: 'clue-body',
  },
  'zel-broom': {
    line: 'Cerdas duras.',
  },
  'zel-products': {
    line: 'Cheiro forte.',
  },
  'zel-vac': {
    line: 'Pesado.',
  },
  'zel-locker': {
    line: 'Uma chave.',
    collectibleId: 'item-key-bib',
    image: EXAMINE_IMG.ultimoArmario,
  },
  'zel-empty': {
    line: 'Vazio.',
  },
  'zel-skeleton': {
    line: 'Emperrado.',
  },
  'lab-pc': {
    line: 'Computador desligado.',
  },
  'teachers-notice': {
    line: 'A gente ficou. Foi escolha.',
    fragmentId: 'clue-closing-notice',
    sheet: 'aviso',
  },
  'teachers-board': {
    line: 'Apagaram a reunião.',
  },
  'teachers-sofa': {
    line: 'Ninguém voltou aqui.',
  },
  'teachers-chair': {
    line: 'Ninguém voltou aqui.',
  },
  'teachers-cabinet': {
    line: 'BIB. EXT. DIR. Vazios. A chave está no ART. Lanterna no chão.',
    image: EXAMINE_IMG.professores,
  },
  'teachers-flashlight': {
    line: 'Pesada. Sem pilhas.',
    collectibleId: 'item-flashlight',
  },
  'teachers-key': {
    line: 'Chave da sala de artes.',
    collectibleId: 'item-key-diretoria',
  },
  'teachers-table': {
    line: 'Levou as chaves da externa. Foi embora.',
    sheet: 'ronda',
  },
  'teachers-window': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'arts-frame-1': {
    line: 'A tinta não secou. Foi hoje.',
    image: EXAMINE_IMG.natureza,
  },
  'arts-frame-2': {
    line: 'O corredor. Ela passou. Sumiu.',
    image: EXAMINE_IMG.corredor,
  },
  'arts-frame-3': {
    line: 'Ainda de noite. A gente ficou.',
    image: EXAMINE_IMG.arvore,
  },
  'arts-frame-4': {
    line: 'A gente. Os dois.',
    image: EXAMINE_IMG.retratos,
  },
  'arts-frame-5': {
    line: 'Uma janela no segundo andar. Marcada. É pra lá.',
    fragmentId: 'clue-second-floor',
    image: EXAMINE_IMG.fachada,
  },
  'arts-frame-6': {
    line: 'Sem nome. O meu é o quinto.',
    image: EXAMINE_IMG.composicao,
  },
  'arts-window': {
    line: 'Lá fora está completamente vazio. Nem uma luz. Nem um som.',
  },
  'locker-card': {
    line: '21 de julho. Não esquecer. Não é o meu.',
  },
  'locker-batteries': {
    line: 'Pilhas. Alguém deixou.',
    collectibleId: 'item-batteries',
  },
  'locker-janitor-key': {
    line: 'Uma chave.',
    collectibleId: 'item-key-zeladoria',
  },
  'zel-locker-key': {
    line: 'Uma chave.',
    collectibleId: 'item-key-bib',
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
  'zel-empty-0': 'zel-empty',
  'zel-empty-1': 'zel-empty',
  'zel-empty-2': 'zel-empty',
  'zel-empty-3': 'zel-empty',
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

function hasBibKey() {
  return useInventoryStore.getState().has(ITEM_IDS.bibKey)
}

function hasDirKey() {
  return useInventoryStore.getState().has(ITEM_IDS.dirKey)
}

export function getExamineEntry(id: string): ExamineEntry | null {
  const key = ALIAS[id] ?? id
  if (key === 'porta') {
    const phase = useDoorStore.getState().phase
    if (phase === 'open') return { line: 'O corredor está escuro.' }
    if (phase === 'ajar' || phase === 'opening') return { line: 'Agora está entreaberta...' }
    return { line: 'A porta está trancada por fora !!' }
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
      ? 'A chave ainda está no ART.'
      : takenKey
        ? 'A lanterna ainda está no chão.'
        : 'BIB. EXT. DIR. Vazios. A chave está no ART. Lanterna no chão.'
    return { line, image: EXAMINE_IMG.professores }
  }
  if (key === 'teachers-flashlight') {
    return hasFlashlight()
      ? { line: useInventoryStore.getState().has(ITEM_IDS.officeKey) ? 'Armário está vazio.' : 'A chave ainda está no ART.' }
      : { line: 'Pesada. Sem pilhas.', collectibleId: ITEM_IDS.flashlight }
  }
  if (key === 'teachers-key') {
    const takenKey = useInventoryStore.getState().has(ITEM_IDS.officeKey)
    if (takenKey) {
      return { line: hasFlashlight() ? 'Armário está vazio.' : 'A lanterna ainda está no chão.' }
    }
    return { line: 'Chave da sala de artes.', collectibleId: ITEM_IDS.officeKey }
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
  if (key === 'lobby-storage') {
    if (useGameStore.getState().flags.libDrawerSeen && !hasDirKey()) {
      return hasJanitorKey() ? { line: 'A chave da diretoria deve estar aqui.' } : { line: 'Acho que a chave está na zeladoria.' }
    }
    return hasJanitorKey() ? { line: 'Zeladoria.' } : { line: 'Zeladoria. Fechada.' }
  }
  if (key === 'lobby-library') {
    return hasBibKey() ? { line: 'Biblioteca.' } : { line: 'Biblioteca. Fechada.' }
  }
  if (key === 'lobby-office') {
    if (hasDirKey()) return { line: 'Diretoria.' }
    if (useGameStore.getState().collectedClues.includes(CLUE_IDS.secondFloor)) {
      return { line: 'É essa. A do segundo. Trancada.' }
    }
    return { line: 'Diretoria. Trancada.' }
  }
  if (key === 'lib-drawer') {
    if (useGameStore.getState().flags.libDrawerSeen) {
      return { line: 'Já vi. É lá.', image: EXAMINE_IMG.gavetaChaves }
    }
    return SHARED['lib-drawer']
  }
  if (key === 'zel-locker' || key === 'zel-locker-key') {
    return hasBibKey()
      ? { line: 'Vazio.' }
      : { line: 'Uma chave.', collectibleId: ITEM_IDS.bibKey, image: EXAMINE_IMG.ultimoArmario }
  }
  if (key === 'zel-skeleton') {
    const game = useGameStore.getState()
    const scared = Boolean(game.flags.zelSkeletonScare || game.flags.zelSkeletonOpen)
    if (!scared) return { line: 'Emperrado.' }
    if (!game.flags.libDrawerSeen) return { line: 'Não. Não agora.' }
    if (!hasDirKey()) {
      return {
        line: 'A chave da diretoria.',
        collectibleId: ITEM_IDS.dirKey,
        image: EXAMINE_IMG.zelEsqueleto,
      }
    }
    return { line: 'Vazio.' }
  }
  if (key === 'lobby-exit') {
    if (canDescendPatio()) return { line: 'Tem alguma coisa lá embaixo...' }
    const flags = useGameStore.getState().flags
    if (flags.patioGateAgain) return { line: 'Tem alguma coisa lá embaixo...' }
    if (flags.patioGatePushed) return { line: 'Não abre. Tem uma escada descendo.' }
    return { line: 'Um portão. Tem escada descendo.' }
  }
  if (key === 'bath-sink') {
    const game = useGameStore.getState()
    if (game.flags.bathWetGone) return { line: 'Sumiu.' }
    if (!game.flags.bathWetSeen) game.addFlag('bathWetSeen')
    return { line: 'Ainda escorrendo.' }
  }
  if (key === 'bath-mirror') {
    if (useGameStore.getState().flags.bathMirrorSeen) {
      return { line: 'Ela queria ir embora.', fragmentId: 'clue-wanted-out' }
    }
    return { line: 'Eu pareço péssima.' }
  }
  if (key === 'bath-elastic') {
    return useGameStore.getState().flags.marinaFolderSeen
      ? { line: 'O dela.' }
      : { line: 'Caiu. Ela puxa quando fica assim.' }
  }
  if (key === 'office-papers-floor') {
    return {
      line: 'A letra dela. Ela queria ir embora.',
      sheet: 'office-floor',
    }
  }
  if (key === 'office-papers-window') {
    return { line: 'Molhada. O vento.' }
  }
  if (key === 'office-exit-note') {
    if (canDescendPatio()) {
      return { line: 'Lá embaixo. O portão. Descer.', sheet: 'saida' }
    }
    return SHARED[key]
  }
  if (key === 'office-folder') {
    const game = useGameStore.getState()
    if (!game.flags.marinaFolderSeen) game.addFlag('marinaFolderSeen')
    return {
      line: 'Marina Alves. 2º B.\nEra ela.',
      fragmentId: 'clue-marina',
      sheet: 'pasta',
    }
  }
  if (key === 'office-window') {
    const flags = useGameStore.getState().flags
    if (!flags.marinaFolderSeen) return { line: 'Aberta. Sem grade.' }
    if (!flags.officeWindowNote) return { line: 'Alguém tirou a grade.', sheet: 'manutencao' }
    if (!flags.officeFallSeen) {
      return { line: 'Ela estava aqui. Comigo.\nEla caiu. 03:17.', fragmentId: 'clue-fall' }
    }
    return { line: '03:17. Ainda agora.' }
  }
  if (key === 'relogio') {
    const flags = useGameStore.getState().flags
    const line = flags.phone0317Seen
      ? 'É a mesma hora do celular. O ponteiro não anda.'
      : flags.hallClock0317Seen || flags.computerClock0317Seen
        ? 'É a mesma hora. O ponteiro não anda.'
        : 'O relógio marca 03:17. O ponteiro não anda.'
    if (!flags.clock0317Seen) useGameStore.getState().addFlag('clock0317Seen')
    return { line, fragmentId: 'clue-0317' }
  }
  if (key === 'hall-clock') {
    const flags = useGameStore.getState().flags
    const line = flags.clock0317Seen
      ? 'É a mesma hora do relógio da sala.'
      : flags.phone0317Seen
        ? 'É a mesma hora do celular.'
        : flags.computerClock0317Seen
          ? 'É a mesma hora.'
          : 'O relógio marca 03:17. O ponteiro não anda.'
    if (!flags.hallClock0317Seen) useGameStore.getState().addFlag('hallClock0317Seen')
    return { line, fragmentId: 'clue-0317' }
  }
  if (key === 'quadro-negro' && useGameStore.getState().flags.hangmanAmizade) {
    return { ...SHARED[key], line: 'A palavra era AMIZADE.', fragmentId: 'clue-friends' }
  }
  if (key === 'locker-card') {
    if (!useGameStore.getState().flags.liviaNiverNote) {
      useGameStore.getState().addFlag('liviaNiverNote')
    }
    return SHARED['locker-card']
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
        return { line: 'Cadernos. Um cartão. Meu moletom.', image: EXAMINE_IMG.armario4 }
      }
      if (locker.kind === 'marina') {
        return hasBatteries()
          ? { line: 'Armário está vazio.' }
          : { line: 'Pilhas. Alguém deixou.', image: EXAMINE_IMG.armario5, collectibleId: ITEM_IDS.batteries }
      }
      return { line: 'Quase vazio.' }
    }
    if (locker.kind === 'livia') return { line: 'Meu armário.' }
    if (locker.kind === 'marina') {
      return useGameStore.getState().flags.liviaNiverNote
        ? { line: 'O quinto. Sem nome. O código é o niver.' }
        : { line: 'O quinto. Sem nome.' }
    }
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
  if (
    isHallLockerId(id) ||
    id === 'quadro-negro' ||
    id === 'teachers-cabinet' ||
    id === 'zel-locker' ||
    id === 'zel-skeleton'
  ) {
    return 0
  }
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
    entry.sheet === 'ronda' ||
    entry.sheet === 'pasta' ||
    entry.sheet === 'manutencao' ||
    entry.sheet === 'saida' ||
    entry.sheet === 'guiche' ||
    entry.sheet === 'lib-note' ||
    entry.sheet === 'office-floor'
  ) {
    return 6.8
  }
  if (entry.sheet) return 5.5
  if (entry.fragmentId) return 5.4
  const n = entry.line?.length ?? 20
  return Math.min(6.4, 2.9 + n * 0.036)
}
