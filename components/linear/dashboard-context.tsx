"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Property {
    propertyId: string
    displayName: string
    [key: string]: any
}

interface DashboardContextType {
    properties: Property[]
    selectedProperty: string
    setSelectedProperty: (id: string) => void
    loading: boolean
}

const LinearDashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function LinearDashboardProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([])
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchProperties() {
            try {
                const res = await fetch("/api/analytics/properties")

                if (res.ok) {
                    const data = await res.json()
                    if (data.properties && data.properties.length > 0) {
                        setProperties(data.properties)
                        // Restore selection from local storage or default to first
                        const saved = localStorage.getItem("linear_selected_property")
                        if (saved && data.properties.find((p: any) => p.id === saved)) {
                            setSelectedProperty(saved)
                        } else {
                            // If user has saved an "activeProperty" in DB, we might want to use that.
                            // For now, defaulting to first valid one is fine.
                            setSelectedProperty(data.properties[0].id)
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch properties", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProperties()
    }, [])

    // Persist selection
    useEffect(() => {
        if (selectedProperty) {
            localStorage.setItem("linear_selected_property", selectedProperty)
        }
    }, [selectedProperty])

    // Redirect if no property found
    useEffect(() => {
        if (!loading && !selectedProperty && properties.length === 0) {
            // Only redirect if we truly have no properties loaded and loading is done.
            // If properties are empty, they probably need onboarding.
            router.push("/onboarding")
        }
    }, [loading, selectedProperty, properties, router])

    return (
        <LinearDashboardContext.Provider value={{ properties, selectedProperty, setSelectedProperty, loading }}>
            {children}
        </LinearDashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(LinearDashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a LinearDashboardProvider")
    }
    return context
}
