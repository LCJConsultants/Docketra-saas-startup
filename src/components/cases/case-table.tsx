"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface CaseWithClient {
  id: string;
  title: string;
  case_number: string | null;
  case_type: string;
  status: string;
  date_opened: string;
  created_at: string;
  client: { id: string; first_name: string; last_name: string } | null;
}

const statusVariant: Record<string, "success" | "warning" | "secondary" | "outline"> = {
  open: "success",
  pending: "warning",
  closed: "secondary",
  archived: "outline",
};

const typeColors: Record<string, string> = {
  criminal: "bg-red-100 text-red-800",
  civil: "bg-blue-100 text-blue-800",
  divorce: "bg-purple-100 text-purple-800",
  custody: "bg-pink-100 text-pink-800",
  mediation: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
};

const columns: ColumnDef<CaseWithClient>[] = [
  {
    accessorKey: "title",
    header: "Case",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/cases/${row.original.id}`}
          className="font-medium hover:text-primary transition-colors"
        >
          {row.original.title}
        </Link>
        {row.original.case_number && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            #{row.original.case_number}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "client_name",
    header: "Client",
    accessorFn: (row) =>
      row.client ? `${row.client.first_name} ${row.client.last_name}` : "—",
    cell: ({ row }) =>
      row.original.client ? (
        <Link
          href={`/clients/${row.original.client.id}`}
          className="text-sm hover:text-primary transition-colors"
        >
          {row.original.client.first_name} {row.original.client.last_name}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "case_type",
    header: "Type",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
          typeColors[row.original.case_type] || typeColors.other
        }`}
      >
        {row.original.case_type}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] || "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "date_opened",
    header: "Opened",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.date_opened)}
      </span>
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
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface CaseTableProps {
  cases: CaseWithClient[];
}

export function CaseTable({ cases }: CaseTableProps) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      searchKey="title"
      searchPlaceholder="Search cases..."
    />
  );
}
