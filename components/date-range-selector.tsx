"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangeSelectorProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (range: { from: Date; to: Date }) => void
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  })

  const presets = [
    {
      label: "Today",
      value: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      label: "Yesterday",
      value: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      label: "Last 7 days",
      value: {
        from: addDays(new Date(), -7),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
    },
    {
      label: "Last 90 days",
      value: {
        from: addDays(new Date(), -90),
        to: new Date(),
      },
    },
    {
      label: "Last 12 months",
      value: {
        from: addDays(new Date(), -365),
        to: new Date(),
      },
    },
  ]

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    if (selectedDate?.from && selectedDate?.to) {
      onDateRangeChange({
        from: selectedDate.from,
        to: selectedDate.to,
      })
    }
  }

  const handlePresetSelect = (preset: { from: Date; to: Date }) => {
    const newRange = { from: preset.from, to: preset.to }
    setDate(newRange)
    onDateRangeChange(newRange)
  }

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Presets</p>
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => handlePresetSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
