import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const frameworks = [
  { value: "all", label: "All" },
  { value: "grass", label: "Grass" },
  { value: "fire", label: "Fire" },
  { value: "water", label: "Water" },
  { value: "poison", label: "Poison" },
  { value: "normal", label: "Normal" },
  { value: "flying", label: "Flying" },
  { value: "ground", label: "Ground" },
  { value: "rock", label: "Rock" },
  { value: "psychic", label: "Psychic" },
  { value: "bug", label: "Bug" },
  { value: "fairy", label: "Fairy" },
  { value: "fighting", label: "Fighting" },
  { value: "electric", label: "Electric" },
  { value: "steel", label: "Steel" },
  { value: "ice", label: "Ice" },
  { value: "ghost", label: "Ghost" },
  { value: "dragon", label: "Dragon" },
];

interface FilterProps {
  onSelectType: (type: string) => void;
}

export function Filter({ onSelectType }: FilterProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Filter by Type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No Type found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onSelectType(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Filter;
