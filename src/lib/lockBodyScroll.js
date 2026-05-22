let lockCount = 0
let restoreState = null

export const lockBodyScroll = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}

  lockCount += 1
  if (lockCount > 1) {
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0 && restoreState) {
        const { body, scrollY } = restoreState
        body.style.overflow = restoreState.overflow
        body.style.position = restoreState.position
        body.style.top = restoreState.top
        body.style.width = restoreState.width
        body.style.paddingRight = restoreState.paddingRight
        restoreState = null
        window.scrollTo(0, scrollY)
      }
    }
  }

  const body = document.body
  const html = document.documentElement
  const scrollY = window.scrollY || window.pageYOffset || 0
  restoreState = {
    body,
    scrollY,
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  }

  const scrollBarWidth = Math.max(0, window.innerWidth - html.clientWidth)
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.width = '100%'
  if (scrollBarWidth) body.style.paddingRight = `${scrollBarWidth}px`

  return () => {
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount !== 0 || !restoreState) return
    const state = restoreState
    restoreState = null
    state.body.style.overflow = state.overflow
    state.body.style.position = state.position
    state.body.style.top = state.top
    state.body.style.width = state.width
    state.body.style.paddingRight = state.paddingRight
    window.scrollTo(0, state.scrollY)
  }
}

