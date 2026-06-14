# Image Trail

Leaves a beautiful, premium track of images behind the cursor. Powered by GSAP for buttery smooth animations.

## Installation

```bash
npx componentry@latest add image-trail
```

**Dependencies:** gsap clsx tailwind-merge

## Source Code

```tsx
"use client"

import React, { useEffect, useRef } from "react"
import { Expo, gsap, Power1, Quint } from "gsap"

interface ImageTrailProps {
    images: string[]
    imageWidth?: number
    imageHeight?: number
    threshold?: number
    duration?: number
}

export function ImageTrail({
    images = [],
    imageWidth = 200,
    imageHeight = 200,
    threshold = 50,
    duration = 1.6,
}: ImageTrailProps) {
    const contentRef = useRef<HTMLDivElement | null>(null)
    const imagesRef = useRef<HTMLImageElement[]>([])
    const mousePos = useRef({ x: 0, y: 0 })
    const cacheMousePos = useRef({ x: 0, y: 0 })
    const lastMousePos = useRef({ x: 0, y: 0 })
    const zIndexVal = useRef(1)
    const imgPosition = useRef(0)
    const parentSize = useRef({ width: 0, height: 0 })

    useEffect(() => {
        if (contentRef.current) {
            imagesRef.current = Array.from(contentRef.current.querySelectorAll("img"))
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = contentRef.current?.getBoundingClientRect()
            if (rect) {
                mousePos.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                }
            }
        }

        calcParentSize()
        if (imagesRef.current.length === 0) {
            return
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("resize", calcParentSize)

        requestAnimationFrame(renderImages)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", calcParentSize)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const calcParentSize = () => {
        const rect = contentRef.current?.getBoundingClientRect()
        if (rect) {
            parentSize.current = { width: rect.width, height: rect.height }
        }
    }

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

    const getMouseDistance = () => {
        const dx = mousePos.current.x - lastMousePos.current.x
        const dy = mousePos.current.y - lastMousePos.current.y
        return Math.hypot(dx, dy)
    }

    const renderImages = () => {
        const distance = getMouseDistance()

        cacheMousePos.current.x = lerp(
            cacheMousePos.current.x,
            mousePos.current.x,
            0.1
        )
        cacheMousePos.current.y = lerp(
            cacheMousePos.current.y,
            mousePos.current.y,
            0.1
        )

        if (distance > threshold) {
            showNextImage()
            zIndexVal.current += 1
            imgPosition.current = (imgPosition.current + 1) % imagesRef.current.length
            lastMousePos.current = { ...mousePos.current }
        }

        requestAnimationFrame(renderImages)
    }

    const showNextImage = () => {
        const img = imagesRef.current[imgPosition.current]
        if (!img) return

        const rect = img.getBoundingClientRect()
        gsap.killTweensOf(img)

        gsap
            .timeline()
            .set(img, {
                startAt: { opacity: 0 },
                opacity: 1,
                zIndex: zIndexVal.current,
                x: cacheMousePos.current.x - rect.width / 2,
                y: cacheMousePos.current.y - rect.height / 2,
            })
            .to(img, {
                duration: duration,
                ease: Expo.easeOut,
                x: mousePos.current.x - rect.width / 2,
                y: mousePos.current.y - rect.height / 2,
            })
            .to(
                img,
                {
                    duration: 1,
                    ease: Power1.easeOut,
                    opacity: 0,
                },
                duration - 1 > 0 ? duration - 1 : 0.4
            )
            .to(
                img,
                {
                    duration: 1,
                    ease: Quint.easeInOut,
                    y: `+=${parentSize.current.height + rect.height / 2}`,
                },
                duration - 1 > 0 ? duration - 1 : 0.4
            )
    }

    return (
        <div
            style={
                {
                    "--image-width": `${imageWidth}px`,
                    "--image-height": `${imageHeight}px`,
                } as React.CSSProperties
            }
            className="relative isolate z-0 flex h-full w-full items-center justify-center overflow-hidden"
            ref={contentRef}
        >
            {images.map((url, index) => (
                <img
                    key={index}
                    className="pointer-events-none absolute top-0 left-0 h-[var(--image-height)] w-[var(--image-width)] object-cover opacity-0 will-change-transform"
                    src={url}
                    alt={`trail element ${index + 1}`}
                />
            ))}
        </div>
    )
}

```

## Usage

```tsx
import { ImageTrail } from "@/components/ui/image-trail"

const myImages = [
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg",
]

export function Hero() {
  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-black">
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">DISCOVERY</h1>
      </div>
      <ImageTrail 
        images={myImages}
        imageWidth={250}
        imageHeight={320}
        threshold={50}
        duration={1.6}
      />
    </div>
  )
}
```

## API Reference (Props)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `string[]` | `[]` | Array of image URLs to cycle through. |
| `imageWidth` | `number` | `200` | The width of the individual trail images (px). |
| `imageHeight` | `number` | `200` | The height of the individual trail images (px). |
| `threshold` | `number` | `50` | Distance in pixels the cursor must move before a new image is added. |
| `duration` | `number` | `1.6` | Total duration in seconds for the entire trail animation timeline. |

---

_Component from [Componentry](https://componentry.fun/docs/components/image-trail)_