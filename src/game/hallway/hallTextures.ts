import * as THREE from 'three'

function noise(ctx: CanvasRenderingContext2D, amount: number) {
  const { width, height } = ctx.canvas
  const pixels = ctx.getImageData(0, 0, width, height)
  const data = pixels.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount
    data[i] = Math.max(0, Math.min(255, data[i] + n))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
  }
  ctx.putImageData(pixels, 0, 0)
}

export function hallwayFloorTextures() {
  const color = document.createElement('canvas')
  color.width = 512
  color.height = 512
  const ctx = color.getContext('2d')
  const rough = document.createElement('canvas')
  rough.width = 512
  rough.height = 512
  const rtx = rough.getContext('2d')
  if (!ctx || !rtx) return { map: null, roughnessMap: null }

  ctx.fillStyle = '#1c1814'
  ctx.fillRect(0, 0, 512, 512)
  rtx.fillStyle = '#d0d0d0'
  rtx.fillRect(0, 0, 512, 512)

  const cols = 4
  const rows = 4
  const grout = 8
  const tw = (512 - grout * (cols + 1)) / cols
  const th = (512 - grout * (rows + 1)) / rows
  const tones = ['#6a5c4e', '#5e5246', '#746557', '#64584c', '#6e6052']

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const px = grout + x * (tw + grout)
      const py = grout + y * (th + grout)
      ctx.fillStyle = tones[(x + y * 3) % tones.length]
      ctx.fillRect(px, py, tw, th)
      const shine = ctx.createLinearGradient(px, py, px + tw, py + th)
      shine.addColorStop(0, 'rgba(255,255,255,0.08)')
      shine.addColorStop(0.45, 'rgba(255,255,255,0)')
      shine.addColorStop(1, 'rgba(0,0,0,0.08)')
      ctx.fillStyle = shine
      ctx.fillRect(px, py, tw, th)
      rtx.fillStyle = '#6e6e6e'
      rtx.fillRect(px, py, tw, th)
    }
  }

  ctx.strokeStyle = '#14110e'
  ctx.lineWidth = grout
  rtx.strokeStyle = '#efefef'
  rtx.lineWidth = grout
  for (let i = 0; i <= cols; i += 1) {
    const x = grout / 2 + i * (tw + grout)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 512)
    ctx.stroke()
    rtx.beginPath()
    rtx.moveTo(x, 0)
    rtx.lineTo(x, 512)
    rtx.stroke()
  }
  for (let i = 0; i <= rows; i += 1) {
    const y = grout / 2 + i * (th + grout)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()
    rtx.beginPath()
    rtx.moveTo(0, y)
    rtx.lineTo(512, y)
    rtx.stroke()
  }

  noise(ctx, 14)
  noise(rtx, 22)

  const map = new THREE.CanvasTexture(color)
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(3, 14)
  map.anisotropy = 8
  map.colorSpace = THREE.SRGBColorSpace

  const roughnessMap = new THREE.CanvasTexture(rough)
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.repeat.set(3, 14)
  roughnessMap.anisotropy = 8

  return { map, roughnessMap }
}

export function woodDoorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#7a6454'
  ctx.fillRect(0, 0, 256, 512)
  for (let x = 0; x < 256; x += 6) {
    ctx.strokeStyle = `rgba(42, 30, 22, ${0.12 + Math.random() * 0.18})`
    ctx.lineWidth = 2 + Math.random() * 2.4
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 5, 180, x - 7, 320, x + 3, 512)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255, 230, 200, 0.06)'
  ctx.fillRect(0, 0, 256, 80)
  ctx.fillStyle = 'rgba(20, 12, 8, 0.12)'
  ctx.fillRect(0, 430, 256, 82)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
