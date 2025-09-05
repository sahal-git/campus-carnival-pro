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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Constants, TablesInsert } from "@/integrations/supabase/types";
import { createParticipation } from "@/queries/participations";
import { getStudents } from "@/queries/students";
import { getTeams } from "@/queries/teams";
import { getStagePrograms } from "@/queries/stagePrograms";
import { getNonStagePrograms } from "@/queries/nonStagePrograms";
import { getSportsPrograms } from "@/queries/sportsPrograms";

const participationSchema = z.object({
  program_type: z.enum(Constants.public.Enums.program_type),
  program_id: z.string({ required_error: "Please select a program." }),
  participant_type: z.enum(["individual", "team"]),
  student_id: z.string().optional().nullable(),
  team_id: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.participant_type === "individual" && !data.student_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["student_id"],
      message: "Please select a student.",
    });
  }
  if (data.participant_type === "team" && !data.team_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["team_id"],
      message: "Please select a team.",
    });
  }
});

type ParticipationFormValues = z.infer<typeof participationSchema>;

interface ParticipationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParticipationSheet({ open, onOpenChange }: ParticipationSheetProps) {
  const queryClient = useQueryClient();

  const form = useForm<ParticipationFormValues>({
    resolver: zodResolver(participationSchema),
    defaultValues: {
      program_type: "stage",
      participant_type: "individual",
    },
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({ queryKey: ["students"], queryFn: getStudents });
  const { data: teams, isLoading: isLoadingTeams } = useQuery({ queryKey: ["teams"], queryFn: getTeams });
  const { data: stagePrograms, isLoading: isLoadingStage } = useQuery({ queryKey: ["stagePrograms"], queryFn: getStagePrograms });
  const { data: nonStagePrograms, isLoading: isLoadingNonStage } = useQuery({ queryKey: ["nonStagePrograms"], queryFn: getNonStagePrograms });
  const { data: sportsPrograms, isLoading: isLoadingSports } = useQuery({ queryKey: ["sportsPrograms"], queryFn: getSportsPrograms });

  const programType = form.watch("program_type");
  const participantType = form.watch("participant_type");

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      program_id: undefined,
    });
  }, [programType, form]);

  const programs = useMemo(() => {
    switch (programType) {
      case "stage": return stagePrograms || [];
      case "nonstage": return nonStagePrograms || [];
      case "sports": return sportsPrograms || [];
      default: return [];
    }
  }, [programType, stagePrograms, nonStagePrograms, sportsPrograms]);

  const mutation = useMutation({
    mutationFn: (values: ParticipationFormValues) => {
      const payload: TablesInsert<'participations'> = {
        program_id: values.program_id,
        program_type: values.program_type,
        student_id: values.participant_type === 'individual' ? values.student_id : null,
        team_id: values.participant_type === 'team' ? values.team_id : null,
      };
      return createParticipation(payload);
    },
    onSuccess: () => {
      toast.success("Participation created successfully");
      queryClient.invalidateQueries({ queryKey: ["detailed_participations"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data: ParticipationFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) form.reset(); }}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add New Participation</SheetTitle>
          <SheetDescription>
            Register a student or a team for a program.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="program_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Program Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="stage" /></FormControl>
                        <FormLabel className="font-normal">Stage</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="nonstage" /></FormControl>
                        <FormLabel className="font-normal">Non-Stage</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="sports" /></FormControl>
                        <FormLabel className="font-normal">Sports</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoadingStage || isLoadingNonStage || isLoadingSports}>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participant_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Participant Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="individual" /></FormControl>
                        <FormLabel className="font-normal">Individual</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="team" /></FormControl>
                        <FormLabel className="font-normal">Team</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {participantType === 'individual' && (
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingStudents}>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.admission_no})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {participantType === 'team' && (
              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingTeams}>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
