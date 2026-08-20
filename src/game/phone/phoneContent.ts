import { EXAMINE_IMG } from '../data/examineContent'

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
  messages: ChatMsg[]
  line?: string
}

export const PHONE_THREADS: PhoneThread[] = [
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
      { who: 'me', time: '20:19', text: 'um pouco' },
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
  {
    id: 'locked',
    from: '',
    time: '—',
    preview: 'Conversa indisponível',
    locked: true,
    messages: [],
    line: 'Por que só essa não abre?',
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
    time: '12/08 16:04',
    image: EXAMINE_IMG.retratos,
    smear: true,
    line: 'Essa foto está estranha.',
  },
  {
    id: 'selfie-1',
    name: 'IMG_1982.jpg',
    time: '13/10 11:16',
    image: EXAMINE_IMG.selfieLivia1,
    line: 'Sou eu.',
  },
  {
    id: 'selfie-2',
    name: 'IMG_1988.jpg',
    time: '13/10 11:22',
    image: EXAMINE_IMG.selfieLivia2,
    line: 'Eu. No corredor.',
  },
  {
    id: 'bag',
    name: 'IMG_2041.jpg',
    time: '14/10 20:54',
    image: EXAMINE_IMG.mochilaLivia,
    line: 'Eu estava levando isso tudo pra algum lugar.',
  },
  {
    id: 'selfie-her',
    name: 'IMG_2106.jpg',
    time: '14/10 22:41',
    image: EXAMINE_IMG.selfieLiviaMenina,
    line: 'O rosto dela não aparece.',
  },
  {
    id: 'gap',
    name: 'IMG_0317.jpg',
    time: '15/10 03:08',
    broken: true,
    line: '03:08.',
  },
]

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
