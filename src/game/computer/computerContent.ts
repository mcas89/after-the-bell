export type ComputerApp =
  | 'home'
  | 'docs'
  | 'work'
  | 'photos'
  | 'downloads'
  | 'notes'
  | 'web'
  | 'clock'
  | 'trash'
  | 'computer'

export type PcKind = 'folder' | 'doc' | 'photo' | 'sheet' | 'broken' | 'empty'

export type PcNode = {
  id: string
  app: Exclude<ComputerApp, 'home'>
  parent: string | null
  kind: PcKind
  name: string
  date?: string
  size?: string
  children?: string[]
  body?: string[]
  image?: string
  line?: string
  itemsLabel?: string
}

export const APP_ROOT: Partial<Record<Exclude<ComputerApp, 'home'>, string>> = {
  docs: 'docs-root',
  work: 'work-root',
  photos: 'photos-root',
  downloads: 'dl-root',
  trash: 'trash-root',
}

export const PC_NODES: Record<string, PcNode> = {
  'docs-root': {
    id: 'docs-root',
    app: 'docs',
    parent: null,
    kind: 'folder',
    name: 'Meus documentos',
    children: ['docs-escola', 'docs-pessoal'],
  },
  'docs-escola': {
    id: 'docs-escola',
    app: 'docs',
    parent: 'docs-root',
    kind: 'folder',
    name: 'Escola',
    date: '12/06 16:40',
    children: ['docs-historia', 'docs-bio', 'docs-mat'],
  },
  'docs-historia': {
    id: 'docs-historia',
    app: 'docs',
    parent: 'docs-escola',
    kind: 'doc',
    name: 'Trabalho_Historia.docx',
    date: '08/06 21:12',
    size: '18 KB',
    body: [
      'A Proclamação da República — 2º B',
      'O 15 de novembro de 1889 encerra a monarquia. O texto pede causas políticas e militares, sem copiar o livro.',
      'Nome: Lívia Ferreira',
    ],
  },
  'docs-bio': {
    id: 'docs-bio',
    app: 'docs',
    parent: 'docs-escola',
    kind: 'doc',
    name: 'Resumo_Biologia.docx',
    date: '11/06 19:04',
    size: '12 KB',
    body: [
      'Célula animal — núcleo, mitocôndria, membrana.',
      'A mitocôndria produz energia. Não misturar com célula vegetal.',
    ],
  },
  'docs-mat': {
    id: 'docs-mat',
    app: 'docs',
    parent: 'docs-escola',
    kind: 'doc',
    name: 'Matematica_Exercicios.docx',
    date: '16/06 17:22',
    size: '9 KB',
    body: ['Exercício 1  ·  2x + 4 = 10', 'Exercício 2  ·  área do retângulo', 'Exercício 3  —  não terminei'],
  },
  'docs-pessoal': {
    id: 'docs-pessoal',
    app: 'docs',
    parent: 'docs-root',
    kind: 'empty',
    name: 'Pessoal',
    date: '18/06 03:04',
    itemsLabel: 'Itens: 2',
    line: 'Vazia...?',
  },
  'work-root': {
    id: 'work-root',
    app: 'work',
    parent: null,
    kind: 'folder',
    name: 'Trabalhos',
    children: ['work-grupo', 'work-leitura', 'work-artes'],
  },
  'work-grupo': {
    id: 'work-grupo',
    app: 'work',
    parent: 'work-root',
    kind: 'doc',
    name: 'Relatorio_Grupo.docx',
    date: '06/06 14:18',
    size: '22 KB',
    body: ['Relatório de grupo — Geografia', 'Clima da região. Fontes: livro e atlas.', 'Entrega: feita.'],
  },
  'work-leitura': {
    id: 'work-leitura',
    app: 'work',
    parent: 'work-root',
    kind: 'doc',
    name: 'Ficha_Leitura.docx',
    date: '09/06 20:41',
    size: '8 KB',
    body: ['Ficha de leitura', 'Personagem principal. Conflito. Final.', 'Nota: B'],
  },
  'work-artes': {
    id: 'work-artes',
    app: 'work',
    parent: 'work-root',
    kind: 'doc',
    name: 'Trabalho_Artes.docx',
    date: '16/06 18:55',
    size: '14 KB',
    line: 'Trabalho de artes...',
    body: [
      'A escola pelos nossos olhos',
      '2º B — Artes',
      'Observar o prédio. Corredor, pátio, fachada. Sem copiar foto de revista.',
      'Entregar até sexta.',
    ],
  },
  'photos-root': {
    id: 'photos-root',
    app: 'photos',
    parent: null,
    kind: 'folder',
    name: 'Fotos',
    children: ['photos-turma', 'photos-corredor', 'photos-fachada'],
  },
  'photos-turma': {
    id: 'photos-turma',
    app: 'photos',
    parent: 'photos-root',
    kind: 'broken',
    name: 'turma_2B.jpg',
    date: '03/06 11:20',
    size: '1.2 MB',
    line: 'Arquivo danificado.',
  },
  'photos-corredor': {
    id: 'photos-corredor',
    app: 'photos',
    parent: 'photos-root',
    kind: 'broken',
    name: 'artes_corredor.jpg',
    date: '16/06 15:08',
    size: '840 KB',
    line: 'Arquivo danificado.',
  },
  'photos-fachada': {
    id: 'photos-fachada',
    app: 'photos',
    parent: 'photos-root',
    kind: 'broken',
    name: 'fachada_escola.jpg',
    date: '16/06 15:11',
    size: '910 KB',
    line: 'Arquivo danificado.',
  },
  'dl-root': {
    id: 'dl-root',
    app: 'downloads',
    parent: null,
    kind: 'folder',
    name: 'Downloads',
    children: ['dl-horarios', 'dl-mapa'],
  },
  'dl-horarios': {
    id: 'dl-horarios',
    app: 'downloads',
    parent: 'dl-root',
    kind: 'doc',
    name: 'horarios_escola.pdf',
    date: '18/06 02:14',
    size: '64 KB',
    line: 'Só o horário das aulas.',
    body: [
      'Escola Estadual Francis Milton',
      'Horário de funcionamento',
      'Aulas: 07:20 — 17:40',
      'Intervalo: 09:50 — 10:10',
      'Almoço: 12:00 — 13:20',
    ],
  },
  'dl-mapa': {
    id: 'dl-mapa',
    app: 'downloads',
    parent: 'dl-root',
    kind: 'sheet',
    name: 'mapa_emergencia.png',
    date: '18/06 02:29',
    size: '220 KB',
  },
  'trash-root': {
    id: 'trash-root',
    app: 'trash',
    parent: null,
    kind: 'folder',
    name: 'Lixeira',
    children: ['trash-foto'],
  },
  'trash-foto': {
    id: 'trash-foto',
    app: 'trash',
    parent: 'trash-root',
    kind: 'broken',
    name: 'foto_1806.jpg',
    date: 'Excluído: 18/06 03:12',
    size: '—',
    line: 'Arquivo danificado.',
  },
}

