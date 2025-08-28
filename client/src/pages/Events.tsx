import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '../contexts/EventContext';
import EventCard from '../components/EventCard';
import SearchFilter from '../components/SearchFilter';

const Events: React.FC = () => {
  const { events } = useEvents();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter((event: any) => {
      const matchesQuery = !searchQuery || 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.creator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.country?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = !locationFilter || 
        event.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCountry = !countryFilter || 
        event.country?.toLowerCase().includes(countryFilter.toLowerCase());
      
      return matchesQuery && matchesLocation && matchesCountry;
    });
  }, [events, searchQuery, locationFilter, countryFilter]);

  const handleSearch = (query: string, location?: string, country?: string) => {
    setSearchQuery(query);
    setLocationFilter(location || '');
    setCountryFilter(country || '');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover <span className="bg-gradient-primary bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find amazing events happening in your area or create your own to bring people together.
          </p>
          
          {/* Search */}
          <div className="flex justify-center max-w-4xl mx-auto">
            <div className="flex-1 w-full max-w-2xl">
              <SearchFilter onSearch={handleSearch} />
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard
                    event={event}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="backdrop-blur-glass bg-gradient-glass border border-glass-border/30 rounded-2xl p-12 shadow-glass max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                  <div className="text-2xl">🔍</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || locationFilter 
                    ? 'Try adjusting your search criteria'
                    : 'No events available at the moment'
                  }
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Events;

