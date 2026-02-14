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
      boyLatitude: "",
      boyLongitude: "",
      boyTimezone: "",
      girlName: "",
      girlBirthDate: "",
      girlBirthTime: "",
      girlPlaceOfBirth: "",
      girlLatitude: "",
      girlLongitude: "",
      girlTimezone: "",
    },
  });

  const onSubmit = (values: AyuMilanSchemaType) => {
    toast.success("Ayu Milan form submitted.");
    console.log("ayu-milan values", values);
  };

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
                      onPlaceDetailsChange={({ latitude, longitude, timezone }) => {
                        form.setValue("boyLatitude", latitude, { shouldValidate: true });
                        form.setValue("boyLongitude", longitude, { shouldValidate: true });
                        form.setValue("boyTimezone", timezone, { shouldValidate: true });
                      }}
                      placeholder="Enter City"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boyLatitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Latitude" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boyLongitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Longitude" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="boyTimezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone (UTC Offset)</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Timezone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      onPlaceDetailsChange={({ latitude, longitude, timezone }) => {
                        form.setValue("girlLatitude", latitude, { shouldValidate: true });
                        form.setValue("girlLongitude", longitude, { shouldValidate: true });
                        form.setValue("girlTimezone", timezone, { shouldValidate: true });
                      }}
                      placeholder="Enter City"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girlLatitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Latitude" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girlLongitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Longitude" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="girlTimezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone (UTC Offset)</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="Timezone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