export function pcNode(id: string | null) {
  if (!id) return null
  return PC_NODES[id] ?? null
}

export function pcChildren(id: string) {
  const node = PC_NODES[id]
  return (node?.children ?? []).map((child) => PC_NODES[child]).filter(Boolean)
}

export function pcCanGoBack(id: string | null) {
  const node = pcNode(id)
  return Boolean(node?.parent)
}

export const WEB_PAGES: Record<string, { url: string; title: string; body: string[] } | null> = {
  '01:52': {
    url: 'http://horariomundial.com/amanhecer',
    title: 'Amanhecer — hoje',
    body: ['Nascer do sol: 05:41', 'Duração da noite: 11h 22min', 'Cópia armazenada. Sem conexão.'],
  },
  '02:16': {
    url: 'http://edu.gov/escola/seguranca/alarme',
    title: 'Alarme e portas de emergência',
    body: ['Após as 22h o alarme é armado.', 'Cópia armazenada. Sem conexão.'],
  },
  '02:34': {
    url: 'http://forum.saida/porta-trancada',
    title: 'Como abrir porta trancada por dentro',
    body: [
      'Barra antipânico. Não forçar a fechadura.',
      'Se não abre pelo lado de dentro, procurar outra saída.',
      'Cópia armazenada. Sem conexão.',
    ],
  },
  '02:51': {
    url: 'http://edu.gov/escola/planta/bloco-b',
    title: 'Saída — segundo andar',
    body: [
      'Bloco B. Escadas. Corredor do segundo andar.',
      'Uma das saídas aparece cortada neste arquivo.',
      'Cópia armazenada. Sem conexão.',
    ],
  },
  '03:05': null,
}
