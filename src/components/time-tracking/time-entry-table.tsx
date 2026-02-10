"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDate, formatDuration, formatCurrency } from "@/lib/utils";

interface TimeEntryRow {
  id: string;
  description: string;
  duration_minutes: number;
  hourly_rate: number | null;
  amount: number | null;
  date: string;
  is_billable: boolean;
  invoice_id: string | null;
  case: { id: string; title: string } | null;
}

const columns: ColumnDef<TimeEntryRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.date)}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm max-w-[300px] truncate block">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "case",
    header: "Case",
    cell: ({ row }) =>
      row.original.case ? (
        <Link href={`/cases/${row.original.case.id}`} className="text-sm hover:text-primary">
          {row.original.case.title}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "duration_minutes",
    header: "Duration",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{formatDuration(row.original.duration_minutes)}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.amount ? formatCurrency(row.original.amount) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "is_billable",
    header: "Billable",
    cell: ({ row }) => (
      <Badge variant={row.original.is_billable ? "success" : "secondary"}>
        {row.original.is_billable ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "invoice_id",
    header: "Invoiced",
    cell: ({ row }) => (
      <Badge variant={row.original.invoice_id ? "info" : "outline"}>
        {row.original.invoice_id ? "Invoiced" : "Unbilled"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface TimeEntryTableProps {
  entries: TimeEntryRow[];
}

export function TimeEntryTable({ entries }: TimeEntryTableProps) {
  return (
    <DataTable
      columns={columns}
      data={entries}
      searchKey="description"
      searchPlaceholder="Search time entries..."
    />
  );
}
