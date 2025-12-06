"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, RefreshCw, AlertTriangle } from "lucide-react"

interface PropertyData {
  name: string
  displayName: string
  propertyId: string
  websiteUrl?: string
  tags?: string[]
  accountName?: string
}

interface PropertySelectorProps {
  onPropertySelect: (propertyId: string) => void
  selectedProperty?: string
}

export function PropertySelector({ onPropertySelect, selectedProperty }: PropertySelectorProps) {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  // Persist selection
  useEffect(() => {
    if (selectedProperty) {
      localStorage.setItem("selectedPropertyId", selectedProperty)
    }
  }, [selectedProperty])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/properties")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch properties")
      }

      const fetchedProperties = data.properties || []
      setProperties(fetchedProperties)

      // Handle initial selection
      if (!selectedProperty && fetchedProperties.length > 0) {
        // Try to restore from localStorage
        const savedId = localStorage.getItem("selectedPropertyId")
        const savedProperty = fetchedProperties.find((p: PropertyData) => p.propertyId === savedId)

        if (savedProperty) {
          onPropertySelect(savedProperty.propertyId)
        } else {
          onPropertySelect(fetchedProperties[0].propertyId)
        }
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

  // Group properties by account
  const groupedProperties = properties.reduce((acc, property) => {
    const accountName = property.accountName || "Other"
    if (!acc[accountName]) {
      acc[accountName] = []
    }
    acc[accountName].push(property)
    return acc
  }, {} as Record<string, PropertyData[]>)

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading properties...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertTriangle className="h-4 w-4" />
        Failed to load properties
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchProperties}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProperty} onValueChange={onPropertySelect}>
        <SelectTrigger className="w-[280px] bg-background">
          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select property" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedProperties).map(([accountName, accountProperties]) => (
            <SelectGroup key={accountName}>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {accountName}
              </SelectLabel>
              {accountProperties.map((property) => (
                <SelectItem key={property.propertyId} value={property.propertyId}>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="truncate">{property.displayName}</span>
                    {property.tags && property.tags.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {property.tags[0]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
