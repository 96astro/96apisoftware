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
import { AyuMilanSchemaType, ayuMilanSchema } from "@/lib/zod";

const req = <span className="text-red-600">*</span>;

const AyuMilanForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AyuMilanSchemaType>({
    resolver: zodResolver(ayuMilanSchema),
    defaultValues: {
      boyName: "",
      boyBirthDate: "",
      boyBirthTime: "",
      boyPlaceOfBirth: "",
      boyLatitudeDeg: "",
      boyLatitudeMin: "",
      boyLatitudeDir: "N",
      boyLongitudeDeg: "",
      boyLongitudeMin: "",
      boyLongitudeDir: "E",
      boyTimezoneOffset: "",
      boyChartStyle: "North Indian",
      boyKpHoraryNumber: "145",
      girlName: "",
      girlBirthDate: "",
      girlBirthTime: "",
      girlPlaceOfBirth: "",
      girlLatitudeDeg: "",
      girlLatitudeMin: "",
      girlLatitudeDir: "N",
      girlLongitudeDeg: "",
      girlLongitudeMin: "",
      girlLongitudeDir: "E",
      girlTimezoneOffset: "",
      girlChartStyle: "North Indian",
      girlKpHoraryNumber: "145",
    },
  });

  const onSubmit = async (values: AyuMilanSchemaType) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ayu-milan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as {
        error?: string;
        reportId?: string;
      };

      if (!response.ok || !result.reportId) {
        toast.error(result.error || "Failed to generate Ayu Milan report.");
        return;
      }

      toast.success("Ayu Milan report generated successfully.");
      router.push(`/ayu-milan/reports/${result.reportId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong while generating Ayu Milan report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h5 className="text-center font-semibold text-neutral-900 dark:text-white">ENTER DETAILS</h5>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <h4 className="text-center text-primary font-semibold">Enter Boy&apos;s details</h4>

            <FormField
              control={form.control}
              name="boyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Boy Name {req}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boyBirthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date {req}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="date" className="pe-11" />
                      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700 dark:text-neutral-200" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boyBirthTime"
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

            <FormField
              control={form.control}
              name="boyPlaceOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth {req}</FormLabel>
                  <FormControl>
                    <PlaceAutocompleteInput
                      id="boyPlaceOfBirth"
                      value={field.value}
                      onChange={field.onChange}
                      onPlaceDetailsChange={(details) => {
                        form.setValue("boyLatitudeDeg", details.latitudeDeg, { shouldValidate: true });
                        form.setValue("boyLatitudeMin", details.latitudeMin, { shouldValidate: true });
                        form.setValue("boyLatitudeDir", details.latitudeDir === "S" ? "S" : "N", { shouldValidate: true });
                        form.setValue("boyLongitudeDeg", details.longitudeDeg, { shouldValidate: true });
                        form.setValue("boyLongitudeMin", details.longitudeMin, { shouldValidate: true });
                        form.setValue("boyLongitudeDir", details.longitudeDir === "W" ? "W" : "E", { shouldValidate: true });
                        form.setValue("boyTimezoneOffset", details.timezoneOffset, { shouldValidate: true });
                      }}
                      placeholder="Enter City"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="boyLatitudeDeg"
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
                name="boyLatitudeMin"
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
                name="boyLatitudeDir"
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
                name="boyLongitudeDeg"
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
                name="boyLongitudeMin"
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
                name="boyLongitudeDir"
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
                name="boyTimezoneOffset"
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
                name="boyChartStyle"
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
                name="boyKpHoraryNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>KP Horary Number {req}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="KP Horary Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-center text-primary font-semibold">Enter Girl&apos;s details</h4>

            <FormField
              control={form.control}
              name="girlName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Girl Name {req}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girlBirthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date {req}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="date" className="pe-11" />
                      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-700 dark:text-neutral-200" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girlBirthTime"
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

            <FormField
              control={form.control}
              name="girlPlaceOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Birth {req}</FormLabel>
                  <FormControl>
                    <PlaceAutocompleteInput
                      id="girlPlaceOfBirth"
                      value={field.value}
                      onChange={field.onChange}
                      onPlaceDetailsChange={(details) => {
                        form.setValue("girlLatitudeDeg", details.latitudeDeg, { shouldValidate: true });
                        form.setValue("girlLatitudeMin", details.latitudeMin, { shouldValidate: true });
                        form.setValue("girlLatitudeDir", details.latitudeDir === "S" ? "S" : "N", { shouldValidate: true });
                        form.setValue("girlLongitudeDeg", details.longitudeDeg, { shouldValidate: true });
                        form.setValue("girlLongitudeMin", details.longitudeMin, { shouldValidate: true });
                        form.setValue("girlLongitudeDir", details.longitudeDir === "W" ? "W" : "E", { shouldValidate: true });
                        form.setValue("girlTimezoneOffset", details.timezoneOffset, { shouldValidate: true });
                      }}
                      placeholder="Enter City"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="girlLatitudeDeg"
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
                name="girlLatitudeMin"
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
                name="girlLatitudeDir"
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
                name="girlLongitudeDeg"
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
                name="girlLongitudeMin"
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
                name="girlLongitudeDir"
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
                name="girlTimezoneOffset"
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
                name="girlChartStyle"
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
                name="girlKpHoraryNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>KP Horary Number {req}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="KP Horary Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button type="submit" className="h-11 px-10" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/ayu-milan/reports">View Reports</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AyuMilanForm;
