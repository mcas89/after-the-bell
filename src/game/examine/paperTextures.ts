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

  wipe(1380, 660, 920, 96, 0.01)

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
  ctx.fillText('L + M', 130, 168)
  ctx.fillStyle = '#2a3a68'
  ctx.font = `26px ${HAND}`
  ctx.fillText('depois de todos irem a', 118, 248)
  ctx.fillStyle = '#5a3060'
  ctx.font = `32px ${HAND}`
  ctx.fillText('eu nao sei esperar !!!', 118, 310)
  ctx.font = `26px ${HAND}`
  ctx.fillText('se precisar o meu e o quinto', 118, 420)
  ctx.fillText('codigo meu niver', 118, 466)
  ctx.fillStyle = 'rgba(40, 55, 90, 0.32)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('L + M', 430, 900)
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
  ctx.fillText('Nascimento: 03/05', 56, 268)
  ctx.fillText('Nº 17     2º B', 56, 308)
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

function corkFill(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#c4a06a'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#b8925c'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 220; i += 1) {
    ctx.fillStyle = `rgba(72, 48, 24, ${0.05 + Math.random() * 0.1})`
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 2.4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function pin(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.arc(x - 2, y - 2, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

function darkPhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  faces: number,
) {
  ctx.fillStyle = '#efe6d4'
  ctx.fillRect(x - 10, y - 10, w + 20, h + 36)
  ctx.fillStyle = '#1a2228'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#2a343c'
  ctx.fillRect(x + 8, y + 8, w - 16, h - 28)
  ctx.fillStyle = 'rgba(12, 10, 9, 0.7)'
  for (let i = 0; i < faces; i += 1) {
    const col = i % 4
    const row = Math.floor(i / 4)
    ctx.beginPath()
    ctx.ellipse(x + 28 + col * ((w - 40) / 3.2), y + 36 + row * 38, 11, 14, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(18, 16, 14, 0.35)'
  ctx.fillRect(x, y, w, h)
}

function hallBoardLost() {
  const { canvas, ctx } = makeCanvas(1024, 704)
  corkFill(ctx, 1024, 704)
  ctx.fillStyle = '#f2ead8'
  ctx.fillRect(48, 36, 420, 78)
  ctx.fillStyle = '#6a2424'
  ctx.font = `bold 36px ${SANS}`
  ctx.fillText('ACHADOS E PERDIDOS', 68, 88)
  pin(ctx, 62, 48, '#c43c3c')

  darkPhoto(ctx, 70, 150, 280, 210, 1)
  ctx.fillStyle = '#5a4a3a'
  ctx.font = `18px ${SANS}`
  ctx.fillText('mochila  —  2º B ?', 78, 390)
  pin(ctx, 82, 158, '#3c6aa8')

  ctx.fillStyle = '#fff3b0'
  ctx.fillRect(400, 148, 250, 168)
  ctx.fillStyle = '#333'
  ctx.font = `22px ${HAND}`
  ctx.fillText('perdi meu estojo', 418, 200)
  ctx.font = `18px ${HAND}`
  ctx.fillText('rosa, com gatinho', 418, 236)
  ctx.fillText('se achar deixa na 11', 418, 272)
  pin(ctx, 420, 156, '#3c8a4a')

  ctx.fillStyle = '#f7f1e4'
  ctx.fillRect(680, 40, 300, 210)
  ctx.fillStyle = '#333'
  ctx.font = `bold 22px ${PRINT}`
  ctx.fillText('Campeonato', 710, 90)
  ctx.font = `18px ${SANS}`
  ctx.fillText('interclasse  —  vôlei', 710, 128)
  ctx.fillText('inscrições no mural', 710, 164)
  ctx.fillStyle = '#8b1e1e'
  ctx.fillText('faces cortadas', 710, 210)
  pin(ctx, 696, 52, '#c43c3c')

  ctx.fillStyle = '#e8f0d8'
  ctx.fillRect(400, 360, 280, 150)
  ctx.fillStyle = '#2a2420'
  ctx.font = `20px ${HAND}`
  ctx.fillText('achei um fone', 424, 420)
  ctx.fillText('na janela do pátio', 424, 456)
  pin(ctx, 418, 372, '#d4a018')

  ctx.fillStyle = '#f0e4cc'
  ctx.fillRect(720, 300, 250, 280)
  ctx.fillStyle = '#444'
  ctx.font = `18px ${SANS}`
  ctx.fillText('chave pequena', 748, 360)
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(820, 430, 22, 0, Math.PI * 2)
  ctx.moveTo(842, 430)
  ctx.lineTo(900, 430)
  ctx.lineTo(900, 448)
  ctx.stroke()
  ctx.fillStyle = '#6a5a4a'
  ctx.font = `16px ${SANS}`
  ctx.fillText('ninguém reclamou', 748, 520)
  pin(ctx, 736, 312, '#3c6aa8')

  ctx.fillStyle = '#ffe08a'
  ctx.fillRect(70, 470, 300, 170)
  ctx.fillStyle = '#333'
  ctx.font = `20px ${HAND}`
  ctx.fillText('M — espera depois', 92, 530)
  ctx.fillText('não vai sozinha', 92, 572)
  pin(ctx, 86, 482, '#c43c3c')
  return textureFrom(canvas)
}

function hallBoardPhotos() {
  const { canvas, ctx } = makeCanvas(1024, 704)
  corkFill(ctx, 1024, 704)
  ctx.fillStyle = '#f4eee2'
  ctx.fillRect(36, 28, 280, 64)
  ctx.fillStyle = '#2a2420'
  ctx.font = `bold 28px ${SANS}`
  ctx.fillText('2º B  ·  2025', 56, 70)
  pin(ctx, 48, 40, '#c43c3c')

  darkPhoto(ctx, 48, 120, 460, 320, 12)
  ctx.fillStyle = '#6a5a4a'
  ctx.font = `16px ${SANS}`
  ctx.fillText('foto da turma. ninguém dá pra reconhecer.', 56, 472)
  pin(ctx, 62, 132, '#3c6aa8')

  ctx.fillStyle = '#efe6d4'
  ctx.fillRect(560, 48, 200, 240)
  ctx.fillStyle = '#243038'
  ctx.fillRect(576, 64, 168, 168)
  ctx.fillStyle = 'rgba(10, 8, 8, 0.65)'
  ctx.beginPath()
  ctx.ellipse(660, 140, 28, 36, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5a4a3a'
  ctx.font = `16px ${SANS}`
  ctx.fillText('???', 648, 258)
  pin(ctx, 574, 60, '#d4a018')

  ctx.fillStyle = '#efe6d4'
  ctx.fillRect(790, 48, 190, 220)
  ctx.fillStyle = '#1c2428'
  ctx.fillRect(804, 62, 162, 150)
  ctx.fillStyle = 'rgba(12, 10, 9, 0.7)'
  ctx.beginPath()
  ctx.ellipse(885, 128, 24, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#6a5a4a'
  ctx.font = `15px ${SANS}`
  ctx.fillText('intervalo', 830, 242)
  pin(ctx, 804, 58, '#3c8a4a')

  ctx.fillStyle = '#f7f1e4'
  ctx.fillRect(540, 330, 440, 150)
  ctx.fillStyle = '#333'
  ctx.font = `bold 24px ${PRINT}`
  ctx.fillText('Campeonato interclasse', 568, 380)
  ctx.font = `18px ${SANS}`
  ctx.fillText('As faces do cartaz foram apagadas.', 568, 424)
  pin(ctx, 556, 342, '#c43c3c')

  ctx.fillStyle = '#fff3b0'
  ctx.fillRect(48, 520, 320, 140)
  ctx.fillStyle = '#333'
  ctx.font = `20px ${HAND}`
  ctx.fillText('isso era pra ser a gente', 70, 580)
  ctx.fillText('por que ninguém aparece?', 70, 620)
  pin(ctx, 64, 532, '#3c6aa8')

  ctx.fillStyle = '#e8e0d0'
  ctx.fillRect(400, 520, 280, 140)
  ctx.fillStyle = '#444'
  ctx.font = `18px ${SANS}`
  ctx.fillText('14 de outubro', 424, 580)
  ctx.fillText('sexta  ·  prova', 424, 616)
  pin(ctx, 416, 532, '#d4a018')
  return textureFrom(canvas)
}

function hallBoardNotes() {
  const { canvas, ctx } = makeCanvas(1024, 704)
  corkFill(ctx, 1024, 704)

  const slips: Array<[number, number, number, number, string, string, string]> = [
    [40, 36, 260, 150, '#fff3b0', '#c43c3c', 'prova amanhã\n2º B  mat'],
    [330, 50, 240, 140, '#e8f0d8', '#3c8a4a', 'não esquece\ndo fone'],
    [600, 40, 380, 170, '#f7f1e4', '#3c6aa8', 'Reunião de pais\nadiada\nsem nova data'],
    [50, 220, 300, 180, '#ffe0c8', '#d4a018', 'M espera\ndepois da aula\nna 11'],
    [380, 230, 280, 170, '#f0e4cc', '#c43c3c', 'quem deixou\na janela aberta?'],
    [700, 240, 280, 200, '#fff3b0', '#3c8a4a', 'preciso falar\ncom vc\nnão vai embora'],
    [80, 440, 340, 200, '#f7f1e4', '#3c6aa8', 'o nome está\nrasgado no meio\n________'],
    [460, 450, 250, 180, '#e8f0d8', '#d4a018', 'horário  07:20\nainda vale?'],
    [740, 470, 240, 170, '#ffe0c8', '#c43c3c', 'não conta\npra ninguém'],
  ]
  for (const [x, y, w, h, paper, head, text] of slips) {
    ctx.fillStyle = paper
    ctx.fillRect(x, y, w, h)
    pin(ctx, x + 16, y + 14, head)
    ctx.fillStyle = '#2c241c'
    ctx.font = `22px ${HAND}`
    const lines = text.split('\n')
    lines.forEach((line, i) => ctx.fillText(line, x + 22, y + 58 + i * 32))
  }
  ctx.fillStyle = 'rgba(20,16,14,0.55)'
  ctx.fillRect(96, 528, 210, 22)
  return textureFrom(canvas)
}

export type HallBoardKind = 'lost' | 'photos' | 'notes'

export function getHallBoardTexture(kind: HallBoardKind) {
  const key = `hall-board-${kind}`
  const cached = cache.get(key)
  if (cached) return cached
  const texture =
    kind === 'lost' ? hallBoardLost() : kind === 'photos' ? hallBoardPhotos() : hallBoardNotes()
  cache.set(key, texture)
  return texture
}

function noticeTexture() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  paperFill(ctx, 768, 1024, '#f2ece0')
  ctx.fillStyle = '#3a3228'
  ctx.font = `22px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('ESCOLA ESTADUAL FRANCIS MILTON', 384, 88)
  ctx.font = `bold 34px ${PRINT}`
  ctx.fillText('AVISO INTERNO', 384, 150)
  ctx.fillStyle = '#6a5a48'
  ctx.font = `22px ${SANS}`
  ctx.fillText('Fechamento do prédio', 384, 198)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#2a2420'
  ctx.font = `28px ${PRINT}`
  ctx.fillText('Horário: 22h00', 88, 310)
  ctx.font = `26px ${PRINT}`
  ctx.fillText('Após esse horário o alarme', 88, 390)
  ctx.fillText('é armado automaticamente.', 88, 432)
  ctx.fillText('Portas externas trancam', 88, 520)
  ctx.fillText('por fora.', 88, 562)
  ctx.fillStyle = '#5a4034'
  ctx.font = `24px ${PRINT}`
  ctx.fillText('Não permanecer no prédio.', 88, 680)
  ctx.fillStyle = 'rgba(90, 50, 40, 0.35)'
  ctx.font = `20px ${SANS}`
  ctx.fillText('Direção', 88, 860)
  return textureFrom(canvas)
}

function exitNoticeTexture() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  paperFill(ctx, 768, 1024, '#f3efe4')
  ctx.fillStyle = '#3a3228'
  ctx.font = `20px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('ESCOLA ESTADUAL FRANCIS MILTON', 384, 88)
  ctx.font = `bold 32px ${PRINT}`
  ctx.fillText('SAÍDA DE EMERGÊNCIA', 384, 150)
  ctx.fillStyle = '#6a5a48'
  ctx.font = `22px ${SANS}`
  ctx.fillText('Pátio interno', 384, 198)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#2a2420'
  ctx.font = `28px ${PRINT}`
  ctx.fillText('Portão do pátio', 88, 320)
  ctx.font = `26px ${PRINT}`
  ctx.fillText('Escada para o térreo.', 88, 400)
  ctx.fillText('Não usar o elevador.', 88, 488)
  ctx.fillStyle = '#5a4034'
  ctx.font = `22px ${PRINT}`
  ctx.fillText('Manter o portão fechado', 88, 640)
  ctx.fillText('após a ronda.', 88, 682)
  ctx.fillStyle = 'rgba(90, 50, 40, 0.35)'
  ctx.font = `20px ${SANS}`
  ctx.fillText('Direção', 88, 860)
  return textureFrom(canvas)
}

function rondaTexture() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  paperFill(ctx, 768, 1024, '#f4eee2')
  ctx.fillStyle = '#3a3228'
  ctx.font = `20px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('ESCOLA ESTADUAL FRANCIS MILTON', 384, 78)
  ctx.font = `bold 32px ${PRINT}`
  ctx.fillText('RONDA DE FECHAMENTO', 384, 128)
  ctx.fillStyle = '#6a5a48'
  ctx.font = `22px ${SANS}`
  ctx.fillText('14 de outubro', 384, 168)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#2a2420'
  ctx.font = `26px ${PRINT}`
  ctx.fillText('Alarme', 88, 250)
  ctx.fillText('22:00', 520, 250)
  ctx.font = `24px ${PRINT}`
  ctx.fillText('Porta externa A', 88, 340)
  ctx.fillText('ok', 560, 340)
  ctx.fillText('Porta externa B', 88, 400)
  ctx.fillText('ok', 560, 400)
  ctx.fillText('Portaria — chaves', 88, 460)
  ctx.fillText('ok', 560, 460)
  ctx.fillStyle = '#5a4034'
  ctx.font = `24px ${PRINT}`
  ctx.fillText('Plantão', 88, 560)
  ctx.fillText('H. Costa', 400, 560)
  ctx.fillText('Saída', 88, 620)
  ctx.fillText('22:04', 400, 620)
  ctx.strokeStyle = 'rgba(40, 30, 24, 0.55)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(88, 700)
  ctx.lineTo(680, 700)
  ctx.stroke()
  ctx.fillStyle = '#4a3028'
  ctx.font = `28px ${HAND}`
  ctx.fillText('levei as chaves da externa', 88, 770)
  ctx.fillStyle = 'rgba(90, 50, 40, 0.4)'
  ctx.font = `20px ${SANS}`
  ctx.fillText('Não permanecer no prédio.', 88, 920)
  return textureFrom(canvas)
}

function teachersBoardTexture() {
  const { canvas, ctx } = makeCanvas(1024, 512)
  ctx.fillStyle = '#e8e4d8'
  ctx.fillRect(0, 0, 1024, 512)
  ctx.fillStyle = 'rgba(180, 176, 168, 0.35)'
  ctx.fillRect(40, 60, 280, 90)
  ctx.fillRect(360, 80, 220, 70)
  ctx.fillStyle = 'rgba(90, 90, 90, 0.18)'
  ctx.font = `42px ${SANS}`
  ctx.fillText('reunião', 70, 120)
  ctx.fillStyle = 'rgba(60, 70, 90, 0.38)'
  ctx.font = `64px ${SANS}`
  ctx.fillText('22h', 780, 430)
  ctx.strokeStyle = 'rgba(90, 90, 90, 0.12)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(80, 200)
  ctx.lineTo(400, 188)
  ctx.stroke()
  return textureFrom(canvas)
}

export type ArtDrawingId = 'window' | 'vases' | 'hall' | 'tree' | 'faces' | 'shapes'

function artPaper(ctx: CanvasRenderingContext2D, w: number, h: number, tone: string) {
  paperFill(ctx, w, h, tone)
  ctx.fillStyle = 'rgba(40, 28, 18, 0.05)'
  for (let i = 0; i < 28; i += 1) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 12 + Math.random() * 40, 1)
  }
}

function artDrawingWindow() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#e6e0d4')
  ctx.fillStyle = '#3a342c'
  ctx.fillRect(0, 0, 768, 1024)
  ctx.fillStyle = '#4a443c'
  ctx.fillRect(118, 90, 532, 760)
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(168, 140, 432, 660)
  ctx.fillStyle = '#c9d8ea'
  ctx.beginPath()
  ctx.arc(430, 210, 46, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(180, 200, 220, 0.18)'
  ctx.fillRect(168, 140, 432, 660)
  ctx.strokeStyle = '#d8d0c4'
  ctx.lineWidth = 22
  ctx.strokeRect(168, 140, 432, 660)
  ctx.beginPath()
  ctx.moveTo(384, 140)
  ctx.lineTo(384, 800)
  ctx.moveTo(168, 430)
  ctx.lineTo(600, 430)
  ctx.stroke()
  ctx.fillStyle = '#0b1220'
  ctx.beginPath()
  ctx.moveTo(250, 300)
  ctx.lineTo(340, 220)
  ctx.lineTo(390, 360)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(470, 480)
  ctx.lineTo(580, 430)
  ctx.lineTo(560, 620)
  ctx.lineTo(430, 580)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(236, 240, 246, 0.88)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(220, 180)
  ctx.lineTo(310, 520)
  ctx.lineTo(200, 740)
  ctx.moveTo(310, 520)
  ctx.lineTo(540, 260)
  ctx.moveTo(310, 520)
  ctx.lineTo(560, 700)
  ctx.moveTo(250, 300)
  ctx.lineTo(470, 480)
  ctx.moveTo(390, 360)
  ctx.lineTo(200, 420)
  ctx.stroke()
  ctx.fillStyle = 'rgba(236, 232, 220, 0.55)'
  ctx.font = `34px ${HAND}`
  ctx.fillText('2º', 196, 186)
  ctx.fillStyle = 'rgba(236, 232, 220, 0.4)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('observação  —  janela', 96, 980)
  return textureFrom(canvas)
}

function artDrawingVases() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#f2e6d2')
  ctx.fillStyle = '#d8c4a4'
  ctx.fillRect(80, 720, 608, 28)
  ctx.fillStyle = '#6a2428'
  ctx.beginPath()
  ctx.ellipse(240, 560, 70, 160, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2a4a6a'
  ctx.beginPath()
  ctx.moveTo(400, 700)
  ctx.lineTo(360, 430)
  ctx.lineTo(480, 430)
  ctx.lineTo(440, 700)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#c4a050'
  ctx.beginPath()
  ctx.ellipse(560, 620, 90, 70, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#3a3228'
  ctx.lineWidth = 4
  ctx.strokeRect(80, 80, 608, 840)
  ctx.fillStyle = 'rgba(50, 40, 30, 0.4)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('natureza morta  —  2º B', 96, 980)
  return textureFrom(canvas)
}

function artDrawingHall() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#e8e0d4')
  ctx.fillStyle = '#1a222c'
  ctx.fillRect(0, 0, 768, 420)
  ctx.fillStyle = '#2a241c'
  ctx.beginPath()
  ctx.moveTo(0, 1024)
  ctx.lineTo(280, 480)
  ctx.lineTo(488, 480)
  ctx.lineTo(768, 1024)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#3a342c'
  ctx.fillRect(280, 180, 208, 300)
  ctx.fillStyle = '#0e1218'
  ctx.fillRect(330, 240, 108, 240)
  ctx.fillStyle = '#4a6078'
  ctx.fillRect(120, 300, 70, 110)
  ctx.fillRect(560, 300, 70, 110)
  ctx.fillStyle = 'rgba(50, 40, 30, 0.45)'
  ctx.font = `24px ${HAND}`
  ctx.fillText('corredor  —  sem ninguém', 88, 980)
  return textureFrom(canvas)
}

function artDrawingTree() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#d8dce4')
  ctx.fillStyle = '#0c1420'
  ctx.fillRect(0, 0, 768, 640)
  ctx.fillStyle = '#eef4fb'
  ctx.beginPath()
  ctx.arc(560, 180, 54, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a2418'
  ctx.fillRect(0, 620, 768, 404)
  ctx.fillStyle = '#2a2018'
  ctx.fillRect(348, 480, 36, 280)
  ctx.beginPath()
  ctx.arc(366, 420, 160, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a1814'
  ctx.beginPath()
  ctx.arc(280, 380, 90, 0, Math.PI * 2)
  ctx.arc(450, 360, 110, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(50, 40, 30, 0.4)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('à noite', 96, 980)
  return textureFrom(canvas)
}

function artDrawingFaces() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#f0e4d0')
  const heads: Array<[number, number, number]> = [
    [220, 280, 90],
    [520, 300, 80],
    [370, 620, 110],
  ]
  for (const [x, y, r] of heads) {
    ctx.strokeStyle = '#2c241c'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x - r * 0.28, y - r * 0.12, 8, 0, Math.PI * 2)
    ctx.arc(x + r * 0.28, y - r * 0.12, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#2c241c'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x - r * 0.22, y + r * 0.28)
    ctx.quadraticCurveTo(x, y + r * 0.48, x + r * 0.22, y + r * 0.28)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(90, 40, 40, 0.55)'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(x - r * 0.7, y - r * 0.2)
    ctx.lineTo(x + r * 0.7, y + r * 0.35)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(50, 40, 30, 0.4)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('retratos  —  não deu', 96, 980)
  return textureFrom(canvas)
}

function artDrawingShapes() {
  const { canvas, ctx } = makeCanvas(768, 1024)
  artPaper(ctx, 768, 1024, '#efe8dc')
  const blocks: Array<[number, number, number, number, string]> = [
    [90, 120, 220, 280, '#6a2424'],
    [340, 90, 180, 180, '#2a4a6a'],
    [540, 160, 140, 240, '#c4a050'],
    [90, 440, 160, 160, '#3c6a48'],
    [280, 420, 300, 140, '#4a3c70'],
    [160, 640, 420, 200, '#8a5a3a'],
  ]
  for (const [x, y, w, h, color] of blocks) {
    ctx.fillStyle = color
    ctx.globalAlpha = 0.82
    ctx.fillRect(x, y, w, h)
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(50, 40, 30, 0.4)'
  ctx.font = `22px ${HAND}`
  ctx.fillText('composição  —  cor', 96, 980)
  return textureFrom(canvas)
}

export function getArtDrawingTexture(id: ArtDrawingId) {
  const key = `art-${id}`
  const cached = cache.get(key)
  if (cached) return cached
  const texture =
    id === 'window'
      ? artDrawingWindow()
      : id === 'vases'
        ? artDrawingVases()
        : id === 'hall'
          ? artDrawingHall()
          : id === 'tree'
            ? artDrawingTree()
            : id === 'faces'
              ? artDrawingFaces()
              : artDrawingShapes()
  cache.set(key, texture)
  return texture
}

const cache = new Map<string, THREE.CanvasTexture>()

function pixoTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  rot: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.font = `bold ${size}px ${SANS}`
  ctx.strokeStyle = 'rgba(8, 8, 8, 0.55)'
  ctx.lineWidth = size * 0.12
  ctx.strokeText(text, 0, 0)
  ctx.fillStyle = color
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

function pixoFloorTexture() {
  const { canvas, ctx } = makeCanvas(1024, 1024)
  ctx.clearRect(0, 0, 1024, 1024)
  ctx.globalAlpha = 0.82
  pixoTag(ctx, 'FM', 90, 220, 92, '#d8d8d8', -0.18)
  pixoTag(ctx, '2B', 640, 180, 70, '#c43c3c', 0.12)
  pixoTag(ctx, 'XIII', 160, 740, 58, '#e8e0d4', 0.18)
  pixoTag(ctx, 'SK', 780, 640, 96, '#9aa8b8', -0.08)
  ctx.strokeStyle = '#d0d4da'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(120, 420)
  ctx.quadraticCurveTo(280, 360, 400, 510)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(520, 780)
  ctx.lineTo(700, 860)
  ctx.lineTo(670, 790)
  ctx.stroke()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#1a1a1a'
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect(40 + Math.random() * 940, 40 + Math.random() * 940, 3, 10 + Math.random() * 22)
  }
  const texture = textureFrom(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function getPixoFloorTexture() {
  const cached = cache.get('pixo-floor')
  if (cached) return cached
  const texture = pixoFloorTexture()
  cache.set('pixo-floor', texture)
  return texture
}

export function getHangmanChalkTexture(word: 'AMIZADE' | 'FRIENDS' | null) {
  const key = `hangman-chalk-${word ?? 'blank'}`
  const cached = cache.get(key)
  if (cached) return cached
  const { canvas, ctx } = makeCanvas(1024, 160)
  ctx.clearRect(0, 0, 1024, 160)
  ctx.fillStyle = 'rgba(18, 26, 20, 0.55)'
  ctx.fillRect(24, 28, 976, 108)
  ctx.fillStyle = 'rgba(236, 232, 220, 0.92)'
  ctx.font = `58px ${HAND}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const letters = word ? word.split('') : ['_', '_', 'I', '_', '_', 'D', '_']
  ctx.fillText(letters.join('   '), 512, 84)
  const texture = textureFrom(canvas)
  cache.set(key, texture)
  return texture
}

export function getWrittenTexture(
  kind: 'board' | 'bloco' | 'chao' | 'prontuario' | 'mural' | 'aviso' | 'ronda' | 'teachers-board' | 'saida',
) {
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
            : kind === 'aviso'
              ? noticeTexture()
              : kind === 'saida'
                ? exitNoticeTexture()
              : kind === 'ronda'
                ? rondaTexture()
                : kind === 'teachers-board'
                  ? teachersBoardTexture()
                  : muralTexture()
  cache.set(kind, texture)
  return texture
}
