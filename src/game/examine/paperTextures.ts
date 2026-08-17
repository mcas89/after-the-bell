import * as THREE from 'three'

const HAND = '"Segoe Script", "Lucida Handwriting", "Comic Sans MS", cursive'
const PRINT = 'Georgia, "Times New Roman", serif'
const SANS = '"Segoe UI", sans-serif'

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  return { canvas, ctx }
}

function textureFrom(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function paperFill(ctx: CanvasRenderingContext2D, w: number, h: number, tone = '#efe6d4') {
  ctx.fillStyle = tone
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(90, 70, 50, 0.04)'
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 8, 1)
  }
}

export function chalkboardTexture() {
  const { canvas, ctx } = makeCanvas(2048, 768)
  ctx.fillStyle = '#18241c'
  ctx.fillRect(0, 0, 2048, 768)

  ctx.fillStyle = 'rgba(236, 232, 220, 0.045)'
  for (let i = 0; i < 70; i += 1) {
    ctx.fillRect(Math.random() * 2040, Math.random() * 760, 16 + Math.random() * 28, 1.5)
  }

  const chalk = 'rgba(236, 232, 220, 0.9)'
  const mid = 'rgba(236, 232, 220, 0.55)'
  const ghost = 'rgba(228, 224, 210, 0.16)'

  function wipe(x: number, y: number, w: number, h: number, rot = 0) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.globalAlpha = 0.78
    ctx.fillStyle = '#121a16'
    ctx.fillRect(-w / 2, -h / 2, w, h)
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#1c2820'
    ctx.fillRect(-w / 2 + 8, -h / 2 + 6, w - 16, h - 12)
    ctx.restore()
  }

  wipe(420, 180, 520, 160, -0.08)
  wipe(980, 240, 480, 200, 0.06)
  wipe(1500, 160, 380, 140, -0.04)
  wipe(280, 520, 340, 90, 0.1)
  wipe(1280, 520, 420, 100, -0.05)
  wipe(700, 70, 260, 70, 0.02)

  ctx.strokeStyle = ghost
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(60, 90)
  ctx.quadraticCurveTo(200, 40, 360, 110)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(1100, 80)
  ctx.lineTo(1420, 50)
  ctx.stroke()
  ctx.fillStyle = ghost
  ctx.font = `38px ${HAND}`
  ctx.fillText('2x + 5 = 17', 80, 70)
  ctx.fillText('u² − 10u', 860, 95)
  ctx.fillText('prova', 1480, 70)
  ctx.font = `32px ${HAND}`
  ctx.fillText('x = 5', 90, 250)
  ctx.fillText('Δ = 32', 920, 300)

  ctx.fillStyle = mid
  ctx.font = `30px ${HAND}`
  ctx.fillText('2º B', 40, 40)

  ctx.strokeStyle = chalk
  ctx.lineWidth = 3.2
  ctx.beginPath()
  ctx.arc(210, 210, 20, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(210, 230)
  ctx.lineTo(210, 310)
  ctx.moveTo(210, 250)
  ctx.lineTo(178, 286)
  ctx.moveTo(210, 250)
  ctx.lineTo(242, 286)
  ctx.moveTo(210, 310)
  ctx.lineTo(186, 368)
  ctx.moveTo(210, 310)
  ctx.lineTo(236, 368)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(186, 236)
  ctx.quadraticCurveTo(210, 258, 236, 236)
  ctx.stroke()

  ctx.strokeStyle = chalk
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(360, 218, 18, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(360, 236)
  ctx.lineTo(368, 318)
  ctx.moveTo(368, 258)
  ctx.lineTo(338, 292)
  ctx.moveTo(368, 258)
  ctx.lineTo(400, 290)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(14, 20, 16, 0.88)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(318, 170)
  ctx.lineTo(418, 380)
  ctx.moveTo(330, 360)
  ctx.lineTo(422, 188)
  ctx.moveTo(312, 240)
  ctx.lineTo(430, 280)
  ctx.moveTo(340, 320)
  ctx.lineTo(410, 210)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(236, 232, 220, 0.32)'
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(322, 182)
  ctx.lineTo(412, 368)
  ctx.moveTo(338, 348)
  ctx.lineTo(416, 200)
  ctx.stroke()

  ctx.fillStyle = chalk
  ctx.font = `48px ${HAND}`
  ctx.fillText('L + M', 175, 430)
  ctx.strokeStyle = mid
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(250, 200)
  ctx.quadraticCurveTo(285, 160, 330, 205)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(286, 168, 10, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = mid
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(70, 480)
  ctx.lineTo(70, 560)
  ctx.lineTo(130, 560)
  ctx.lineTo(100, 510)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(100, 470, 16, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(100 + Math.cos(a) * 18, 470 + Math.sin(a) * 18)
    ctx.lineTo(100 + Math.cos(a) * 28, 470 + Math.sin(a) * 28)
    ctx.stroke()
  }

  ctx.fillStyle = mid
  ctx.font = `26px ${HAND}`
  ctx.fillText('oi', 500, 160)
  ctx.strokeStyle = chalk
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(560, 120)
  ctx.quadraticCurveTo(590, 90, 620, 120)
  ctx.quadraticCurveTo(650, 90, 680, 120)
  ctx.quadraticCurveTo(650, 155, 620, 180)
  ctx.quadraticCurveTo(590, 155, 560, 120)
  ctx.stroke()

  ctx.strokeStyle = ghost
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(720, 200)
  ctx.lineTo(880, 190)
  ctx.lineTo(800, 310)
  ctx.closePath()
  ctx.stroke()
  ctx.fillStyle = ghost
  ctx.font = `28px ${HAND}`
  ctx.fillText('??', 790, 250)

  ctx.strokeStyle = mid
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(520, 360)
  ctx.lineTo(700, 348)
  ctx.moveTo(680, 330)
  ctx.lineTo(700, 348)
  ctx.lineTo(672, 362)
  ctx.stroke()
  ctx.fillStyle = chalk
  ctx.font = `28px ${HAND}`
  ctx.fillText('espera', 530, 400)

  ctx.fillStyle = ghost
  ctx.font = `34px ${HAND}`
  ctx.fillText('Lívia', 1180, 130)
  ctx.fillStyle = 'rgba(18, 24, 20, 0.55)'
  ctx.fillRect(1170, 104, 120, 18)

  ctx.strokeStyle = chalk
  ctx.lineWidth = 4.2
  ctx.beginPath()
  ctx.moveTo(1480, 560)
  ctx.lineTo(1720, 560)
  ctx.lineTo(1720, 140)
  ctx.lineTo(1860, 140)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(1860, 140)
  ctx.lineTo(1860, 188)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(1860, 228, 28, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(1860, 256)
  ctx.lineTo(1860, 370)
  ctx.moveTo(1860, 290)
  ctx.lineTo(1818, 330)
  ctx.moveTo(1860, 290)
  ctx.lineTo(1902, 328)
  ctx.moveTo(1860, 370)
  ctx.lineTo(1832, 440)
  ctx.stroke()

  ctx.fillStyle = chalk
  ctx.font = `52px ${HAND}`
  ctx.fillText('_   _   I   E   _   D   _', 980, 680)

  ctx.strokeStyle = mid
  ctx.lineWidth = 2
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath()
    ctx.arc(1420 + i * 18, 360, 7, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(1600, 300)
  ctx.quadraticCurveTo(1640, 250, 1690, 300)
  ctx.stroke()

  ctx.fillStyle = ghost
  ctx.font = `30px ${HAND}`
  ctx.fillText('não apagar', 430, 620)
  ctx.fillStyle = 'rgba(16, 22, 18, 0.6)'
  ctx.fillRect(420, 592, 200, 22)

  ctx.strokeStyle = chalk
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(190, 500)
  ctx.lineTo(250, 560)
  ctx.lineTo(130, 560)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(190, 488, 8, 0, Math.PI * 2)
  ctx.stroke()

  return textureFrom(canvas)
}

export function linedPaperTexture() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  paperFill(ctx, 768, 1024)
  ctx.strokeStyle = 'rgba(70, 110, 160, 0.22)'
  ctx.lineWidth = 1
  for (let y = 120; y < 980; y += 42) {
    ctx.beginPath()
    ctx.moveTo(70, y)
    ctx.lineTo(720, y)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(180, 70, 70, 0.28)'
  ctx.beginPath()
  ctx.moveTo(96, 40)
  ctx.lineTo(96, 1000)
  ctx.stroke()
  ctx.fillStyle = '#1d4a9c'
  ctx.font = `48px ${HAND}`
  ctx.fillText('L + M', 130, 220)
  ctx.fillStyle = 'rgba(40, 55, 90, 0.35)'
  ctx.font = `28px ${HAND}`
  ctx.fillText('L + M', 400, 860)
  return textureFrom(canvas)
}

export function floorPaperTexture() {
  const { canvas, ctx } = makeCanvas(1024, 768)
  paperFill(ctx, 1024, 768, '#e9dfcc')
  ctx.strokeStyle = 'rgba(70, 110, 160, 0.18)'
  for (let y = 80; y < 720; y += 36) {
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(980, y)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(40, 40, 40, 0.55)'
  ctx.font = `32px ${HAND}`
  ctx.fillText('Prova  —  Matemática', 80, 140)
  ctx.fillText('2º B', 80, 186)
  ctx.fillText('3)  2x + 5  =  17', 80, 260)
  ctx.fillText('4)  a² + b² = c²', 80, 318)
  ctx.fillStyle = '#7a1c1c'
  ctx.font = `64px ${HAND}`
  ctx.fillText('B', 820, 180)

  ctx.save()
  ctx.translate(720, 430)
  ctx.rotate(-0.12)
  ctx.strokeStyle = 'rgba(50, 45, 40, 0.38)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(0, -70, 28, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * 34, -70 + Math.sin(a) * 34)
    ctx.lineTo(Math.cos(a) * 48, -70 + Math.sin(a) * 48)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-40, 10)
  ctx.lineTo(-40, 70)
  ctx.lineTo(40, 70)
  ctx.lineTo(40, 10)
  ctx.closePath()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-52, 12)
  ctx.lineTo(0, -28)
  ctx.lineTo(52, 12)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-8, 70)
  ctx.lineTo(-8, 38)
  ctx.lineTo(8, 38)
  ctx.lineTo(8, 70)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.translate(620, 620)
  ctx.rotate(-0.18)
  ctx.fillStyle = 'rgba(40, 40, 40, 0.28)'
  ctx.font = `28px ${HAND}`
  ctx.fillText('(rasgada)', 0, 0)
  ctx.restore()
  return textureFrom(canvas)
}

export function recordTexture() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  paperFill(ctx, 768, 1024, '#f3ead8')
  ctx.fillStyle = '#3b2a1c'
  ctx.font = `bold 36px ${PRINT}`
  ctx.fillText('Escola Estadual Francis Milton', 56, 80)
  ctx.font = `28px ${PRINT}`
  ctx.fillStyle = '#5a4030'
  ctx.fillText('2º Ano B  —  Registro de turma', 56, 130)
  ctx.strokeStyle = 'rgba(80, 60, 40, 0.25)'
  ctx.beginPath()
  ctx.moveTo(56, 160)
  ctx.lineTo(712, 160)
  ctx.stroke()
  ctx.font = `26px ${SANS}`
  ctx.fillStyle = '#2c241c'
  ctx.fillText('Lívia Ferreira', 56, 230)
  ctx.fillStyle = '#6a5a4a'
  ctx.font = `22px ${SANS}`
  ctx.fillText('Nº 17     2º B', 56, 268)
  ctx.fillText('Frequência    • • • •  ○  • •', 56, 360)
  ctx.fillText('Notas               7,0    6,5    —', 56, 420)
  ctx.fillStyle = 'rgba(40, 40, 40, 0.28)'
  ctx.fillText('Ocorrência:  ________________', 56, 520)
  ctx.fillRect(320, 210, 220, 18)
  ctx.fillRect(56, 560, 480, 14)
  return textureFrom(canvas)
}

export function muralTexture() {
  const { canvas, ctx } = makeCanvas(1024, 768)
  ctx.fillStyle = '#d8cbb3'
  ctx.fillRect(0, 0, 1024, 768)
  ctx.fillStyle = '#f4eee2'
  ctx.fillRect(40, 40, 300, 220)
  ctx.fillStyle = '#6a2c2c'
  ctx.font = `bold 28px ${SANS}`
  ctx.fillText('OUTUBRO', 110, 90)
  ctx.fillStyle = '#2a2420'
  ctx.font = `22px ${SANS}`
  ctx.fillText('S  T  Q  Q  S  S  D', 70, 140)
  ctx.fillText('        1  2  3  4  5', 70, 178)
  ctx.fillStyle = '#8b1e1e'
  ctx.fillText('               14', 70, 250)
  ctx.fillStyle = '#f7f1e4'
  ctx.fillRect(380, 50, 280, 160)
  ctx.fillStyle = '#333'
  ctx.font = `22px ${SANS}`
  ctx.fillText('Aviso de prova', 410, 100)
  ctx.font = `18px ${SANS}`
  ctx.fillText('Matemática  —  2º B', 410, 140)
  ctx.fillStyle = '#efe8d6'
  ctx.fillRect(700, 50, 280, 200)
  ctx.fillStyle = '#444'
  ctx.font = `20px ${SANS}`
  ctx.fillText('Sexta-feira', 740, 120)
  ctx.font = `bold 26px ${PRINT}`
  ctx.fillText('14 de outubro', 730, 170)
  ctx.fillStyle = '#e8e0d0'
  ctx.fillRect(40, 300, 420, 400)
  ctx.fillStyle = '#2a3238'
  ctx.fillRect(72, 348, 356, 268)
  ctx.fillStyle = '#3d4a52'
  ctx.fillRect(88, 372, 324, 188)
  ctx.fillStyle = 'rgba(18, 16, 14, 0.55)'
  for (let i = 0; i < 12; i += 1) {
    const col = i % 4
    const row = Math.floor(i / 4)
    ctx.beginPath()
    ctx.ellipse(130 + col * 78, 412 + row * 52, 16, 20, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(232, 224, 208, 0.72)'
  ctx.fillRect(72, 520, 200, 96)
  ctx.fillStyle = 'rgba(20, 18, 16, 0.18)'
  ctx.fillRect(72, 348, 356, 268)
  ctx.fillStyle = '#6a5a4a'
  ctx.font = `16px ${SANS}`
  ctx.fillText('2º B', 92, 548)
  ctx.fillStyle = '#f0e8d8'
  ctx.fillRect(520, 320, 460, 180)
  ctx.fillStyle = '#333'
  ctx.font = `22px ${SANS}`
  ctx.fillText('Campeonato interclasse', 560, 390)
  ctx.fillRect(520, 540, 460, 160)
  ctx.fillStyle = '#555'
  ctx.font = `20px ${SANS}`
  ctx.fillText('Horário de prova  —  2º B', 560, 610)
  ctx.fillText('07:20    Matemática', 560, 650)
  return textureFrom(canvas)
}

const cache = new Map<string, THREE.CanvasTexture>()

export function getWrittenTexture(kind: 'board' | 'bloco' | 'chao' | 'prontuario' | 'mural') {
  const cached = cache.get(kind)
  if (cached) return cached
  const texture =
    kind === 'board'
      ? chalkboardTexture()
      : kind === 'bloco'
        ? linedPaperTexture()
        : kind === 'chao'
          ? floorPaperTexture()
          : kind === 'prontuario'
            ? recordTexture()
            : muralTexture()
  cache.set(kind, texture)
  return texture
}
