import { useRef, useCallback } from 'react'

const BEEP_COUNT = 5
const BEEP_DURATION = 0.15
const BEEP_GAP = 0.28
const BEEP_FREQUENCY = 880
const BEEP_GAIN = 0.35

function scheduleBeeps(ctx: AudioContext): void {
  for (let i = 0; i < BEEP_COUNT; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startTime = ctx.currentTime + i * BEEP_GAP

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = BEEP_FREQUENCY
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(BEEP_GAIN, startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + BEEP_DURATION)
    osc.start(startTime)
    osc.stop(startTime + BEEP_DURATION)
  }
}

export function useAlarm() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getContext = useCallback((): AudioContext => {
    audioCtxRef.current ??= new AudioContext()
    return audioCtxRef.current
  }, [])

  // Call during a user gesture (e.g. clicking Start) to ensure AudioContext is active
  const init = useCallback(() => {
    const ctx = getContext()
    if (ctx.state === 'suspended') ctx.resume()
  }, [getContext])

  const play = useCallback(() => {
    const ctx = getContext()
    const run = () => scheduleBeeps(ctx)
    if (ctx.state === 'suspended') {
      ctx.resume().then(run)
    } else {
      run()
    }
  }, [getContext])

  return { play, init }
}
