"use client"

import { Button } from "@/components/ui/button"
import { Download, Mail, Loader2 } from "lucide-react"
import { useState } from "react"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from "sonner"
import { ReportTemplate } from "@/components/dashboard/report-template"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useAnalytics } from "@/hooks/use-analytics"

export function DownloadReportButton() {
    const [loading, setLoading] = useState(false)
    const { selectedProperty, dateRange } = useDashboard()
    const { data, loading: fetchingData } = useAnalytics(selectedProperty)

    const generatePDF = async () => {
        const element = document.getElementById('report-container')
        if (!element) throw new Error("Report template not found")

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Report document should be white
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        const imgWidth = canvas.width
        const imgHeight = canvas.height

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, canvas.height * pdfWidth / canvas.width)
        return pdf
    }

    const handleDownload = async () => {
        if (!data) return toast.error("Report data not ready")

        setLoading(true)
        try {
            const pdf = await generatePDF()
            pdf.save('analytics-report.pdf')
            toast.success("Report downloaded")
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate PDF")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            {/* Hidden Report Template */}
            <div style={{ position: 'absolute', top: 0, left: '-10000px', width: '800px' }}>
                <div id="report-container">
                    <ReportTemplate data={data} dateRange={dateRange} />
                </div>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={loading || fetchingData}
                className="h-8 w-8 shrink-0 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors flex items-center justify-center p-0 rounded-md"
                title="Export PDF"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Download className="h-4 w-4" />}
            </Button>
        </div>
    )
}
