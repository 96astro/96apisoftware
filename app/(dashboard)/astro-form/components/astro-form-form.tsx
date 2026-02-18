"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PlaceAutocompleteInput from "@/components/shared/place-autocomplete-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { astroFormSchema, AstroFormSchemaType } from "@/lib/zod";

const req = <span className="text-red-600">*</span>;

const AstroFormForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AstroFormSchemaType>({
    resolver: zodResolver(astroFormSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      placeOfBirth: "",
      latitudeDeg: "",
      latitudeMin: "",
      latitudeDir: "N",
      longitudeDeg: "",
      longitudeMin: "",
      longitudeDir: "E",
      timezoneOffset: "",
      chartStyle: "North Indian",
      kpHoraryNumber: "145",
      birthDate: "",
      birthTime: "",
    },
  });

  const onSubmit = async (values: AstroFormSchemaType) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/astro-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as {
        error?: string;
        reportId?: string;
      };

      if (!response.ok || !result.reportId) {
        toast.error(result.error || "Failed to generate report.");
        return;
      }

      toast.success("Report generated successfully.");
      router.push(`/astro-form/reports/${result.reportId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong while generating the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender {req}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="placeOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place of Birth {req}</FormLabel>
              <FormControl>
                <PlaceAutocompleteInput
                  id="astroFormPlaceOfBirth"
                  value={field.value}
                  onChange={field.onChange}
                  onPlaceDetailsChange={(details) => {
                    form.setValue("latitudeDeg", details.latitudeDeg, { shouldValidate: true });
                    form.setValue("latitudeMin", details.latitudeMin, { shouldValidate: true });
                    form.setValue("latitudeDir", details.latitudeDir === "S" ? "S" : "N", { shouldValidate: true });
                    form.setValue("longitudeDeg", details.longitudeDeg, { shouldValidate: true });
                    form.setValue("longitudeMin", details.longitudeMin, { shouldValidate: true });
                    form.setValue("longitudeDir", details.longitudeDir === "W" ? "W" : "E", { shouldValidate: true });
                    form.setValue("timezoneOffset", details.timezoneOffset, { shouldValidate: true });
                  }}
                  placeholder="Place of Birth"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latitudeDeg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude Deg {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Latitude degree" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latitudeMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude Min {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Latitude minute" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="latitudeDir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude Dir {req}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Latitude Dir" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="N">N</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitudeDeg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude Deg {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Longitude degree" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitudeMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude Min {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Longitude minute" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitudeDir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude Dir {req}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Longitude Dir" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="W">W</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezoneOffset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 5.5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chartStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chart Style {req}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Chart Style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="North Indian">North Indian</SelectItem>
                  <SelectItem value="South Indian">South Indian</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kpHoraryNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KP Horary Number {req}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="KP Horary Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Date {req}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type="date" className="pe-11" placeholder="dd-mm-yyyy" />
                  <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700 dark:text-neutral-200" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Time {req}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type="time" step={1} className="pe-11" />
                  <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700 dark:text-neutral-200" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2 md:col-span-2 xl:col-span-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="h-11 px-8" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/astro-form/reports">View Reports</Link>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AstroFormForm;
