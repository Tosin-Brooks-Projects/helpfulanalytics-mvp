"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"

interface Property {
    id: string
    name: string
    accountId?: string
    [key: string]: any
}

interface Subscription {
    tier: string
    status: string
    trialEndsAt?: string // ISO date string
    [key: string]: any
}

interface DashboardContextType {
    properties: Property[] // Active/Saved properties
    availableProperties: Property[] // All GA4 properties NOT yet saved
    selectedProperty: string
    setSelectedProperty: (id: string) => void
    loading: boolean
    dateRange: DateRange | undefined
    setDateRange: (date: DateRange | undefined) => void
    subscription: Subscription | null
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
}

const LinearDashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function LinearDashboardProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([])
    const [availableProperties, setAvailableProperties] = useState<Property[]>([])
    const [selectedProperty, setSelectedProperty] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    })
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch saved properties (Active)
                const savedPropsRes = await fetch("/api/user/properties")
                let savedProps = []
                if (savedPropsRes.ok) {
                    const savedData = await savedPropsRes.json()
                    savedProps = savedData.properties || []
                    setProperties(savedProps)
                }

                // 2. Fetch all GA4 properties (Available)
                const allPropsRes = await fetch("/api/analytics/properties")
                if (allPropsRes.ok) {
                    const allData = await allPropsRes.json()
                    const allProps = allData.properties || []

                    // Filter out already saved properties
                    // We compare IDs. Note: saved properties have ID like "properties/123", check format.
                    // API returns "properties/..." usually.
                    const savedIds = new Set(savedProps.map((p: any) => p.id))
                    const available = allProps.filter((p: any) => !savedIds.has(p.id))
                    setAvailableProperties(available)

                    // Initial Selection Logic
                    if (savedProps.length > 0) {
                        const saved = localStorage.getItem("linear_selected_property")
                        if (saved && savedProps.find((p: Property) => p.id === saved)) {
                            setSelectedProperty(saved)
                        } else {
                            setSelectedProperty(savedProps[0].id)
                        }
                    } else {
                        // If no saved properties, we might redirect or show empty state
                        // The component using this context handles empty state logic often
                    }
                }

                // 3. Fetch user subscription
                const userRes = await fetch("/api/user/me")
                if (userRes.ok) {
                    const userData = await userRes.json()
                    setSubscription(userData.subscription || null)

                    // Logic to redirect if absolutely no access? 
                    // Maybe we just let them stay on dashboard to add properties.
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    // Persist selection
    useEffect(() => {
        if (selectedProperty) {
            localStorage.setItem("linear_selected_property", selectedProperty)
        }
    }, [selectedProperty])

    return (
        <LinearDashboardContext.Provider value={{
            properties,
            availableProperties,
            selectedProperty,
            setSelectedProperty,
            loading,
            dateRange,
            setDateRange,
            subscription,
            sidebarCollapsed,
            setSidebarCollapsed
        }}>
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
