export type ObjectiveId = 'explore-school' | 'find-girl' | 'find-exit'

export const OBJECTIVES: Record<ObjectiveId, { title: string; line: string }> = {
  'explore-school': {
    title: 'Explore a escola',
    line: 'A escola está quieta demais.',
  },
  'find-girl': {
    title: 'Quem é a garota',
    line: 'Ela passou pelo corredor. Preciso achar ela.',
  },
  'find-exit': {
    title: 'Encontre uma saída',
    line: 'Tem que ter um jeito de sair daqui.',
  },
}
