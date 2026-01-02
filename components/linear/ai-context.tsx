"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useDashboard } from "@/components/linear/dashboard-context"

interface InsightItem {
    type: string
    title?: string
    description: string
    content?: string
}

interface AIContextType {
    insights: InsightItem[]
    loading: boolean
    error: string | null
    refresh: () => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
    const { selectedProperty, dateRange } = useDashboard()
    const [insights, setInsights] = useState<InsightItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchInsights = async () => {
        // Don't fetch if missing required params
        if (!selectedProperty || !dateRange?.from || !dateRange?.to) return

        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: selectedProperty,
                    startDate: dateRange.from.toISOString().split('T')[0],
                    endDate: dateRange.to.toISOString().split('T')[0]
                }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data.insights) {
                    setInsights(data.insights)
                }
            } else if (res.status === 401) {
                setError("API Key Missing")
            } else {
                // Fallback for 429 handled by the API now returning valid JSON with error message, 
                // but if it completely fails (500), we land here or catch block.
                setError("Unable to load insights")
            }
        } catch (err) {
            console.error(err)
            setError("Network Error")
        } finally {
            setLoading(false)
        }
    }

    // Effect triggers only when dependencies change
    useEffect(() => {
        fetchInsights()
    }, [selectedProperty, dateRange])

    return (
        <AIContext.Provider value={{ insights, loading, error, refresh: fetchInsights }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    const context = useContext(AIContext)
    if (context === undefined) {
        throw new Error("useAI must be used within an AIProvider")
    }
    return context
}
