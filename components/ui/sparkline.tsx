"use client"

import { useMemo } from "react"

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    color?: string
    className?: string
}

export function Sparkline({
    data,
    width = 100,
    height = 40,
    color = "currentColor",
    className
}: SparklineProps) {
    const points = useMemo(() => {
        if (!data || data.length === 0) return ""

        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1

        const stepX = width / (data.length - 1)

        return data.map((val, i) => {
            const x = i * stepX
            const y = height - ((val - min) / range) * height
            return `${x},${y}`
        }).join(" ")
    }, [data, width, height])

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points={points} />
        </svg>
    )
}
