import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { computeInspectShot } from './computeInspectShot'
import { getExamineRecord, getExamineRecords, getNearbyExamineIds } from './examineRegistry'
import { setExamineHighlight } from './highlight'
import { pickExamineId } from './pickExamine'
import { useExamineStore } from './useExamineStore'
import { examineHoldSeconds } from '../data/examineContent'
import { duckMusic, holdAmbient, playSfx, SFX } from '../audio/mixer'
import { playerMotion } from '../player/playerMotion'
import { isPhoneOpen, usePhoneStore } from '../phone/phoneStore'
import { isHallLockerId } from '../hallway/lockers'
import { useHallwayStore } from '../hallway/useHallwayStore'
import { LAB_ON_PC_ID, useComputerStore } from '../computer/computerStore'
import { lookInput } from '../input/lookInput'
import { readTouchUi } from '../input/useTouchUi'
import { requestMapTravel } from '../maps/mapTravel'
import { interactGate } from '../input/actions'
import { LOBBY_DOORS } from '../rooms/lobbyLayout'
import { useGameStore } from '../state/useGameStore'

const lightPos = new THREE.Vector3()
const box = new THREE.Box3()

function isHudInspect(id: string) {
  return (
    isHallLockerId(id) ||
    id === 'teachers-cabinet' ||
    id === 'mochila-fechada' ||
    id === 'mochila-aberta' ||
    id === 'zel-locker' ||
    id === 'zel-skeleton'
  )
}

function beginInspect(
  id: string,
  camera: THREE.Camera,
  inspectId: { current: string | null },
  holdLeft: { current: number },
) {
  const record = getExamineRecord(id)
  if (!record) return
  useExamineStore.getState().inspect(id)
  inspectId.current = id
  holdLeft.current = examineHoldSeconds(id)
  if (isHudInspect(id)) return

  const shot = computeInspectShot(record, camera)
  const store = useGameStore.getState()
  store.setCameraMode('examine')
  store.setCameraOverride(shot)
  const holdMs = holdLeft.current > 0 ? holdLeft.current * 1000 + 280 : 4800
  holdAmbient(holdMs)
  duckMusic(0.55, 1200)
}

function syncHighlights(hoveredId: string | null, examiningId: string | null, nearbyIds: string[]) {
  const nearby = new Set(nearbyIds)
  for (const record of getExamineRecords()) {
    if (examiningId === record.id) setExamineHighlight(record.object, 'focus')
    else if (hoveredId === record.id) setExamineHighlight(record.object, 'hover')
    else if (nearby.has(record.id)) setExamineHighlight(record.object, 'near')
    else setExamineHighlight(record.object, 'off')
  }
}

