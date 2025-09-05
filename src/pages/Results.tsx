import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus, Award, Medal, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DetailedResult, getDetailedResults, deleteResult } from "@/queries/results";
import { ResultSheet } from "./results/ResultSheet";

const Results = () => {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<DetailedResult | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ["detailed_results"],
    queryFn: getDetailedResults,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResult,
    onSuccess: () => {
      toast.success("Result deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["detailed_results"] });
      queryClient.invalidateQueries({ queryKey: ["unscoredParticipations"] });
      setIsAlertOpen(false);
      setDeletingResultId(null);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleEdit = (result: DetailedResult) => {
    setEditingResult(result);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingResultId(id);
    setIsAlertOpen(true);
  };

  const handleAddNew = () => {
    setEditingResult(null);
    setIsSheetOpen(true);
  };

  const columns: ColumnDef<DetailedResult>[] = [
    {
      header: "Program",
      accessorKey: "program_name",
    },
    {
      header: "Participant",
      accessorKey: "student_name",
      cell: ({ row }) => row.original.student_name || row.original.team_name,
    },
    {
      header: "Position",
      accessorKey: "position",
      cell: ({ row }) => {
        const position = row.original.position;
        if (!position) return <span className="text-muted-foreground">N/A</span>;
        const iconMap = {
          "1st": <Trophy className="h-4 w-4 text-yellow-500" />,
          "2nd": <Medal className="h-4 w-4 text-gray-400" />,
          "3rd": <Award className="h-4 w-4 text-amber-600" />,
        };
        return <div className="flex items-center gap-2">{iconMap[position]} {position}</div>
      },
    },
    {
      header: "Grade",
      accessorKey: "grade",
      cell: ({ row }) => row.original.grade ? <Badge variant="secondary">{row.original.grade} Grade</Badge> : <span className="text-muted-foreground">N/A</span>,
    },
    {
      header: "Points",
      accessorKey: "points_awarded",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(result)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(result.id)} className="text-red-500">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Results</h1>
          <p className="text-muted-foreground">Enter and manage competition results</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {columns.map((column, j) => (
                        <TableCell key={j}>
                            <Skeleton className="h-6 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ResultSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} result={editingResult} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this result.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingResultId && deleteMutation.mutate(deletingResultId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Results;
