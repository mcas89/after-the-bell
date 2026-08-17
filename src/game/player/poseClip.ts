import { VRMHumanBoneName, type VRMPose } from '@pixiv/three-vrm'
import * as THREE from 'three'

export type EulerPose = { x: number; y: number; z: number }

export type PoseFrameJson = {
  name: string
  duration: number
  pose: Record<string, EulerPose>
}

export type PoseClipJson = {
  name: string
  frames: PoseFrameJson[]
}

type BoneKeys = { times: number[]; poses: EulerPose[] }

export type CompiledClip = {
  duration: number
  bones: Map<string, BoneKeys>
  hips: BoneKeys | null
}

const BONE_NAMES = new Set<string>(Object.values(VRMHumanBoneName))
const _euler = new THREE.Euler()
const _qA = new THREE.Quaternion()
const _qB = new THREE.Quaternion()
const _qIdle = new THREE.Quaternion()
const _qWalk = new THREE.Quaternion()
const _qBlend = new THREE.Quaternion()
const _qNudge = new THREE.Quaternion()
const _idle = { x: 0, y: 0, z: 0 }
const _walk = { x: 0, y: 0, z: 0 }
const _pose: VRMPose = {}

function wrapTime(time: number, duration: number) {
  if (duration <= 0) return 0
  return ((time % duration) + duration) % duration
}

function easeAlpha(a: number) {
  const t = THREE.MathUtils.clamp(a, 0, 1)
  return t * t * (3 - 2 * t)
}

function sampleQuat(keys: BoneKeys, time: number, duration: number, out: THREE.Quaternion) {
  const { times, poses } = keys
  if (poses.length === 1) {
    _euler.set(poses[0].x, poses[0].y, poses[0].z, 'XYZ')
    out.setFromEuler(_euler)
    return
  }

  const t = wrapTime(time, duration)
  if (t < times[0] || t >= times[times.length - 1]) {
    const a0 = poses[poses.length - 1]
    const a1 = poses[0]
    const t0 = times[times.length - 1]
    const t1 = times[0] + duration
    const tw = t < times[0] ? t + duration : t
    const a = easeAlpha((tw - t0) / Math.max(0.0001, t1 - t0))
    _euler.set(a0.x, a0.y, a0.z, 'XYZ')
    _qA.setFromEuler(_euler)
    _euler.set(a1.x, a1.y, a1.z, 'XYZ')
    _qB.setFromEuler(_euler)
    out.slerpQuaternions(_qA, _qB, a)
    return
  }

  let i = 0
  for (let k = 0; k < times.length - 1; k += 1) {
    if (t >= times[k] && t < times[k + 1]) {
      i = k
      break
    }
  }

  const iNext = i + 1
  const a = easeAlpha((t - times[i]) / Math.max(0.0001, times[iNext] - times[i]))
  _euler.set(poses[i].x, poses[i].y, poses[i].z, 'XYZ')
  _qA.setFromEuler(_euler)
  _euler.set(poses[iNext].x, poses[iNext].y, poses[iNext].z, 'XYZ')
  _qB.setFromEuler(_euler)
  out.slerpQuaternions(_qA, _qB, a)
}

function sampleVec(keys: BoneKeys, time: number, duration: number, out: EulerPose) {
  const { times, poses } = keys
  if (poses.length === 1) {
    out.x = poses[0].x
    out.y = poses[0].y
    out.z = poses[0].z
    return
  }

  const t = wrapTime(time, duration)
  let i = times.length - 1
  for (let k = 0; k < times.length - 1; k += 1) {
    if (t >= times[k] && t < times[k + 1]) {
      i = k
      break
    }
  }

  const iNext = (i + 1) % poses.length
  const t0 = times[i]
  const t1 = iNext === 0 ? duration : times[iNext]
  const a = easeAlpha((t - t0) / Math.max(0.0001, t1 - t0))
  const a0 = poses[i]
  const a1 = poses[iNext]
  out.x = a0.x + (a1.x - a0.x) * a
  out.y = a0.y + (a1.y - a0.y) * a
  out.z = a0.z + (a1.z - a0.z) * a
}