export function ExamineDirector() {
  const lightRef = useRef<THREE.PointLight>(null)
  const lightStrength = useRef(0)
  const inspectId = useRef<string | null>(null)
  const holdLeft = useRef(-1)
  const pointer = useRef({ x: 0, y: 0, inside: false })
  const { camera, gl } = useThree()

  useEffect(() => {
    const el = gl.domElement

    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
      pointer.current.inside = true
    }

    const onLeave = () => {
      pointer.current.inside = false
    }

    const pending = { id: null as string | null, x: 0, y: 0 }

    const tryInspect = (clientX: number, clientY: number) => {
      const game = useGameStore.getState()
      if (!game.prologueDone || game.interactionState !== 'gameplay') return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return

      const hall = useHallwayStore.getState()
      const examine = useExamineStore.getState()
      const nearby = getNearbyExamineIds(playerMotion.x, playerMotion.z)
      examine.setNearby(nearby)
      const id =
        pickExamineId(clientX, clientY, camera, el, nearby) ??
        (examine.hoveredId && nearby.includes(examine.hoveredId) ? examine.hoveredId : null)
      if (!id) return

      if (id === 'hall-door-12' && hall.labDoor === 'ajar') {
        if (hall.beginLabOpen()) playSfx(SFX.doorOpen, 0.62)
        return
      }

      if (id === LOBBY_DOORS.bathroom.examineId && LOBBY_DOORS.bathroom.open && LOBBY_DOORS.bathroom.dest) {
        playSfx(SFX.doorOpen, 0.45)
        hall.setPrompt(null)
        interactGate.cool = 0.8
        requestMapTravel(LOBBY_DOORS.bathroom.dest, 'from-patio')
        return
      }

      if (id === LAB_ON_PC_ID) {
        playSfx(SFX.clickItem, 0.45)
        useComputerStore.getState().open()
        return
      }

      if (game.currentRoom === 'hallway' && !hall.seenMysteriousGirl) return

      playSfx(SFX.clickItem, 0.45)
      beginInspect(id, camera, inspectId, holdLeft)
    }

    const onPointer = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType !== 'touch') return
      const game = useGameStore.getState()
      if (!game.prologueDone || game.interactionState !== 'gameplay') return
      if (isPhoneOpen(usePhoneStore.getState().ui)) return
      const touchLook = readTouchUi() && event.pointerType !== 'mouse'
      if (touchLook) {
        pending.id = 'wait'
        pending.x = event.clientX
        pending.y = event.clientY
        return
      }
      event.preventDefault()
      tryInspect(event.clientX, event.clientY)
    }

    const onUp = (event: PointerEvent) => {
      if (pending.id === null) return
      pending.id = null
      if (lookInput.consumed) return
      const game = useGameStore.getState()
      if (game.interactionState !== 'gameplay') return
      event.preventDefault()
      tryInspect(event.clientX, event.clientY)
    }

    const onContext = (event: MouseEvent) => {
      if (useGameStore.getState().interactionState !== 'examining-object') return
      event.preventDefault()
      useExamineStore.getState().stopInspect()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointerdown', onPointer)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('contextmenu', onContext)
    el.style.cursor = 'default'
    return () => {
      el.style.cursor = 'default'
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onPointer)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('contextmenu', onContext)
    }
  }, [camera, gl])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.code !== 'Escape') return
      if (useGameStore.getState().interactionState !== 'examining-object') return
      event.preventDefault()
      event.stopImmediatePropagation()
      useExamineStore.getState().stopInspect()
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  useFrame((_, delta) => {
    const game = useGameStore.getState()
    const examine = useExamineStore.getState()
    const hall = useHallwayStore.getState()
    const dt = Math.min(delta, 0.05)
    const inspecting = game.interactionState === 'examining-object'
    const hallLocked = game.currentRoom === 'hallway' && !hall.seenMysteriousGirl
    const canPick =
      game.prologueDone &&
      game.interactionState === 'gameplay' &&
      !isPhoneOpen(usePhoneStore.getState().ui)

    const allNearby = canPick ? getNearbyExamineIds(playerMotion.x, playerMotion.z) : inspecting ? examine.nearbyIds : []
    const nearby = hallLocked && canPick ? allNearby.filter((id) => id === 'hall-door-12') : allNearby
    if (canPick || !inspecting) examine.setNearby(nearby)

    const hovered =
      canPick && pointer.current.inside
        ? pickExamineId(pointer.current.x, pointer.current.y, camera, gl.domElement, nearby)
        : null
    examine.setHovered(hovered)

    gl.domElement.style.cursor = hovered ? 'pointer' : 'default'

    syncHighlights(hovered, examine.examiningId, canPick ? nearby : [])

    if (inspecting && examine.examiningId) {
      const hudInspect = isHudInspect(examine.examiningId)
      if (inspectId.current !== examine.examiningId) {
        beginInspect(examine.examiningId, camera, inspectId, holdLeft)
      }
      if (!hudInspect) {
        const record = getExamineRecord(examine.examiningId)
        if (record) {
          box.setFromObject(record.object)
          box.getCenter(lightPos)
          lightPos.lerp(camera.position, 0.22)
          lightPos.y += 0.18
        }
        if (holdLeft.current > 0) {
          holdLeft.current -= dt
          if (holdLeft.current <= 0) useExamineStore.getState().stopInspect()
        }
      }
    } else if (inspectId.current) {
      inspectId.current = null
      holdLeft.current = -1
      const store = useGameStore.getState()
      store.setCameraMode('explore')
      store.setCameraOverride(null)
    }

    const wantLight = inspecting && examine.examiningId && !isHudInspect(examine.examiningId) ? 1 : 0
    lightStrength.current = THREE.MathUtils.damp(lightStrength.current, wantLight, 5.5, dt)
    const lamp = lightRef.current
    if (lamp) {
      lamp.position.copy(lightPos)
      lamp.intensity = lightStrength.current * 0.55
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#efe4d2"
      intensity={0}
      distance={2.15}
      decay={2}
      castShadow={false}
    />
  )
}
