"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CalendarIcon, ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react"
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear, subYears } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

const PRESETS = [
    { label: "Today", id: "today", getValue: () => ({ from: startOfDay(new Date()), to: new Date() }) },
    { label: "Yesterday", id: "yesterday", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: startOfDay(subDays(new Date(), 1)) }) },
    { label: "Last 7 Days", id: "7d", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 Days", id: "30d", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Last 365 Days", id: "365d", getValue: () => ({ from: subYears(new Date(), 1), to: new Date() }) },
    { label: "Week to Date", id: "wtd", getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
    { label: "Month to Date", id: "mtd", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    { label: "Year to Date", id: "ytd", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    { label: "Custom", id: "custom", getValue: () => null },
]

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const [open, setOpen] = React.useState(false)

    // Draft state — committed on Apply
    const [draftStart, setDraftStart] = React.useState<Date | null>(date?.from ?? null)
    const [draftEnd, setDraftEnd] = React.useState<Date | null>(date?.to ?? null)
    const [selectedPreset, setSelectedPreset] = React.useState("custom")
    const [viewDate, setViewDate] = React.useState(() => {
        const d = date?.from ?? new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })

    // Sync draft when popover opens
    React.useEffect(() => {
        if (open) {
            setDraftStart(date?.from ?? null)
            setDraftEnd(date?.to ?? null)
            const d = date?.from ?? new Date()
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))

            // Detect active preset
            const match = PRESETS.find(p => {
                if (p.id === "custom") return false
                const v = p.getValue()
                if (!v) return false
                return date?.from?.toDateString() === v.from.toDateString() &&
                    date?.to?.toDateString() === v.to.toDateString()
            })
            setSelectedPreset(match?.id ?? "custom")
        }
    }, [open])

    const handleDateClick = (clickedDate: Date) => {
        if (!draftStart || (draftStart && draftEnd)) {
            // Start new selection
            setDraftStart(clickedDate)
            setDraftEnd(null)
            setSelectedPreset("custom")
        } else {
            // Complete the range
            if (clickedDate < draftStart) {
                setDraftStart(clickedDate)
                setDraftEnd(draftStart)
            } else {
                setDraftEnd(clickedDate)
            }
            setSelectedPreset("custom")
        }
    }

    const handlePresetSelect = (preset: typeof PRESETS[number]) => {
        setSelectedPreset(preset.id)
        if (preset.id === "custom") return

        const value = preset.getValue()
        if (value) {
            setDraftStart(value.from)
            setDraftEnd(value.to)
            setViewDate(new Date(value.from.getFullYear(), value.from.getMonth(), 1))
        }
    }

    const handleApply = () => {
        if (draftStart && draftEnd) {
            setDate({ from: draftStart, to: draftEnd })
        }
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    // Keyboard shortcut: "d" to toggle
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = document.activeElement?.tagName
            const isEditable = document.activeElement?.getAttribute("contenteditable") === "true"
            if (e.key === "d" && !e.metaKey && !e.ctrlKey && !e.altKey && tag !== "INPUT" && tag !== "TEXTAREA" && !isEditable) {
                setOpen((prev) => !prev)
            }
        }

        const handlePresetEvent = (e: CustomEvent) => {
            const days = e.detail
            if (days === "year") {
                setDate({ from: startOfYear(new Date()), to: new Date() })
            } else if (typeof days === "number") {
                setDate({ from: subDays(new Date(), days), to: new Date() })
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        // @ts-ignore
        document.addEventListener("set-date-preset", handlePresetEvent)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            // @ts-ignore
            document.removeEventListener("set-date-preset", handlePresetEvent)
        }
    }, [setDate])

    const canApply = draftStart && draftEnd

    const renderMonthGrid = (
        monthDate: Date,
        showLeftNav = false,
        showRightNav = false,
    ) => {
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth()
        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const monthName = monthDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        })

        return (
            <div className="min-w-[224px] flex-1">
                <div className="mb-4 flex items-center justify-between px-2">
                    {showLeftNav ? (
                        <button
                            title="Previous month"
                            onClick={() => setViewDate(new Date(year, month - 1, 1))}
                            className="p-1 text-zinc-400 transition-colors hover:text-zinc-900"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <div className="w-7" />
                    )}
                    <span className="text-[13px] font-semibold tracking-tight text-zinc-800">
                        {monthName}
                    </span>
                    {showRightNav ? (
                        <button
                            title="Next month"
                            onClick={() => setViewDate(new Date(year, month + 1, 1))}
                            className="p-1 text-zinc-400 transition-colors hover:text-zinc-900"
                        >
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <div className="w-7" />
                    )}
                </div>

                <div className="relative grid grid-cols-7 gap-y-1 text-center">
                    {DAYS.map((d) => (
                        <span
                            key={d}
                            className="mb-2 text-[11px] font-medium text-zinc-400"
                        >
                            {d}
                        </span>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const currentDayDate = new Date(year, month, day)
                        const isStart = draftStart?.toDateString() === currentDayDate.toDateString()
                        const isEnd = draftEnd?.toDateString() === currentDayDate.toDateString()
                        const isInRange =
                            draftStart &&
                            draftEnd &&
                            currentDayDate > draftStart &&
                            currentDayDate < draftEnd

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(currentDayDate)}
                                className="group relative flex h-8 cursor-pointer items-center justify-center"
                            >
                                {(isInRange || isStart || isEnd) && (
                                    <div
                                        className={cn(
                                            "absolute z-0 h-8",
                                            "border-y border-amber-200/60 bg-amber-50",
                                            isStart ? "left-1/2 rounded-l-lg border-l" : "left-0",
                                            isEnd ? "right-1/2 rounded-r-lg border-r" : "right-0",
                                            isInRange && !isStart && !isEnd ? "w-full" : "",
                                        )}
                                    />
                                )}
                                {isStart || isEnd ? (
                                    <div className="absolute z-10 flex h-8 w-8 flex-col items-center justify-center rounded-lg border border-amber-600 bg-gradient-to-b from-amber-500 to-amber-600 shadow-xl">
                                        <span className="text-xs font-bold text-white">{day}</span>
                                        <motion.div
                                            layoutId="dateThumb"
                                            className="absolute bottom-1 h-[1.5px] w-2 rounded-full bg-white shadow"
                                        />
                                    </div>
                                ) : (
                                    <span
                                        className={cn(
                                            "relative z-10 text-[13px] font-normal transition-colors",
                                            isInRange
                                                ? "text-zinc-900"
                                                : "text-zinc-500 group-hover:text-zinc-900",
                                        )}
                                    >
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
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "h-8 w-fit justify-start text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 shadow-sm transition-all rounded-md px-3 text-[11px]",
                            !date && "text-muted-foreground"
                        )}
                        suppressHydrationWarning
                    >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                        <span suppressHydrationWarning>
                            {date?.from ? (
                                date.to ? (
                                    `${format(date.from, "MMM dd")} – ${format(date.to, "MMM dd, yyyy")}`
                                ) : (
                                    format(date.from, "MMM dd, yyyy")
                                )
                            ) : (
                                "Select date range"
                            )}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 border-zinc-200 bg-white text-zinc-900 shadow-2xl rounded-xl overflow-hidden"
                    align="end"
                    sideOffset={8}
                >
                    <div className="flex min-h-0 w-full flex-col md:flex-row">
                        {/* Presets Sidebar */}
                        <aside className="no-scrollbar flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-zinc-200 bg-zinc-50/50 py-3 md:w-44 md:flex-col md:border-r md:border-b-0">
                            {PRESETS.map((preset, idx) => (
                                <React.Fragment key={preset.id}>
                                    {[2, 5, 8].includes(idx) && (
                                        <div className="mx-3 my-1 hidden h-px bg-zinc-200 md:block" />
                                    )}
                                    <button
                                        onClick={() => handlePresetSelect(preset)}
                                        className={cn(
                                            "group mx-2 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs whitespace-nowrap transition-all duration-200 md:mx-3 md:text-[13px]",
                                            selectedPreset === preset.id
                                                ? preset.id === "custom"
                                                    ? "border border-zinc-300 bg-gradient-to-b from-zinc-100 to-zinc-200 font-medium text-zinc-900"
                                                    : "bg-zinc-200 text-zinc-900"
                                                : "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-500",
                                        )}
                                    >
                                        <span>{preset.label}</span>
                                        {selectedPreset === preset.id && preset.id === "custom" && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="ml-2"
                                            >
                                                <Check size={12} />
                                            </motion.div>
                                        )}
                                    </button>
                                </React.Fragment>
                            ))}
                        </aside>

                        {/* Main Content */}
                        <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-hidden bg-white p-4 md:p-5">
                            {/* Date Inputs */}
                            <div className="grid shrink-0 grid-cols-2 gap-3">
                                <DateInput label="Start date" date={draftStart} />
                                <DateInput label="End date" date={draftEnd} />
                            </div>

                            {/* Calendars */}
                            <div className="no-scrollbar flex snap-x snap-mandatory flex-row items-start gap-8 overflow-x-auto overflow-y-hidden pb-2">
                                <div className="shrink-0 snap-start">
                                    {renderMonthGrid(viewDate, true, false)}
                                </div>
                                <div className="hidden h-40 w-px shrink-0 self-center bg-zinc-200 opacity-50 lg:block" />
                                <div className="shrink-0 snap-start">
                                    {renderMonthGrid(
                                        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                                        false,
                                        true,
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>

                    {/* Footer */}
                    <footer className="flex h-14 shrink-0 items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-5">
                        <div className="text-[11px] text-zinc-400">
                            {draftStart && draftEnd ? (
                                <span className="text-zinc-600 font-medium">
                                    {format(draftStart, "MMM dd")} – {format(draftEnd, "MMM dd, yyyy")}
                                </span>
                            ) : draftStart ? (
                                <span className="text-amber-600">Select end date</span>
                            ) : (
                                <span>No dates selected</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCancel}
                                className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={!canApply}
                                className="rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Apply
                            </button>
                        </div>
                    </footer>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function DateInput({ label, date }: { label: string; date: Date | null }) {
    return (
        <div className="flex flex-1 flex-col gap-1.5">
            <label className="ml-1 text-[12px] font-normal text-zinc-400">
                {label}
            </label>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 transition-colors hover:border-zinc-300 md:text-[13px]">
                <span>
                    {date
                        ? date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : "Select Date"}
                </span>
                <ChevronDown size={14} className="text-zinc-400" />
            </div>
        </div>
    )
}
