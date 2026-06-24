import { useEffect, useRef, useState } from 'react'

type UseInViewOptions = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export const useInView = <T extends Element>(options: UseInViewOptions = {}) => {
  const { root = null, rootMargin = '0px', threshold = 0, once = true } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [root, rootMargin, threshold, once])

  return { ref, inView }
}
