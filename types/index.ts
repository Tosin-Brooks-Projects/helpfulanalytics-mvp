export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope: string
}

export interface GA4Property {
  name: string // properties/123456789
  displayName: string
  propertyId: string
  websiteUrl?: string
}

export interface AnalyticsOverview {
  visitors: number
  sessions: number
  pageViews: number
  visitorsChange?: number // percentage change
  sessionsChange?: number
  pageViewsChange?: number
}

export interface TrafficSource {
  source: string
  medium: string
  sessions: number
  percentage: number // percentage of total sessions
  referrer?: string
  favicon?: string // fetched favicon URL
}

export interface DashboardData {
  overview: AnalyticsOverview
  trafficSources: TrafficSource[]
  totalSessions: number
  dateRange: {
    startDate: string
    endDate: string
  }
}

export interface ApiError {
  message: string
  code?: string
  retryable: boolean
}
