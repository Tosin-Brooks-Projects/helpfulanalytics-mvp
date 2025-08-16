"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PROPERTY_IDS } from "@/config/properties"
import { Building2, ExternalLink, Settings, RefreshCw, AlertTriangle, Tag, Star, FileText } from "lucide-react"

interface PropertyData {
  name: string
  displayName: string
  propertyId: string
  websiteUrl?: string
  description?: string
  customColor?: string
  tags?: string[]
  priority?: number
  notes?: string
}

interface PropertySelectorProps {
  onPropertySelect: (propertyId: string) => void
  selectedProperty?: string
}

export function PropertySelector({ onPropertySelect, selectedProperty }: PropertySelectorProps) {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [filterByTag, setFilterByTag] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [retryCount])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/properties")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch properties")
      }

      setProperties(data.properties || [])

      // Auto-select first property if none selected and properties exist
      if (!selectedProperty && (data.properties || []).length > 0) {
        onPropertySelect(data.properties[0].propertyId)
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const selectedPropertyData = properties.find((p) => p.propertyId === selectedProperty)
  const allTags = [...new Set(properties.flatMap((p) => p.tags || []))].sort()

  // Filter properties by tag if selected
  const filteredProperties = filterByTag ? properties.filter((p) => p.tags?.includes(filterByTag)) : properties

  const renderPropertyOption = (property: PropertyData) => (
    <SelectItem key={property.propertyId} value={property.propertyId}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{property.displayName}</span>
          {property.priority && property.priority <= 3 && <Star className="w-3 h-3 text-yellow-500" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>ID: {property.propertyId}</span>
          {property.websiteUrl && (
            <>
              <span>•</span>
              <span>{property.websiteUrl.replace(/^https?:\/\//, "")}</span>
            </>
          )}
        </div>
        {property.tags && property.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {property.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {property.tags.length > 3 && <span className="text-xs text-gray-400">+{property.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </SelectItem>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Select Analytics Property
          </CardTitle>
          <CardDescription>Loading properties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading {PROPERTY_IDS.length} properties...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Select Analytics Property
        </CardTitle>
        <CardDescription>Choose which GA4 property to display</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Selection Info */}
        {selectedPropertyData && (
          <div
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: selectedPropertyData.customColor ? `${selectedPropertyData.customColor}10` : "#EBF8FF",
              borderColor: selectedPropertyData.customColor || "#3B82F6",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900">{selectedPropertyData.displayName}</div>
                  {selectedPropertyData.priority && selectedPropertyData.priority <= 3 && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                {selectedPropertyData.description && (
                  <div className="text-sm text-gray-700 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {selectedPropertyData.description}
                  </div>
                )}

                <div className="text-sm text-gray-700">
                  <span>Property ID: {selectedPropertyData.propertyId}</span>
                </div>

                {selectedPropertyData.tags && selectedPropertyData.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="w-3 h-3" />
                    {selectedPropertyData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedPropertyData.notes && (
                  <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                    <strong>Notes:</strong> {selectedPropertyData.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedPropertyData.customColor && (
                  <div
                    className="w-6 h-6 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: selectedPropertyData.customColor }}
                    title="Custom color"
                  />
                )}
                {selectedPropertyData.websiteUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedPropertyData.websiteUrl, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium">Filter by Category</h5>
              {filterByTag && (
                <Button variant="outline" size="sm" onClick={() => setFilterByTag(null)}>
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={filterByTag === tag ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setFilterByTag(filterByTag === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Tags help categorize your properties (e.g., "newsletter" for email analytics, "beach" for vacation
              rentals)
            </p>
          </div>
        )}

        {/* Property Selector */}
        {filteredProperties.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">
              Available Properties
              {filterByTag && <span className="text-sm text-gray-500 ml-2">(filtered by "{filterByTag}")</span>}
            </h4>

            <Select value={selectedProperty} onValueChange={onPropertySelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a GA4 property" />
              </SelectTrigger>
              <SelectContent>{filteredProperties.map(renderPropertyOption)}</SelectContent>
            </Select>
          </div>
        )}

        {/* Configuration Help */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Customize Properties:</strong>
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  Edit <code className="bg-gray-100 px-1 rounded">config/properties.ts</code> to add property IDs
                </li>
                <li>Add custom names, colors, descriptions, and tags for each property</li>
                <li>Use tags to categorize properties by type (newsletter, blog, ecommerce, etc.)</li>
                <li>Set priority numbers (1-3) to highlight important properties with stars</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => window.open("https://analytics.google.com", "_blank")} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open GA4
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
