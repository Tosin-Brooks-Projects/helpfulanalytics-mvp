"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, subDays, startOfYear } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    const [open, setOpen] = React.useState(false)

    const presets = [
        { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
        { label: "Last 28 days", getValue: () => ({ from: subDays(new Date(), 28), to: new Date() }) },
        { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
        { label: "Last 90 days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
        { label: "Year to date", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
    ]

    const handlePresetSelect = (getValue: () => DateRange) => {
        setDate(getValue())
        setOpen(false)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "h-8 w-fit justify-start text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 shadow-sm transition-all rounded-md px-3 text-[11px]",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                                </>
                            ) : (
                                format(date.from, "MMM dd, yyyy")
                            )
                        ) : (
                            <span>Select date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-zinc-200 bg-white text-zinc-900 shadow-2xl rounded-lg overflow-hidden" align="end">
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                        {/* Presets Sidebar */}
                        <div className="flex flex-col p-2 min-w-[140px] bg-zinc-50/30">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-3 py-1">Presets</span>
                            <div className="space-y-0.5">
                                {presets.map((preset) => {
                                    const isSelected = date?.from?.getTime() === preset.getValue().from.getTime() &&
                                        date?.to?.getTime() === preset.getValue().to.getTime()
                                    return (
                                        <Button
                                            key={preset.label}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "w-full justify-start text-[11px] font-medium h-8 px-3 transition-colors",
                                                isSelected
                                                    ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                            onClick={() => handlePresetSelect(preset.getValue)}
                                        >
                                            {preset.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Calendar Section */}
                        <div className="flex flex-col">
                            <div className="p-3 border-b border-zinc-100 bg-white">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Custom Range</span>
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="bg-white"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-2 sm:space-y-0 p-3",
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center px-8",
                                    caption_label: "text-xs font-semibold text-zinc-900",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: cn(
                                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
                                    ),
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-zinc-400 rounded-md w-8 font-medium text-[10px] uppercase tracking-tighter",
                                    row: "flex w-full mt-2",
                                    cell: "text-center text-xs p-0 relative focus-within:relative focus-within:z-20",
                                    day: cn(
                                        "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-100 rounded-md transition-colors"
                                    ),
                                    day_range_start: "day-range-start bg-amber-500 text-white hover:bg-amber-600 rounded-r-none",
                                    day_range_end: "day-range-end bg-amber-500 text-white hover:bg-amber-600 rounded-l-none",
                                    day_selected: "bg-amber-500 text-white hover:bg-amber-600 hover:text-white focus:bg-amber-500 focus:text-white",
                                    day_today: "bg-zinc-100 text-zinc-900",
                                    day_outside: "text-zinc-300 opacity-50",
                                    day_disabled: "text-zinc-300 opacity-50",
                                    day_range_middle: "aria-selected:bg-amber-500/10 aria-selected:text-amber-600",
                                    day_hidden: "invisible",
                                }}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
