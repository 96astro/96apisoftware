"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";

type CountryCodeComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
};

const getFlagUrl = (iso2: string) =>
  `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;

const CountryCodeCombobox = ({
  value,
  onChange,
  name,
  disabled,
  className,
}: CountryCodeComboboxProps) => {
  const [open, setOpen] = useState(false);
  const countryCodeOptions = useMemo(() => {
    return getCountries()
      .map((country) => ({
        iso2: country,
        name: en[country] ?? country,
        dialCode: `+${getCountryCallingCode(country)}`,
      }))
      .sort((a, b) => {
        const byName = a.name.localeCompare(b.name);
        if (byName !== 0) return byName;
        return a.dialCode.localeCompare(b.dialCode);
      });
  }, []);

  const selectedOption = useMemo(() => {
    return countryCodeOptions.find((opt) => opt.dialCode === value) ?? null;
  }, [countryCodeOptions, value]);

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-12 w-full justify-between rounded-lg border-neutral-300 bg-transparent px-4 font-normal !text-neutral-700 hover:!text-neutral-700 hover:bg-transparent dark:border-neutral-600 dark:bg-slate-900/30 dark:!text-neutral-100 dark:hover:!text-neutral-100",
              className
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              {selectedOption ? (
                <img
                  src={getFlagUrl(selectedOption.iso2)}
                  alt={`${selectedOption.iso2} flag`}
                  className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
                />
              ) : null}
              <span className="truncate text-sm">
                {selectedOption
                  ? `${selectedOption.iso2} (${selectedOption.dialCode})`
                  : "Select country code"}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[1200] min-w-[320px] p-0"
          align="start"
          sideOffset={6}
        >
          <Command>
            <CommandInput placeholder="Search country code..." />
            <CommandList className="max-h-72">
              <CommandEmpty>No country code found.</CommandEmpty>
              <CommandGroup>
                {countryCodeOptions.map((option) => (
                  <CommandItem
                    key={`${option.iso2}-${option.dialCode}`}
                    value={`${option.iso2} ${option.name} ${option.dialCode}`}
                    className="!text-neutral-800 hover:!text-neutral-800 aria-selected:bg-primary/10 aria-selected:!text-neutral-900 dark:!text-neutral-100 dark:hover:!text-neutral-100 dark:aria-selected:bg-primary/20 dark:aria-selected:!text-white"
                    onSelect={() => {
                      onChange(option.dialCode);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === option.dialCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate text-sm">
                      <span className="inline-flex items-center gap-2">
                        <img
                          src={getFlagUrl(option.iso2)}
                          alt={`${option.iso2} flag`}
                          className="h-3.5 w-5 rounded-[2px] object-cover"
                        />
                        <span>
                          {option.iso2} ({option.dialCode}) {option.name}
                        </span>
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default CountryCodeCombobox;
