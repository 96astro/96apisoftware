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
import { LifeCalculatorSchemaType, lifeCalculatorSchema } from "@/lib/zod";

const req = <span className="text-red-600">*</span>;

const LifeCalculatorForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LifeCalculatorSchemaType>({
    resolver: zodResolver(lifeCalculatorSchema),
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
      birthDate: "",
      birthTime: "",
    },
  });

  const onSubmit = async (values: LifeCalculatorSchemaType) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/life-calculator", {
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
        toast.error(result.error || "Failed to generate report.");
        return;
      }

      toast.success("Report generated successfully.");
      router.push(`/life-calculator/reports/${result.reportId}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong while generating the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const latitudeDeg = form.watch("latitudeDeg");
  const latitudeMin = form.watch("latitudeMin");
  const latitudeDir = form.watch("latitudeDir");
  const longitudeDeg = form.watch("longitudeDeg");
  const longitudeMin = form.watch("longitudeMin");
  const longitudeDir = form.watch("longitudeDir");
  const timezoneOffset = form.watch("timezoneOffset");

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
                  id="placeOfBirth"
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

        <div className="text-base text-neutral-800 md:col-span-2 xl:col-span-3 dark:text-neutral-100">
          <p>
            Latitude: {latitudeDeg || "--"} deg {latitudeMin || "--"}&apos; {latitudeDir || "-"}
          </p>
          <p>
            Longitude: {longitudeDeg || "--"} deg {longitudeMin || "--"}&apos; {longitudeDir || "-"}
          </p>
          <p>
            Timezone: UTC{timezoneOffset ? (Number(timezoneOffset) >= 0 ? "+" : "") + timezoneOffset : "--"}
          </p>
        </div>

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
              <Link href="/life-calculator/reports">View Reports</Link>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LifeCalculatorForm;
