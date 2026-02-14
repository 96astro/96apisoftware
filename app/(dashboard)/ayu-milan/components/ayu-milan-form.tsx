"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock3 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import PlaceAutocompleteInput from "@/components/shared/place-autocomplete-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AyuMilanSchemaType, ayuMilanSchema } from "@/lib/zod";

const req = <span className="text-red-600">*</span>;

const AyuMilanForm = () => {
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
    },
  });

  const onSubmit = (values: AyuMilanSchemaType) => {
    toast.success("Ayu Milan form submitted.");
    console.log("ayu-milan values", values);
  };

  const boyLatitudeDeg = form.watch("boyLatitudeDeg");
  const boyLatitudeMin = form.watch("boyLatitudeMin");
  const boyLatitudeDir = form.watch("boyLatitudeDir");
  const boyLongitudeDeg = form.watch("boyLongitudeDeg");
  const boyLongitudeMin = form.watch("boyLongitudeMin");
  const boyLongitudeDir = form.watch("boyLongitudeDir");
  const boyTimezoneOffset = form.watch("boyTimezoneOffset");

  const girlLatitudeDeg = form.watch("girlLatitudeDeg");
  const girlLatitudeMin = form.watch("girlLatitudeMin");
  const girlLatitudeDir = form.watch("girlLatitudeDir");
  const girlLongitudeDeg = form.watch("girlLongitudeDeg");
  const girlLongitudeMin = form.watch("girlLongitudeMin");
  const girlLongitudeDir = form.watch("girlLongitudeDir");
  const girlTimezoneOffset = form.watch("girlTimezoneOffset");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h5 className="text-center font-semibold text-neutral-900 dark:text-white">
          ENTER DETAILS
        </h5>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
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
                      <Clock3 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
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
            <div className="text-base text-neutral-800 dark:text-neutral-100">
              <p>
                Latitude: {boyLatitudeDeg || "--"}° {boyLatitudeMin || "--"}&apos; {boyLatitudeDir || "-"}
              </p>
              <p>
                Longitude: {boyLongitudeDeg || "--"}° {boyLongitudeMin || "--"}&apos; {boyLongitudeDir || "-"}
              </p>
              <p>
                Timezone: UTC{boyTimezoneOffset ? (Number(boyTimezoneOffset) >= 0 ? "+" : "") + boyTimezoneOffset : "--"}
              </p>
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
                      <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
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
                      <Clock3 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
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
            <div className="text-base text-neutral-800 dark:text-neutral-100">
              <p>
                Latitude: {girlLatitudeDeg || "--"}° {girlLatitudeMin || "--"}&apos; {girlLatitudeDir || "-"}
              </p>
              <p>
                Longitude: {girlLongitudeDeg || "--"}° {girlLongitudeMin || "--"}&apos; {girlLongitudeDir || "-"}
              </p>
              <p>
                Timezone: UTC{girlTimezoneOffset ? (Number(girlTimezoneOffset) >= 0 ? "+" : "") + girlTimezoneOffset : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button type="submit" className="h-11 px-10">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AyuMilanForm;
