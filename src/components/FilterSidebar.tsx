
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Filter, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample data - in a real app, these would come from the database
const COMPANIES = ['Google', 'Amazon', 'Apple', 'Microsoft', 'Facebook', 'Netflix', 'Tesla', 'Twitter', 'Bloomberg'];

const NEIGHBORHOODS = [
  "Downtown", "Midtown", "Uptown", "Financial District", 
  "SoHo", "West Village", "East Village", "Chelsea", "Brooklyn",
  "Queens", "Harlem", "The Bronx", "Jersey City", "Hoboken"
];

const LIFESTYLE_TAGS = [
  "Early bird", "Night owl", "Gym enthusiast", "Cook at home",
  "Vegetarian", "Vegan", "Social", "Quiet", "Clean", "Studious",
  "Pet-friendly", "Non-smoker", "Occasional drinker", "Non-drinker",
  "Tech", "Arts", "Music", "Outdoors", "Travel", "Reading"
];

interface FilterSidebarProps {
  filters: {
    gender: string[];
    company: string[];
    officeLocation: string[];
    neighborhood: string[];
    budgetMin: number;
    budgetMax: number;
    hasCar: boolean | null;
    lifestyleTags: string[];
  };
  onFilterChange: (filters: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const FilterSidebar = ({ 
  filters, 
  onFilterChange,
  onApplyFilters,
  onResetFilters
}: FilterSidebarProps) => {
  const handleGenderChange = (genders: string[]) => {
    onFilterChange({ gender: genders });
  };

  const handleCompanyChange = (company: string, checked: boolean) => {
    const newCompanies = checked
      ? [...filters.company, company]
      : filters.company.filter(c => c !== company);
    onFilterChange({ company: newCompanies });
  };

  const handleNeighborhoodChange = (neighborhood: string, checked: boolean) => {
    const newNeighborhoods = checked
      ? [...filters.neighborhood, neighborhood]
      : filters.neighborhood.filter(n => n !== neighborhood);
    onFilterChange({ neighborhood: newNeighborhoods });
  };

  const handleLifestyleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.lifestyleTags, tag]
      : filters.lifestyleTags.filter(t => t !== tag);
    onFilterChange({ lifestyleTags: newTags });
  };

  const handleBudgetChange = (value: number[]) => {
    onFilterChange({ budgetMin: value[0], budgetMax: value[1] });
  };

  const handleHasCarChange = (value: string) => {
    onFilterChange({ hasCar: value === 'yes' ? true : value === 'no' ? false : null });
  };

  return (
    <ScrollArea className="h-screen py-6 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h3>
          <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <Separator />

        <Accordion type="multiple" defaultValue={["gender", "budget", "car"]} className="w-full">
          <AccordionItem value="gender">
            <AccordionTrigger>Gender</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {["male", "female", "nonbinary", "other"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`gender-${gender}`} 
                        checked={filters.gender.includes(gender)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleGenderChange([...filters.gender, gender]);
                          } else {
                            handleGenderChange(filters.gender.filter(g => g !== gender));
                          }
                        }}
                      />
                      <Label htmlFor={`gender-${gender}`} className="capitalize">
                        {gender === "nonbinary" ? "Non-binary" : gender}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="companies">
            <AccordionTrigger>Companies</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {COMPANIES.map((company) => (
                  <div key={company} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`company-${company}`} 
                      checked={filters.company.includes(company)}
                      onCheckedChange={(checked) => {
                        handleCompanyChange(company, !!checked);
                      }}
                    />
                    <Label htmlFor={`company-${company}`}>{company}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="neighborhoods">
            <AccordionTrigger>Neighborhoods</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {NEIGHBORHOODS.map((neighborhood) => (
                    <div key={neighborhood} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`neighborhood-${neighborhood}`} 
                        checked={filters.neighborhood.includes(neighborhood)}
                        onCheckedChange={(checked) => {
                          handleNeighborhoodChange(neighborhood, !!checked);
                        }}
                      />
                      <Label htmlFor={`neighborhood-${neighborhood}`} className="text-sm">
                        {neighborhood}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="budget">
            <AccordionTrigger>Budget Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-1">
                <Slider
                  defaultValue={[filters.budgetMin, filters.budgetMax]}
                  max={5000}
                  min={500}
                  step={100}
                  onValueChange={handleBudgetChange}
                />
                <div className="flex justify-between text-sm">
                  <span>${filters.budgetMin}</span>
                  <span>${filters.budgetMax}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="car">
            <AccordionTrigger>Has Car</AccordionTrigger>
            <AccordionContent>
              <RadioGroup 
                defaultValue={filters.hasCar === null ? 'any' : filters.hasCar ? 'yes' : 'no'}
                onValueChange={handleHasCarChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="car-any" />
                  <Label htmlFor="car-any">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="car-yes" />
                  <Label htmlFor="car-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="car-no" />
                  <Label htmlFor="car-no">No</Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lifestyle">
            <AccordionTrigger>Lifestyle & Interests</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {LIFESTYLE_TAGS.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}`} 
                        checked={filters.lifestyleTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          handleLifestyleTagChange(tag, !!checked);
                        }}
                      />
                      <Label htmlFor={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button onClick={onApplyFilters} className="w-full mt-4">
          Apply Filters
        </Button>
      </div>
    </ScrollArea>
  );
};
