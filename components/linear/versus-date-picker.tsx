"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Swords, ChevronLeft, ChevronRight, ChevronDown, ArrowLeftRight } from "lucide-react"
import { format, subDays, differenceInDays } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface VersusDatePickerProps {
    dateRange: DateRange | undefined
    setDateRange: (date: DateRange | undefined) => void
    compareDateRange: DateRange | undefined
    setCompareDateRange: (date: DateRange | undefined) => void
}

type ActivePeriod = "current" | "compare"

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function VersusDatePicker({
    dateRange,
    setDateRange,
    compareDateRange,
    setCompareDateRange,
}: VersusDatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [activePeriod, setActivePeriod] = React.useState<ActivePeriod>("current")

    const [draftCurrentStart, setDraftCurrentStart] = React.useState<Date | null>(dateRange?.from ?? null)
    const [draftCurrentEnd, setDraftCurrentEnd] = React.useState<Date | null>(dateRange?.to ?? null)
    const [draftCompareStart, setDraftCompareStart] = React.useState<Date | null>(compareDateRange?.from ?? null)
    const [draftCompareEnd, setDraftCompareEnd] = React.useState<Date | null>(compareDateRange?.to ?? null)

    const [viewDate, setViewDate] = React.useState(() => {
        const d = dateRange?.from ?? new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })

    React.useEffect(() => {
        if (open) {
            setDraftCurrentStart(dateRange?.from ?? null)
            setDraftCurrentEnd(dateRange?.to ?? null)
            setDraftCompareStart(compareDateRange?.from ?? null)
            setDraftCompareEnd(compareDateRange?.to ?? null)
            setActivePeriod("current")
            const d = dateRange?.from ?? new Date()
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
        }
    }, [open])

    React.useEffect(() => {
        if (activePeriod === "compare" && draftCompareStart) {
            setViewDate(new Date(draftCompareStart.getFullYear(), draftCompareStart.getMonth(), 1))
        } else if (activePeriod === "current" && draftCurrentStart) {
            setViewDate(new Date(draftCurrentStart.getFullYear(), draftCurrentStart.getMonth(), 1))
        }
    }, [activePeriod])

    const handleDateClick = (clickedDate: Date) => {
        if (activePeriod === "current") {
            if (!draftCurrentStart || (draftCurrentStart && draftCurrentEnd)) {
                setDraftCurrentStart(clickedDate)
                setDraftCurrentEnd(null)
            } else {
                if (clickedDate < draftCurrentStart) {
                    setDraftCurrentStart(clickedDate)
                    setDraftCurrentEnd(draftCurrentStart)
                } else {
                    setDraftCurrentEnd(clickedDate)
                }
            }
        } else {
            if (!draftCompareStart || (draftCompareStart && draftCompareEnd)) {
                setDraftCompareStart(clickedDate)
                setDraftCompareEnd(null)
            } else {
                if (clickedDate < draftCompareStart) {
                    setDraftCompareStart(clickedDate)
                    setDraftCompareEnd(draftCompareStart)
                } else {
                    setDraftCompareEnd(clickedDate)
                }
            }
        }
    }

    const handleSwap = () => {
        const tmpStart = draftCurrentStart
        const tmpEnd = draftCurrentEnd
        setDraftCurrentStart(draftCompareStart)
        setDraftCurrentEnd(draftCompareEnd)
        setDraftCompareStart(tmpStart)
        setDraftCompareEnd(tmpEnd)
    }

    const handleAutoSuggest = () => {
        if (draftCurrentStart && draftCurrentEnd) {
            const days = differenceInDays(draftCurrentEnd, draftCurrentStart)
            setDraftCompareStart(subDays(draftCurrentStart, days + 1))
            setDraftCompareEnd(subDays(draftCurrentStart, 1))
            setActivePeriod("compare")
        }
    }

    const handleApply = () => {
        if (draftCurrentStart && draftCurrentEnd) {
            setDateRange({ from: draftCurrentStart, to: draftCurrentEnd })
        }
        if (draftCompareStart && draftCompareEnd) {
            setCompareDateRange({ from: draftCompareStart, to: draftCompareEnd })
        }
        setOpen(false)
    }

    const canApply = draftCurrentStart && draftCurrentEnd && draftCompareStart && draftCompareEnd

    const formatRange = (start: Date | null, end: Date | null) => {
        if (!start) return "Pick dates"
        if (!end) return format(start, "MMM dd")
        return `${format(start, "MMM dd")} – ${format(end, "MMM dd")}`
    }

    const triggerLabel = () => {
        if (dateRange?.from && dateRange?.to && compareDateRange?.from && compareDateRange?.to) {
            return `${format(dateRange.from, "MMM dd")} – ${format(dateRange.to, "MMM dd")}  vs  ${format(compareDateRange.from, "MMM dd")} – ${format(compareDateRange.to, "MMM dd")}`
        }
        return "Select comparison dates"
    }

    const activeStart = activePeriod === "current" ? draftCurrentStart : draftCompareStart
    const activeEnd = activePeriod === "current" ? draftCurrentEnd : draftCompareEnd
    const isAmber = activePeriod === "current"

    const renderMonthGrid = (monthDate: Date) => {
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth()
        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const monthName = monthDate.toLocaleString("default", { month: "short", year: "numeric" })

        return (
            <div className="w-[196px]">
                {/* Month header with nav */}
                <div className="mb-2 flex items-center justify-between">
                    <button
                        title="Previous month"
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="p-0.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-[11px] font-semibold text-zinc-700">{monthName}</span>
                    <button
                        title="Next month"
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="p-0.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded"
                    >
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 text-center mb-1">
                    {DAYS.map((d) => (
                        <span key={d} className="text-[9px] font-medium text-zinc-400 leading-6">{d}</span>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 text-center">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`e-${i}`} className="h-6" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const d = new Date(year, month, day)
                        const isStart = activeStart?.toDateString() === d.toDateString()
                        const isEnd = activeEnd?.toDateString() === d.toDateString()
                        const isInRange = activeStart && activeEnd && d > activeStart && d < activeEnd

                        const rangeBg = isAmber ? "border-amber-200/50 bg-amber-50/70" : "border-violet-200/50 bg-violet-50/70"
                        const pillBorder = isAmber ? "border-amber-500" : "border-violet-500"
                        const pillBg = isAmber ? "from-amber-500 to-amber-600" : "from-violet-500 to-violet-600"

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(d)}
                                className="group relative flex h-6 cursor-pointer items-center justify-center"
                            >
                                {(isInRange || isStart || isEnd) && (
                                    <div className={cn(
                                        "absolute inset-y-0 z-0 border-y", rangeBg,
                                        isStart ? "left-1/2 rounded-l-md border-l" : "left-0",
                                        isEnd ? "right-1/2 rounded-r-md border-r" : "right-0",
                                        isInRange && !isStart && !isEnd && "w-full",
                                    )} />
                                )}
                                {isStart || isEnd ? (
                                    <div className={cn(
                                        "absolute z-10 flex h-6 w-6 items-center justify-center rounded-md border bg-gradient-to-b shadow-sm",
                                        pillBorder, pillBg,
                                    )}>
                                        <span className="text-[10px] font-bold text-white leading-none">{day}</span>
                                    </div>
                                ) : (
                                    <span className={cn(
                                        "relative z-10 text-[11px] leading-none transition-colors",
                                        isInRange ? "text-zinc-800 font-medium" : "text-zinc-500 group-hover:text-zinc-900",
                                    )}>
                                        {day}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-8 w-fit justify-start text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 shadow-sm transition-all rounded-md px-3 text-[11px]",
                        (!dateRange?.from || !compareDateRange?.from) && "text-muted-foreground"
                    )}
                    suppressHydrationWarning
                >
                    <Swords className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    <span className="truncate max-w-[320px]" suppressHydrationWarning>{triggerLabel()}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[280px] p-0 border-zinc-200 bg-white text-zinc-900 shadow-2xl rounded-xl overflow-hidden"
                align="end"
                sideOffset={6}
            >
                {/* Period Tabs */}
                <div className="flex items-center border-b border-zinc-100">
                    <button
                        className={cn(
                            "flex-1 py-2 text-[10px] font-semibold transition-all relative",
                            activePeriod === "current"
                                ? "text-amber-700 bg-amber-50/50"
                                : "text-zinc-400 hover:text-zinc-600"
                        )}
                        onClick={() => setActivePeriod("current")}
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", activePeriod === "current" ? "bg-amber-500" : "bg-zinc-300")} />
                            Current
                        </div>
                        <span className="block text-[9px] font-normal mt-0.5 opacity-70">
                            {formatRange(draftCurrentStart, draftCurrentEnd)}
                        </span>
                        {activePeriod === "current" && <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-500 rounded-full" />}
                    </button>

                    <button
                        onClick={handleSwap}
                        className="p-1 text-zinc-300 hover:text-zinc-500 rounded transition-colors shrink-0"
                        title="Swap periods"
                    >
                        <ArrowLeftRight className="h-3 w-3" />
                    </button>

                    <button
                        className={cn(
                            "flex-1 py-2 text-[10px] font-semibold transition-all relative",
                            activePeriod === "compare"
                                ? "text-violet-700 bg-violet-50/50"
                                : "text-zinc-400 hover:text-zinc-600"
                        )}
                        onClick={() => setActivePeriod("compare")}
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", activePeriod === "compare" ? "bg-violet-500" : "bg-zinc-300")} />
                            Compare
                        </div>
                        <span className="block text-[9px] font-normal mt-0.5 opacity-70">
                            {formatRange(draftCompareStart, draftCompareEnd)}
                        </span>
                        {activePeriod === "compare" && <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-violet-500 rounded-full" />}
                    </button>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-2 px-3 pt-3">
                    <CompactDateInput
                        label={activePeriod === "current" ? "From" : "Comp. from"}
                        date={activeStart}
                        accent={isAmber ? "amber" : "violet"}
                    />
                    <CompactDateInput
                        label={activePeriod === "current" ? "To" : "Comp. to"}
                        date={activeEnd}
                        accent={isAmber ? "amber" : "violet"}
                    />
                </div>

                {/* Calendar */}
                <div className="flex justify-center px-3 py-3">
                    {renderMonthGrid(viewDate)}
                </div>

                {/* Auto-suggest */}
                {activePeriod === "current" && draftCurrentStart && draftCurrentEnd && !draftCompareStart && (
                    <div className="mx-3 mb-2 px-2.5 py-1.5 bg-violet-50 border border-violet-100 rounded-lg text-[10px] text-violet-600 flex items-center justify-between">
                        <span>Suggest prev. {differenceInDays(draftCurrentEnd, draftCurrentStart) + 1}d</span>
                        <button
                            onClick={handleAutoSuggest}
                            className="text-[9px] font-semibold text-violet-700 hover:text-violet-900 transition-colors underline underline-offset-2"
                        >
                            Apply
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-3 py-2">
                    <div className="flex items-center gap-2 text-[9px] min-w-0">
                        <span className="flex items-center gap-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className={cn("text-zinc-400 truncate", draftCurrentStart && draftCurrentEnd && "text-zinc-600 font-medium")}>
                                {formatRange(draftCurrentStart, draftCurrentEnd)}
                            </span>
                        </span>
                        <span className="text-zinc-300 font-bold shrink-0">vs</span>
                        <span className="flex items-center gap-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                            <span className={cn("text-zinc-400 truncate", draftCompareStart && draftCompareEnd && "text-zinc-600 font-medium")}>
                                {formatRange(draftCompareStart, draftCompareEnd)}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!canApply}
                            className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-semibold text-white shadow transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Compare
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function CompactDateInput({ label, date, accent }: { label: string; date: Date | null; accent: "amber" | "violet" }) {
    const borderColor = date
        ? accent === "amber" ? "border-amber-300/70" : "border-violet-300/70"
        : "border-zinc-200"
    return (
        <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-medium text-zinc-400 ml-0.5">{label}</label>
            <div className={cn(
                "flex items-center justify-between rounded-lg border bg-zinc-50/80 px-2 py-1.5 text-[11px] text-zinc-600",
                borderColor,
            )}>
                <span className="truncate">
                    {date ? format(date, "MMM dd, yyyy") : "Select"}
                </span>
                <ChevronDown size={10} className="text-zinc-400 shrink-0 ml-1" />
            </div>
        </div>
    )
}
