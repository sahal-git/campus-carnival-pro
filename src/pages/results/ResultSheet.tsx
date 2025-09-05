import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Constants } from "@/integrations/supabase/types";
import { DetailedResult, createResult, updateResult, getUnscoredParticipations } from "@/queries/results";

const resultSchema = z.object({
  participation_id: z.string({ required_error: "Please select a participation entry." }),
  position: z.enum(Constants.public.Enums.result_position).nullable(),
  grade: z.enum(Constants.public.Enums.result_grade).nullable(),
  points_awarded: z.coerce.number().int().min(0, "Points must be a positive number."),
}).refine(data => data.position || data.grade, {
  message: "Either Position or Grade must be selected.",
  path: ["position"],
});


type ResultFormValues = z.infer<typeof resultSchema>;

interface ResultSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result?: DetailedResult | null;
}

export function ResultSheet({ open, onOpenChange, result }: ResultSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!result;

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      participation_id: undefined,
      position: null,
      grade: null,
      points_awarded: 0,
    },
  });

  const { data: unscoredParticipations, isLoading: isLoadingParticipations } = useQuery({
    queryKey: ["unscoredParticipations"],
    queryFn: getUnscoredParticipations,
    enabled: open && !isEditing, // Only fetch when adding a new result
  });

  useEffect(() => {
    if (result && isEditing) {
      form.reset({
        participation_id: result.participation_id ?? undefined,
        position: result.position,
        grade: result.grade,
        points_awarded: result.points_awarded,
      });
    } else {
      form.reset({
        participation_id: undefined,
        position: null,
        grade: null,
        points_awarded: 0,
      });
    }
  }, [result, isEditing, form, open]);

  const mutation = useMutation({
    mutationFn: (values: ResultFormValues) => {
      const payload: any = { ...values };
      if (!payload.position) {
        payload.position = null;
      }
      if (!payload.grade) {
        payload.grade = null;
      }

      return isEditing && result
        ? updateResult(result.id, payload)
        : createResult(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Result updated successfully" : "Result created successfully");
      queryClient.invalidateQueries({ queryKey: ["detailed_results"] });
      queryClient.invalidateQueries({ queryKey: ["unscoredParticipations"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data: ResultFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Result" : "Add New Result"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the result for this participation."
              : "Enter a new result for a participation."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="participation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participation Entry</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing || isLoadingParticipations}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an entry..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isEditing && result && <SelectItem value={result.participation_id!}>{`${result.program_name} - ${result.student_name || result.team_name}`}</SelectItem>}
                      {unscoredParticipations?.map((p) => <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value ?? 'none'} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {Constants.public.Enums.result_position.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value ?? 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {Constants.public.Enums.result_grade.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points_awarded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Awarded</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
