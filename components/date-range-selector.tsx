"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

interface DateRange {
    from: Date
    to: Date
}

interface DateRangeSelectorProps {
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
    return (
        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Last 30 Days</span>
        </Button>
    )
}
