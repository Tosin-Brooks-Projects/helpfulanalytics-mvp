"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import useSWR from "swr"

const fetcher = (url: string) => {
    // During build/SSR, fetch might fail if it's a relative URL
    if (typeof window === "undefined" && !url.startsWith("http")) return Promise.resolve(null)
    return fetch(url).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
    })
}

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
    stripeCurrentPeriodEnd?: string // ISO date string from Stripe
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
    compareDateRange: DateRange | undefined
    setCompareDateRange: (date: DateRange | undefined) => void
    subscription: Subscription | null
    features: { advancedReports: boolean } | null
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    deletionUsage: { count: number, resetAt: number } | null
}

const LinearDashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function LinearDashboardProvider({ children }: { children: ReactNode }) {
    const [isClient, setIsClient] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<string>("")

    useEffect(() => {
        setIsClient(true)
    }, [])
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    })
    const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>(undefined)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const router = useRouter()

    // 1. Fetch saved properties (Active)
    const { data: savedData, isLoading: isLoadingSaved } = useSWR(isClient ? "/api/user/properties" : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    })

    // 2. Fetch all GA4 properties (Available)
    const { data: allData, isLoading: isLoadingAll } = useSWR(isClient ? "/api/analytics/properties" : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    })

    // 3. Fetch user subscription
    const { data: userData, isLoading: isLoadingUser } = useSWR(isClient ? "/api/user/me" : null, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    })

    const loading = isLoadingSaved || isLoadingAll || isLoadingUser

    const properties = useMemo(() => savedData?.properties || [], [savedData])
    const deletionUsage = useMemo(() => savedData?.deletionUsage || null, [savedData])
    const subscription = useMemo(() => userData?.subscription || null, [userData])
    const features = useMemo(
        () => (userData?.features ? { advancedReports: !!userData.features.advancedReports } : null),
        [userData],
    )

    const availableProperties = useMemo(() => {
        const allProps = allData?.properties || []
        const savedIds = new Set(properties.map((p: any) => p.id))
        return allProps.filter((p: any) => !savedIds.has(p.id))
    }, [allData, properties])

    // Initial Selection Logic - only run once when properties load and we don't have a selection
    useEffect(() => {
        if (!isClient) return
        if (!selectedProperty && properties.length > 0) {
            const saved = localStorage.getItem("linear_selected_property")
            if (saved && properties.find((p: Property) => p.id === saved)) {
                setSelectedProperty(saved)
            } else {
                setSelectedProperty(properties[0].id)
            }
        }
    }, [properties, selectedProperty])

    // Persist selection
    useEffect(() => {
        if (!isClient) return
        if (selectedProperty) {
            localStorage.setItem("linear_selected_property", selectedProperty)
        }
    }, [selectedProperty])

    // Load date range from local storage
    useEffect(() => {
        if (!isClient) return
        const savedDateRange = localStorage.getItem("linear_date_range")
        if (savedDateRange) {
            try {
                const parsed = JSON.parse(savedDateRange)
                if (parsed.from && parsed.to) {
                    setDateRange({
                        from: new Date(parsed.from),
                        to: new Date(parsed.to)
                    })
                }
            } catch (e) {
                console.error("Failed to parse saved date range", e)
            }
        }
    }, [])

    // Load Versus state and compare date range
    useEffect(() => {
        if (!isClient) return
        const savedCompareDate = localStorage.getItem("linear_compare_date_range")
        if (savedCompareDate) {
            try {
                const parsed = JSON.parse(savedCompareDate)
                if (parsed.from && parsed.to) {
                    setCompareDateRange({
                        from: new Date(parsed.from),
                        to: new Date(parsed.to)
                    })
                }
            } catch (e) {
                console.error("Failed to parse saved compare date range", e)
            }
        }
    }, [])

    // Persist date range
    useEffect(() => {
        if (!isClient) return
        if (dateRange) {
            localStorage.setItem("linear_date_range", JSON.stringify(dateRange))
        }
    }, [dateRange])

    // Persist Compare Date Range
    useEffect(() => {
        if (!isClient) return
        if (compareDateRange) {
            localStorage.setItem("linear_compare_date_range", JSON.stringify(compareDateRange))
        }
    }, [compareDateRange])

    return (
        <LinearDashboardContext.Provider value={{
            properties,
            availableProperties,
            selectedProperty,
            setSelectedProperty,
            loading,
            dateRange,
            setDateRange,
            compareDateRange,
            setCompareDateRange,
            subscription,
            sidebarCollapsed,
            setSidebarCollapsed,
            deletionUsage,
            features,
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
