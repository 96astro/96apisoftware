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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LifeCalculatorSchemaType,
  lifeCalculatorSchema,
} from "@/lib/zod";

const req = <span className="text-red-600">*</span>;

const LifeCalculatorForm = () => {
  const form = useForm<LifeCalculatorSchemaType>({
    resolver: zodResolver(lifeCalculatorSchema),
    defaultValues: {
      name: "",
      gender: undefined,
      placeOfBirth: "",
      latitude: "",
      longitude: "",
      timezone: "",
      birthDate: "",
      birthTime: "",
    },
  });

  const onSubmit = (values: LifeCalculatorSchemaType) => {
    toast.success("Life Calculator form submitted.");
    console.log("life-calculator values", values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                      onPlaceDetailsChange={({ latitude, longitude, timezone }) => {
                        form.setValue("latitude", latitude, { shouldValidate: true });
                        form.setValue("longitude", longitude, { shouldValidate: true });
                        form.setValue("timezone", timezone, { shouldValidate: true });
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
          name="latitude"
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
          name="longitude"
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
          name="timezone"
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

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Date {req}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type="date"
                    className="pe-11"
                    placeholder="dd-mm-yyyy"
                  />
                  <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
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
                  <Input
                    {...field}
                    type="time"
                    step={1}
                    className="pe-11"
                  />
                  <Clock3 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-700 dark:text-neutral-200 pointer-events-none" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 xl:col-span-3 pt-2">
          <Button type="submit" className="h-11 px-8">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LifeCalculatorForm;
