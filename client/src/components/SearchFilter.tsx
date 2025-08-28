import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface SearchFilterProps {
  onSearch: (query: string, location?: string, country?: string, dateFilter?: string) => void;
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  placeholder = "Search events..." 
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    onSearch(query, location || undefined, country || undefined, dateFilter || undefined);
  };

  const clearFilters = () => {
    setQuery('');
    setLocation('');
    setCountry('');
    setDateFilter('');
    onSearch('');
  };

  const activeFiltersCount = [location, country, dateFilter].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        {/* Main Search Bar */}
        <div className="relative backdrop-blur-glass bg-gradient-glass border border-glass-border/30 rounded-lg shadow-glass overflow-hidden">
          <div className="flex items-center">
            <div className="pl-4 pr-2">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            {/* Filter Button */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative m-1 px-3"
                >
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                align="end" 
                className="w-80 backdrop-blur-glass bg-gradient-glass border-glass-border/30 shadow-glass"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-accent" />
                      Location
                    </label>
                    <Input
                      placeholder="Enter city or location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-glass-light/10 border-glass-border/30"
                    />
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-glass-light/10 border border-glass-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">All countries</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Mexico">Mexico</option>
                      <option value="India">India</option>
                      <option value="China">China</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-glass-light/10 border border-glass-border/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">All dates</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>

                  <Button 
                    onClick={() => {
                      handleSearch();
                      setIsFilterOpen(false);
                    }}
                    className="w-full bg-gradient-primary border-0"
                  >
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="m-1 bg-gradient-accent border-0 shadow-accent-glow/50"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {location && (
              <Badge 
                variant="secondary" 
                className="bg-glass-light/20 border-glass-border/30"
              >
                <MapPin className="h-3 w-3 mr-1" />
                {location}
                <button
                  onClick={() => setLocation('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {country && (
              <Badge 
                variant="secondary" 
                className="bg-glass-light/20 border-glass-border/30"
              >
                {country}
                <button
                  onClick={() => setCountry('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {dateFilter && (
              <Badge 
                variant="secondary" 
                className="bg-glass-light/20 border-glass-border/30"
              >
                {dateFilter}
                <button
                  onClick={() => setDateFilter('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchFilter;