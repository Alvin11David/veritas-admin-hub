import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  title: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data, columns, searchKey, title, onAdd, onEdit, onDelete,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = searchKey
    ? data.filter((item) =>
        String((item as any)[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {searchKey && (
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-border h-9 w-full sm:w-56"
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add New
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  {col.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider w-24">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-8">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-sm">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-7 px-2 text-muted-foreground hover:text-foreground">
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="h-7 px-2 text-muted-foreground hover:text-destructive">
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
