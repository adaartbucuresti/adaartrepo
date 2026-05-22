import { useEffect, useRef } from 'react'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function SmoothScroll() {
  const stateRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    raf: 0,
    isRunning: false,
    isSettingUntil: 0,
  })

  useEffect(() => {
    const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const enableSmoothing = false && !prefersReduce

    const root = document.documentElement
    const s = stateRef.current

    const getMaxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight)

    const setProgress = (y) => {
      const max = getMaxScroll()
      const p = max <= 0 ? 0 : clamp(y / max, 0, 1)
      root.style.setProperty('--scroll-progress', String(p))
    }

    const syncFromWindow = () => {
      const y = window.scrollY || 0
      s.current = y
      s.target = y
      setProgress(y)
    }

    const stop = () => {
      if (s.raf) window.cancelAnimationFrame(s.raf)
      s.raf = 0
      s.isRunning = false
    }

    const tick = () => {
      const max = getMaxScroll()
      s.velocity *= 0.88
      if (Math.abs(s.velocity) < 0.02) s.velocity = 0

      s.target = clamp(s.target + s.velocity, 0, max)

      const diff = s.target - s.current
      s.current = s.current + diff * 0.08
      if (Math.abs(diff) < 0.5) s.current = s.target

      s.isSettingUntil = performance.now() + 80
      window.scrollTo(0, s.current)
      setProgress(s.current)

      if (s.velocity === 0 && Math.abs(s.target - s.current) < 0.5) {
        stop()
        return
      }
      s.raf = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (s.isRunning) return
      s.isRunning = true
      s.raf = window.requestAnimationFrame(tick)
    }

    const hasScrollableParent = (node) => {
      let el = node
      while (el && el !== document.body && el !== root) {
        const style = window.getComputedStyle(el)
        const overflowY = style.overflowY
        const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1
        if (canScroll) return true
        el = el.parentElement
      }
      return false
    }

    const onWheel = (e) => {
      if (e.ctrlKey || e.shiftKey) return
      const targetEl = e.target instanceof Element ? e.target : null
      if (targetEl && hasScrollableParent(targetEl)) return
      e.preventDefault()
      const max = getMaxScroll()
      s.velocity = clamp(s.velocity + e.deltaY * 0.9, -120, 120)
      s.target = clamp(s.target + e.deltaY * 1.1, 0, max)
      start()
    }

    const onKeyDown = (e) => {
      const tag = String(e.target?.tagName || '').toLowerCase()
      const editable = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable
      if (editable) return

      const max = getMaxScroll()
      const page = Math.max(240, Math.round(window.innerHeight * 0.9))
      const line = 90

      let delta = 0
      if (e.key === 'ArrowDown') delta = line
      else if (e.key === 'ArrowUp') delta = -line
      else if (e.key === 'PageDown') delta = page
      else if (e.key === 'PageUp') delta = -page
      else if (e.key === ' ') delta = e.shiftKey ? -page : page
      else if (e.key === 'Home') delta = -1e9
      else if (e.key === 'End') delta = 1e9
      else return

      e.preventDefault()
      s.velocity = clamp(s.velocity + delta * 0.25, -220, 220)
      s.target = clamp(s.target + delta, 0, max)
      start()
    }

    const onScroll = () => {
      if (performance.now() < s.isSettingUntil) return
      const y = window.scrollY || 0
      s.current = y
      s.target = y
      s.velocity = 0
      setProgress(y)
    }

    const onResize = () => {
      const max = getMaxScroll()
      s.target = clamp(s.target, 0, max)
      s.current = clamp(s.current, 0, max)
      setProgress(window.scrollY || 0)
    }

    root.style.setProperty('--scroll-progress', '0')
    syncFromWindow()

    if (enableSmoothing) {
      window.addEventListener('wheel', onWheel, { passive: false, capture: true })
      document.addEventListener('wheel', onWheel, { passive: false, capture: true })
      window.addEventListener('keydown', onKeyDown, { passive: false })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      stop()
      if (enableSmoothing) {
        window.removeEventListener('wheel', onWheel, true)
        document.removeEventListener('wheel', onWheel, true)
        window.removeEventListener('keydown', onKeyDown)
      }
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        className="h-full origin-left bg-[#2d4a3e]"
        style={{ transform: 'scaleX(var(--scroll-progress))' }}
      />
    </div>
  )
}
