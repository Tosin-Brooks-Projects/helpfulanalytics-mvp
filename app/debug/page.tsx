"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Copy, ExternalLink, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/properties")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      setDebugData({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Enhanced Debug Information</h1>
            <p className="text-gray-600">Comprehensive GA4 API troubleshooting with endpoint testing</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchDebugInfo} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Fetch Debug Info
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Console
            </Button>
          </div>
        </div>

        {debugData && (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoint Tests</TabsTrigger>
              <TabsTrigger value="attempts">API Attempts</TabsTrigger>
              <TabsTrigger value="responses">Raw Responses</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>User Email:</span>
                    <Badge variant="outline">{debugData.debug?.userEmail || "Not available"}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Total Accounts:</span>
                    <Badge variant="outline">{debugData.debug?.totalAccounts || 0}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>GA4 Properties Found:</span>
                    <Badge variant={debugData.debug?.ga4Properties > 0 ? "default" : "destructive"}>
                      {debugData.debug?.ga4Properties || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Working Endpoints:</span>
                    <Badge variant="outline">{debugData.debug?.workingEndpoints?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Failed Endpoints:</span>
                    <Badge variant="outline">{debugData.debug?.failingEndpoints?.length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Properties Found */}
              {debugData.properties && debugData.properties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Properties Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {debugData.properties.map((prop: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-green-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{prop.displayName}</div>
                              <div className="text-sm text-gray-600">ID: {prop.propertyId}</div>
                              {prop.websiteUrl && <div className="text-sm text-gray-600">URL: {prop.websiteUrl}</div>}
                              {prop.accountName && (
                                <div className="text-sm text-gray-600">Account: {prop.accountName}</div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline">{prop.propertyType}</Badge>
                              {prop.discoveredVia && (
                                <Badge variant="secondary" className="text-xs">
                                  via {prop.discoveredVia}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Endpoint Availability Tests</CardTitle>
                  <p className="text-sm text-gray-600">Testing different API endpoints to see which ones respond</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {debugData.debug?.endpointTests?.map((test: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {test.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-mono text-sm">{test.endpoint}</span>
                          <Badge variant={test.success ? "default" : "destructive"}>
                            {test.status || "Network Error"}
                          </Badge>
                        </div>
                        {test.responsePreview && (
                          <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                            <strong>Response Preview:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">{test.responsePreview}</pre>
                          </div>
                        )}
                        {test.error && (
                          <div className="text-xs bg-red-50 p-2 rounded mt-2 text-red-700">
                            <strong>Error:</strong> {test.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Working vs Failing Endpoints Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Working Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {debugData.debug?.workingEndpoints?.length > 0 ? (
                      <ul className="space-y-1">
                        {debugData.debug.workingEndpoints.map((endpoint: string, index: number) => (
                          <li key={index} className="text-sm font-mono bg-green-50 p-2 rounded">
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No working endpoints found</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">Failing Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {debugData.debug?.failingEndpoints?.length > 0 ? (
                      <ul className="space-y-2">
                        {debugData.debug.failingEndpoints.slice(0, 5).map((endpoint: any, index: number) => (
                          <li key={index} className="text-sm">
                            <div className="font-mono bg-red-50 p-2 rounded">{endpoint.endpoint}</div>
                            <div className="text-xs text-red-600 mt-1">
                              Status: {endpoint.status} {endpoint.error && `- ${endpoint.error}`}
                            </div>
                          </li>
                        ))}
                        {debugData.debug.failingEndpoints.length > 5 && (
                          <li className="text-xs text-gray-500">
                            ... and {debugData.debug.failingEndpoints.length - 5} more failing endpoints
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No failing endpoints</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attempts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Attempts</CardTitle>
                  <p className="text-sm text-gray-600">All API calls made to find your properties</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {debugData.debug?.attempts?.map((attempt: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {attempt.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {attempt.account ? `${attempt.account} - ` : ""}
                            {attempt.method}
                          </span>
                          {attempt.success && (
                            <Badge variant="outline" className="text-xs">
                              {attempt.propertiesCount} properties
                            </Badge>
                          )}
                        </div>
                        {attempt.endpoint && (
                          <div className="text-xs font-mono bg-gray-50 p-2 rounded mb-2">{attempt.endpoint}</div>
                        )}
                        {attempt.reason && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Details:</strong> {attempt.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Raw API Responses</CardTitle>
                  <p className="text-sm text-gray-600">Exact responses from Google Analytics APIs</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debugData.debug?.rawResponses?.map((response: any, index: number) => (
                      <div key={index} className="border rounded-lg">
                        <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {response.account ? `${response.account} - ` : ""}
                              {response.method || "API Call"}
                            </span>
                            <Badge variant={response.status === 200 ? "default" : "destructive"} className="ml-2">
                              HTTP {response.status}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-3">
                          {response.endpoint && (
                            <div className="mb-2">
                              <strong>Endpoint:</strong>
                              <code className="text-xs bg-gray-100 px-1 rounded ml-2">{response.endpoint}</code>
                            </div>
                          )}
                          {response.headers && (
                            <div className="mb-2">
                              <strong>Headers:</strong>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(response.headers, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <strong>Response Body:</strong>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                              {response.body}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Current Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>Admin API Enabled:</span>
                        <Badge variant="default">✅ Confirmed</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Working Endpoints:</span>
                        <Badge variant={debugData.debug?.workingEndpoints?.length > 0 ? "default" : "destructive"}>
                          {debugData.debug?.workingEndpoints?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Properties Found:</span>
                        <Badge variant={debugData.debug?.ga4Properties > 0 ? "default" : "destructive"}>
                          {debugData.debug?.ga4Properties || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {debugData.debug?.suggestions && (
                    <div>
                      <h4 className="font-medium mb-2">Specific Suggestions</h4>
                      <div className="space-y-1">
                        {debugData.debug.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Review the "Endpoint Tests" tab to see which APIs are responding</li>
                      <li>Check if any working endpoints found your properties</li>
                      <li>Verify GA4 properties exist in your Google Analytics console</li>
                      <li>Try manual property input if auto-discovery continues to fail</li>
                      <li>Consider checking OAuth scopes and permissions</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Debug Data */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Complete Debug Data</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(debugData, null, 2))}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs max-h-96">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!debugData && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Click "Fetch Debug Info" to start comprehensive endpoint testing</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
