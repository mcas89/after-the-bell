export type Aabb = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type FurnitureSpot = {
  position: [number, number, number]
  rotationY: number
  kind: 'desk' | 'teacher'
}

export type PropSpot = {
  id: string
  url: string
  position: [number, number, number]
  rotationY: number
  targetHeight?: number
  targetWidth?: number
  collide?: { halfX: number; halfZ: number }
}

const DESK_ROWS = [-0.25, 1.15, 2.5]
const DESK_COLS_LEFT = [-2.05, -0.95]
const DESK_COLS_RIGHT = [0.95, 2.05]
const FIRST_DESK: [number, number] = [DESK_COLS_LEFT[0], DESK_ROWS[0]]
const PAPER_DESK: [number, number] = [DESK_COLS_LEFT[1], DESK_ROWS[0]]
export const DESK_TOP = 0.86
export const TEACHER_TOP = 0.76

export const FURNITURE: FurnitureSpot[] = [
  ...DESK_ROWS.flatMap((z) =>
    [...DESK_COLS_LEFT, ...DESK_COLS_RIGHT].map(
      (x): FurnitureSpot => ({
        position: [x, 0, z],
        rotationY: Math.PI,
        kind: 'desk',
      }),
    ),
  ),
  {
    position: [0, 0, -2.55],
    rotationY: 0,
    kind: 'teacher',
  },
]

export const CLASSROOM_PROPS: PropSpot[] = [
  {
    id: 'mochila-fechada',
    url: '/mochila_fechada.glb',
    position: [-3.88, 0, -3.14],
    rotationY: 0.62,
    targetHeight: 0.44,
    collide: { halfX: 0.18, halfZ: 0.2 },
  },
  {
    id: 'mochila-aberta',
    url: '/mochila_aberta.glb',
    position: [-3.42, 0, -3.02],
    rotationY: -0.95,
    targetHeight: 0.3,
    collide: { halfX: 0.16, halfZ: 0.16 },
  },
  {
    id: 'refrigerante-1',
    url: '/refrigerante1.glb',
    position: [-3.58, 0, -2.78],
    rotationY: 0.4,
    targetHeight: 0.13,
  },
  {
    id: 'refrigerante-2',
    url: '/refrigerante2.glb',
    position: [-3.22, 0, -2.86],
    rotationY: -0.55,
    targetHeight: 0.125,
  },
  {
    id: 'prontuario',
    url: '/prontuarios.glb',
    position: [-0.22, TEACHER_TOP + 0.01, -2.48],
    rotationY: 0.18,
    targetHeight: 0.062,
  },
  {
    id: 'livros-professor',
    url: '/livros_pilhado.glb',
    position: [0.28, TEACHER_TOP + 0.01, -2.5],
    rotationY: 0.35,
    targetHeight: 0.16,
  },
  {
    id: 'bloco-folhas',
    url: '/bloco_folhas.glb',
    position: [PAPER_DESK[0] + 0.02, DESK_TOP - 0.16, PAPER_DESK[1] - 0.16],
    rotationY: Math.PI - 0.12,
    targetWidth: 0.22,
  },
  {
    id: 'canetas-professor',
    url: '/canetas.glb',
    position: [0.46, TEACHER_TOP + 0.01, -2.38],
    rotationY: 0.7,
    targetHeight: 0.028,
  },
  {
    id: 'canetas-carteira',
    url: '/canetas.glb',
    position: [FIRST_DESK[0] - 0.02, DESK_TOP - 0.17, FIRST_DESK[1] - 0.12],
    rotationY: -0.4,
    targetHeight: 0.024,
  },
  {
    id: 'folhas-chao',
    url: '/folhas%20jogadas.glb',
    position: [0.34, 0, 0.92],
    rotationY: 0.55,
    targetWidth: 0.52,
  },
  {
    id: 'armario-livros',
    url: '/armario_livros.glb',
    position: [-4.28, 0, 1.85],
    rotationY: Math.PI / 2 + Math.PI,
    targetHeight: 0.8,
    collide: { halfX: 0.22, halfZ: 0.7 },
  },
]

const colliders: Aabb[] = []
const sizes = {
  desk: { halfX: 0.38, halfZ: 0.44 },
  teacher: { halfX: 0.72, halfZ: 0.38 },
}

const MURAL_COLLIDER: Aabb = {
  minX: 4.38,
  maxX: 4.55,
  minZ: -0.38,
  maxZ: 1.28,
}

function rebuildColliders() {
  colliders.length = 0
  colliders.push(MURAL_COLLIDER)
  for (const item of FURNITURE) {
    const size = sizes[item.kind]
    const [x, , z] = item.position
    colliders.push({
      minX: x - size.halfX,
      maxX: x + size.halfX,
      minZ: z - size.halfZ,
      maxZ: z + size.halfZ,
    })
  }
  for (const prop of CLASSROOM_PROPS) {
    if (!prop.collide) continue
    const [x, , z] = prop.position
    colliders.push({
      minX: x - prop.collide.halfX,
      maxX: x + prop.collide.halfX,
      minZ: z - prop.collide.halfZ,
      maxZ: z + prop.collide.halfZ,
    })
  }
}

rebuildColliders()

export function setFurnitureFootprint(
  kind: 'desk' | 'teacher',
  width: number,
  depth: number,
) {
  sizes[kind] = {
    halfX: Math.max(0.2, width * 0.46),
    halfZ: Math.max(0.2, depth * 0.46),
  }
  rebuildColliders()
}

export function getColliders() {
  return colliders
}
