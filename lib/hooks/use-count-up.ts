import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let t0: number | null = null
    const tick = (now: number) => {
      if (!t0) t0 = now
      const p = Math.min((now - t0) / duration, 1)
      const e = 1 - (1 - p) ** 3
      setVal(Math.round(e * target))
      if (p < 1) requestAnimationFrame(tick)
      else setVal(target)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return val
}
