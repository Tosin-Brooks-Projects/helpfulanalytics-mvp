"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PropertySelectorProps {
    selectedProperty: string
    onPropertySelect: (property: string) => void
}

export function PropertySelector({ selectedProperty, onPropertySelect }: PropertySelectorProps) {
    return (
        <Select value={selectedProperty} onValueChange={onPropertySelect}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="demo">Demo Property</SelectItem>
            </SelectContent>
        </Select>
    )
}
