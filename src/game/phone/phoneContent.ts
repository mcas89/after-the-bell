import { EXAMINE_IMG } from '../data/examineContent'
import { hasDarkHallClues } from '../hallway/darkProgress'
import { useGameStore } from '../state/useGameStore'

export type PhoneApp =
  | 'home'
  | 'messages'
  | 'calls'
  | 'photos'
  | 'notes'
  | 'clock'
  | 'maps'
  | 'camera'
  | 'recorder'

export type ChatMsg = {
  who: 'them' | 'me'
  time: string
  text: string
}

export type PhoneThread = {
  id: string
  from: string
  time: string
  preview: string
  locked?: boolean
  lockedPreview?: string
  messages: ChatMsg[]
  line?: string
}

export const PHONE_THREADS: PhoneThread[] = [
  {
    id: 'm',
    from: 'M',
    time: '16:09',
    preview: 'depois da aula então',
    lockedPreview: 'Mensagem',
    messages: [
      { who: 'me', time: '16:04', text: 'a gente vai mesmo?' },
      { who: 'them', time: '16:05', text: 'vc é louca kkkkk' },
      { who: 'me', time: '16:05', text: 'vai ser de boa' },
      { who: 'them', time: '16:07', text: 'depois da aula então' },
      { who: 'them', time: '16:08', text: 'não conta pra ninguém' },
      { who: 'me', time: '16:08', text: 'relaxa' },
      { who: 'them', time: '16:09', text: 'não vai sozinha' },
      { who: 'me', time: '16:09', text: 'a gente vai junto' },
    ],
    line: 'M. Eu respondi ela o tempo todo.',
  },
  {
    id: 'mae',
    from: 'Mãe',
    time: '21:45',
    preview: 'boa noite filha, se comporte na casa da sua amiga',
    messages: [
      { who: 'them', time: '21:32', text: 'vai dormir na casa da sua amiga mesmo?' },
      { who: 'me', time: '21:33', text: 'sim' },
      { who: 'them', time: '21:45', text: 'boa noite filha, se comporte na casa da sua amiga' },
    ],
  },
  {
    id: 'keyla',
    from: 'Keyla',
    time: '00:28',
    preview: 'livia fala pra minha filha atender esse telefone',
    messages: [
      { who: 'them', time: '20:46', text: 'tu levou o trabalho?' },
      { who: 'me', time: '20:47', text: 'esqueci kkkkk' },
      { who: 'them', time: '20:48', text: 'impossível vc sobreviver sozinha' },
      { who: 'me', time: '20:48', text: 'sobrevivo sim' },
      { who: 'them', time: '00:28', text: 'livia fala pra minha filha atender esse telefone' },
    ],
  },
  {
    id: 'maya',
    from: 'Maya',
    time: '20:22',
    preview: 'vcs são lokas eu nao tenho coragem essa escola é estranha a noite !!!',
    messages: [
      { who: 'them', time: '20:18', text: 'vcs ainda tão na escola?' },
      { who: 'me', time: '20:19', text: 'a gente vai ficar a noite toda' },
      { who: 'them', time: '20:22', text: 'vcs são lokas eu nao tenho coragem essa escola é estranha a noite !!!' },
    ],
  },
  {
    id: 'lia',
    from: 'Professora Lia',
    time: '19:31',
    preview: 'não vi vcs saindo da escola hoje esta td bem ?',
    messages: [
      { who: 'them', time: '19:02', text: 'não esqueçam o trabalho para segunda' },
      { who: 'them', time: '19:31', text: 'não vi vcs saindo da escola hoje esta td bem ?' },
    ],
  },
]

export type PhoneCall = {
  id: string
  name: string
  time: string
  kind: 'in' | 'out'
  result: string
  duration?: string
  line?: string
}

export const PHONE_CALLS: PhoneCall[] = [
  { id: 'c1', name: 'Mãe', time: '23:41', kind: 'in', result: 'Recusada' },
  { id: 'c2', name: 'Mãe', time: '02:56', kind: 'out', result: 'Não completada' },
  { id: 'c3', name: 'Mãe', time: '03:00', kind: 'out', result: 'Não completada' },
  {
    id: 'c4',
    name: 'Contato indisponível',
    time: '03:11',
    kind: 'out',
    result: 'Realizada',
    duration: '00:02',
    line: 'Pra quem eu liguei?',
  },
]

export type PhonePhoto = {
  id: string
  name: string
  time: string
  image?: string
  broken?: boolean
  smear?: boolean
  line: string
}

export const PHONE_PHOTOS: PhonePhoto[] = [
  {
    id: 'old',
    name: 'retrato.jpg',
    time: '12/05 16:04',
    image: EXAMINE_IMG.retratos,
    smear: true,
    line: 'Essa foto está estranha.',
  },
  {
    id: 'selfie-1',
    name: 'IMG_1982.jpg',
    time: '16/06 11:16',
    image: EXAMINE_IMG.selfieLivia1,
    line: 'Sou eu.',
  },
  {
    id: 'selfie-2',
    name: 'IMG_1988.jpg',
    time: '16/06 11:22',
    image: EXAMINE_IMG.selfieLivia2,
    line: 'Eu. No corredor.',
  },
  {
    id: 'bag',
    name: 'IMG_2041.jpg',
    time: '17/06 20:54',
    image: EXAMINE_IMG.mochilaLivia,
    line: 'Eu estava levando isso tudo pra algum lugar.',
  },
  {
    id: 'selfie-her',
    name: 'IMG_2106.jpg',
    time: '17/06 22:41',
    image: EXAMINE_IMG.selfieLiviaMenina,
    line: 'O rosto dela não aparece.',
  },
  {
    id: 'gap',
    name: 'IMG_0317.jpg',
    time: '18/06 03:08',
    broken: true,
    line: '03:08.',
  },
]

export function isThreadLocked(thread: PhoneThread) {
  if (thread.id === 'm') {
    if (useGameStore.getState().flags.patioEntered) return false
    return !hasDarkHallClues()
  }
  return Boolean(thread.locked)
}

export function phoneThread(id: string | null) {
  if (!id) return null
  return PHONE_THREADS.find((thread) => thread.id === id) ?? null
}

export function phonePhoto(id: string | null) {
  if (!id) return null
  return PHONE_PHOTOS.find((photo) => photo.id === id) ?? null
}

export function phoneCall(id: string | null) {
  if (!id) return null
  return PHONE_CALLS.find((call) => call.id === id) ?? null
}