export function compileClip(json: PoseClipJson): CompiledClip {
  const bones = new Map<string, BoneKeys>()
  const last = new Map<string, EulerPose>()
  let hips: BoneKeys | null = null
  let time = 0

  for (const frame of json.frames) {
    const pose = frame.pose
    for (const [name, value] of Object.entries(pose)) {
      if (name === 'hipsPosition') {
        if (!hips) hips = { times: [], poses: [] }
        hips.times.push(time)
        hips.poses.push({ ...value })
        continue
      }
      if (!BONE_NAMES.has(name)) continue
      last.set(name, { ...value })
    }

    for (const [name, value] of last.entries()) {
      let track = bones.get(name)
      if (!track) {
        track = { times: [], poses: [] }
        bones.set(name, track)
      }
      track.times.push(time)
      track.poses.push({ ...value })
    }

    time += Math.max(0.001, frame.duration)
  }

  for (const track of bones.values()) {
    if (track.times[0] > 0) {
      track.times.unshift(0)
      track.poses.unshift({ ...track.poses[0] })
    }
  }
  if (hips && hips.times[0] > 0) {
    hips.times.unshift(0)
    hips.poses.unshift({ ...hips.poses[0] })
  }

  return { duration: time, bones, hips }
}

export function sampleCompiledRotation(
  clip: CompiledClip,
  bone: string,
  time: number,
  out: THREE.Quaternion,
) {
  const keys = clip.bones.get(bone)
  if (!keys) {
    out.identity()
    return false
  }
  sampleQuat(keys, time, clip.duration, out)
  return true
}

export function sampleCompiledHips(clip: CompiledClip, time: number, out: EulerPose) {
  if (!clip.hips) return false
  sampleVec(clip.hips, time, clip.duration, out)
  return true
}

export function sampleBlendedPose(
  idle: CompiledClip,
  walk: CompiledClip,
  idleTime: number,
  walkTime: number,
  walkWeight: number,
): VRMPose {
  for (const key of Object.keys(_pose)) {
    delete _pose[key as keyof VRMPose]
  }

  const names = new Set([...idle.bones.keys(), ...walk.bones.keys()])
  const w = easeAlpha(THREE.MathUtils.clamp(walkWeight, 0, 1))

  for (const name of names) {
    const idleTrack = idle.bones.get(name)
    const walkTrack = walk.bones.get(name)
    if (idleTrack) sampleQuat(idleTrack, idleTime, idle.duration, _qIdle)
    else _qIdle.identity()
    if (walkTrack) sampleQuat(walkTrack, walkTime, walk.duration, _qWalk)
    else _qWalk.identity()
    _qBlend.slerpQuaternions(_qIdle, _qWalk, w)
    _pose[name as VRMHumanBoneName] = {
      rotation: [_qBlend.x, _qBlend.y, _qBlend.z, _qBlend.w],
    }
  }

  if (idle.hips || walk.hips) {
    if (idle.hips) sampleVec(idle.hips, idleTime, idle.duration, _idle)
    else {
      _idle.x = 0
      _idle.y = 0
      _idle.z = 0
    }
    if (walk.hips) sampleVec(walk.hips, walkTime, walk.duration, _walk)
    else {
      _walk.x = 0
      _walk.y = 0
      _walk.z = 0
    }
    const px = _idle.x + (_walk.x - _idle.x) * w
    const py = _idle.y + (_walk.y - _idle.y) * w * 1.45
    const pz = _idle.z + (_walk.z - _idle.z) * w
    const hips = _pose.hips ?? { rotation: [0, 0, 0, 1] }
    hips.position = [px, py, pz]
    _pose.hips = hips
  }

  return _pose
}

export function nudgeBone(pose: VRMPose, name: VRMHumanBoneName, x: number, y: number, z: number) {
  const bone = pose[name] ?? { rotation: [0, 0, 0, 1] }
  const rot = bone.rotation ?? [0, 0, 0, 1]
  _qBlend.set(rot[0], rot[1], rot[2], rot[3])
  _euler.set(x, y, z, 'XYZ')
  _qNudge.setFromEuler(_euler)
  _qBlend.multiply(_qNudge)
  bone.rotation = [_qBlend.x, _qBlend.y, _qBlend.z, _qBlend.w]
  pose[name] = bone
}
