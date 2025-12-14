"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function LinearDashboardProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([])
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProperties() {
            try {
                const res = await fetch("/api/properties")
                const data = await res.json()
                if (data.properties && data.properties.length > 0) {
                    setProperties(data.properties)
                    // Restore selection from local storage or default to first
                    const saved = localStorage.getItem("linear_selected_property")
                    if (saved && data.properties.find((p: Property) => p.propertyId === saved)) {
                        setSelectedProperty(saved)
                    } else {
                        setSelectedProperty(data.properties[0].propertyId)
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

    // Added useEffect to redirect if no property is found after loading
    useEffect(() => {
        if (!loading && !selectedProperty) {
            // Check if user has ANY properties saved
            // Ideally we check this via API, but for now we can assume if selectedProperty is null after load,
            // they might need to set one up.
            // A more robust check would count properties. 
            // Let's rely on the fact that we try to load the "active" property.

            // Redirect to onboarding if strictly no property is set
            router.push("/onboarding")
        }
    }, [loading, selectedProperty, router])

    return (
        <LinearDashboardContext.Provider value={{ selectedProperty, setSelectedProperty, timeRange, setTimeRange, loading }}>
            {children}
        </LinearDashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(LinearDashboardContext) // Renamed context
    if (context === undefined) {
        throw new Error("useDashboard must be used within a LinearDashboardProvider")
    }
    return context
}
