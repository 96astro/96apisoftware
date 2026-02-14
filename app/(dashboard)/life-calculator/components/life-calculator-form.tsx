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

  const onSubmit = (values: LifeCalculatorSchemaType) => {
    toast.success("Life Calculator form submitted.");
    console.log("life-calculator values", values);
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

        <div className="md:col-span-2 xl:col-span-3 text-base text-neutral-800 dark:text-neutral-100">
          <p>
            Latitude: {latitudeDeg || "--"}° {latitudeMin || "--"}&apos; {latitudeDir || "-"}
          </p>
          <p>
            Longitude: {longitudeDeg || "--"}° {longitudeMin || "--"}&apos; {longitudeDir || "-"}
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
