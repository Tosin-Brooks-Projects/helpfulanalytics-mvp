"use client"

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface LinearDataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    className?: string
    onRowClick?: (item: T) => void
}

export function LinearDataTable<T>({ data, columns, className, onRowClick }: LinearDataTableProps<T>) {
    return (
        <div className={cn("w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm", className)}>
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={cn("px-4 py-3 font-semibold", col.className)}>
                                {col.header}
                            </th>
                        ))}
                        {onRowClick && <th className="w-8" />}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {data.map((item, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={cn(
                                "group transition-colors hover:bg-zinc-50",
                                onRowClick && "cursor-pointer"
                            )}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={cn("px-4 py-3 text-zinc-700", col.className)}>
                                    {col.cell ? col.cell(item) : (item as any)[col.accessorKey!]}
                                </td>
                            ))}
                            {onRowClick && (
                                <td className="px-2 py-3 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
