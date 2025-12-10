"use client"

import { cn } from "@/lib/utils"

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
}

export function LinearDataTable<T>({ data, columns, className }: LinearDataTableProps<T>) {
    return (
        <div className={cn("w-full overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02]", className)}>
            <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-zinc-500">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={cn("px-4 py-3 font-medium", col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((item, rowIdx) => (
                        <tr key={rowIdx} className="group transition-colors hover:bg-white/[0.02]">
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={cn("px-4 py-3 text-zinc-300", col.className)}>
                                    {col.cell ? col.cell(item) : (item as any)[col.accessorKey!]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
