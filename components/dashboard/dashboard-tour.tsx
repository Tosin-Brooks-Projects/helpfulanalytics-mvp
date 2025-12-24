"use client"

import { useEffect, useState } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function DashboardTour() {
    const [tourDriver, setTourDriver] = useState<any>(null)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenTour")

        // Initialize driver
        const driverObj = driver({
            showProgress: true,
            animate: true,
            doneBtnText: 'Finish',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            allowClose: true,
            onDestroyed: () => {
                localStorage.setItem("hasSeenTour", "true")
            },
            steps: [
                {
                    element: '#sidebar-container',
                    popover: {
                        title: 'Navigation Sidebar',
                        description: 'Access all your reports here: Overview, Devices, Top Pages, Audience, and Sources.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#header-nav',
                    popover: {
                        title: 'Quick Reports',
                        description: 'Jump quickly to specific reports using these shortcuts.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#header-property-selector',
                    popover: {
                        title: 'Property Selector',
                        description: 'Switch between your different websites or add a new property here.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#header-date-picker',
                    popover: {
                        title: 'Date Range',
                        description: 'Filter all data on the dashboard by selecting a custom date range.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    element: '#header-sync',
                    popover: {
                        title: 'Sync Data',
                        description: 'Manually refresh your data from Google Analytics to get the latest stats.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    element: '#header-export',
                    popover: {
                        title: 'Export Reports',
                        description: 'Download comprehensive PDF or JSON reports of your analytics data.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    element: '#header-search',
                    popover: {
                        title: 'Command Palette',
                        description: 'Press Cmd+K to quickly search pages or perform actions.',
                        side: "bottom",
                        align: 'end'
                    }
                }
            ],
            // Customizing the popover style via popoverClass is possible, but default is clean.
            // We can rely on CSS for deeper customization if needed.
        })

        setTourDriver(driverObj)

        if (!hasSeenTour) {
            // Small delay to ensure UI is rendered
            setTimeout(() => {
                driverObj.drive()
            }, 1000)
        }
    }, [])

    return null // This component doesn't render anything visible itself
}
