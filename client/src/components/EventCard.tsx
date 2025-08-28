import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Bell, X } from 'lucide-react';
import { Event, useEvents } from '../contexts/EventContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '../hooks/use-toast';
import EventStatusEditor from './EventStatusEditor';
import EventManagementActions from './EventManagementActions';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const { currentUser, unbookEvent, users } = useEvents();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State for display toggles
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  
  const isCreator = currentUser?.id === event.createdBy;
  const isBooked = currentUser?.bookedEvents?.includes(event.id) || false;
  const isFull = (event.bookedSlots || 0) >= (event.totalSlots || 1);
  const isCancelled = event.status === 'cancelled';

  // Check if event date has passed
  const eventDate = new Date(event.date);
  const now = new Date();
  // Set time to end of day for event date to allow booking until end of event day
  eventDate.setHours(23, 59, 59, 999);
  const isPastEvent = eventDate < now;

  const canBook = currentUser && !isCreator && !isFull && !isBooked && !isCancelled && !isPastEvent;
  const canUnbook = currentUser && isBooked;

  // Get creator user data
  const creatorUser = users.find(user => user.id === event.createdBy);
  
  // Ensure backward compatibility with events that might not have createdByName
  const eventCreatorName = event.createdByName || creatorUser?.name || 'Unknown User';
  
  // Filter out placeholder/invalid URLs
  const isValidImageUrl = (url: string) => {
    return url && 
           !url.includes('example.com') && 
           !url.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') &&
           url.length > 10;
  };
  
  const validCreatedByAvatar = event.createdByAvatar && isValidImageUrl(event.createdByAvatar) ? event.createdByAvatar : null;
  const validDisplayPicture = creatorUser?.displayPicture && isValidImageUrl(creatorUser.displayPicture) ? creatorUser.displayPicture : null;
  const validAvatar = creatorUser?.avatar && isValidImageUrl(creatorUser.avatar) ? creatorUser.avatar : null;
  
  const eventCreatorAvatar = validCreatedByAvatar || validDisplayPicture || validAvatar;

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$',
      JPY: '¥', KRW: '₩', BRL: 'R$', MXN: '$', INR: '₹',
      CNY: '¥', NGN: '₦', ZAR: 'R', KES: 'KSh', GHS: '₵'
    };
    return symbols[currency || 'USD'] || (currency || 'USD');
  };

  const getStartingPrice = () => {
    try {
      if (event.ticketPricing && typeof event.ticketPricing === 'object') {
        const prices = Object.values(event.ticketPricing)
          .map((d: any) => (d && typeof d.price === 'number') ? d.price : Infinity);
        const min = Math.min(...prices);
        return isFinite(min) ? min : undefined;
      }
      const single = (event as any).price;
      return typeof single === 'number' ? single : undefined;
    } catch {
      return undefined;
    }
  };

  const handleBook = () => {
    if (canBook) {
      // Navigate to booking page instead of direct booking
      navigate(`/book/${event.id}`);
    }
  };

  const handleUnbook = () => {
    if (canUnbook) {
      unbookEvent(event.id);
      toast({
        title: 'Booking Cancelled',
        description: `You have cancelled your booking for "${event.title}".`,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const formatted = new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Debug logging for date formatting
    if (event.status === 'postponed') {
      console.log('📅 EventCard formatDate debug:', {
        eventId: event.id,
        inputDate: dateStr,
        formattedDate: formatted,
        eventStatus: event.status,
        eventDate: event.date
      });
    }

    return formatted;
  };

  const getAvailabilityColor = () => {
    const percentage = ((event.bookedSlots || 0) / (event.totalSlots || 1)) * 100;
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
      <Card className={`backdrop-blur-glass bg-gradient-glass border-glass-border/30 shadow-glass hover:shadow-accent-glow/20 transition-all duration-300 overflow-hidden ${
        isCancelled ? 'opacity-75 grayscale' : ''
      }`}>
        {/* Event Images */}
        {event.images && event.images.length > 0 && (
          <div className="relative">
            {!showAllImages ? (
              <div className="relative">
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Event Status Badge */}
                {((event.status && event.status !== 'active') || isPastEvent) && (
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={
                        event.status === 'cancelled' ? 'destructive' :
                        event.status === 'postponed' ? 'secondary' :
                        isPastEvent ? 'outline' : 'default'
                      }
                      className="bg-black/80 text-white font-bold px-2 py-1 text-xs"
                    >
                      {event.status === 'postponed' && '⏰ POSTPONED'}
                      {event.status === 'cancelled' && '❌ CANCELLED'}
                      {event.status === 'updated' && '📝 UPDATED'}
                      {isPastEvent && (!event.status || event.status === 'active') && '🏁 ENDED'}
                    </Badge>
                  </div>
                )}

                {event.images.length > 1 && (
                  <button
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllImages(true);
                    }}
                  >
                    +{event.images.length - 1} more
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex overflow-x-auto space-x-2 p-2 bg-black/5">
                  {event.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${event.title} ${index + 1}`}
                      className="h-32 w-48 object-cover rounded flex-shrink-0"
                    />
                  ))}
                </div>
                <button
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllImages(false);
                  }}
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Event Overlay */}
        {isCancelled && (
          <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
            <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg font-bold text-sm">
              ❌ EVENT CANCELLED
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground mb-1">
                {event.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {eventCreatorAvatar ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={eventCreatorAvatar} alt={eventCreatorName} />
                    <AvatarFallback className="text-xs">
                      {eventCreatorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gradient-primary text-primary-foreground">
                      {eventCreatorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <p className="text-sm text-muted-foreground">
                  by <button 
                    className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${event.createdBy}`);
                    }}
                  >
                    {eventCreatorName}
                  </button>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              {event.status === 'postponed' && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                  Postponed
                </Badge>
              )}
              {event.status === 'cancelled' && (
                <Badge variant="destructive">
                  Cancelled
                </Badge>
              )}
              <Badge
                variant={getAvailabilityColor() === 'success' ? 'default' : 'destructive'}
                className="shrink-0"
              >
                {event.bookedSlots || 0}/{event.totalSlots || 0}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-foreground/80 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-accent" />
              <div className="flex flex-col">
                {event.status === 'postponed' ? (
                  <>
                    <span className="text-foreground font-medium flex items-center">
                      {formatDate(event.date)}
                      <Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-800 border-amber-200">
                        {event.statusDetails?.originalDate ? 'New Date' : 'Postponed'}
                      </Badge>
                    </span>
                    {event.statusDetails?.originalDate && (
                      <span className="text-xs text-muted-foreground line-through">
                        Originally: {formatDate(event.statusDetails.originalDate)}
                      </span>
                    )}
                    {event.statusDetails?.newTime && event.statusDetails?.originalTime &&
                     event.statusDetails.newTime !== event.statusDetails.originalTime && (
                      <span className="text-xs text-amber-600 font-medium">
                        Time changed: {event.statusDetails.originalTime} → {event.statusDetails.newTime}
                      </span>
                    )}
                  </>
                ) : (
                  formatDate(event.date)
                )}
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 text-accent" />
              <div className="flex flex-col">
                {event.status === 'postponed' && event.statusDetails?.originalTime ? (
                  <>
                    <span className="text-foreground font-medium">
                      {event.time}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      Originally: {event.statusDetails.originalTime}
                    </span>
                  </>
                ) : (
                  event.time
                )}
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-accent" />
              <div className="flex flex-col">
                {event.status === 'postponed' && event.statusDetails?.originalLocation &&
                 event.statusDetails.newLocation && event.statusDetails.newLocation !== event.statusDetails.originalLocation ? (
                  <>
                    <span className="text-foreground font-medium flex items-center">
                      {event.location}
                      <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800 border-blue-200">
                        New Location
                      </Badge>
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      Originally: {event.statusDetails.originalLocation}
                    </span>
                  </>
                ) : event.status === 'postponed' && event.statusDetails?.originalLocation ? (
                  <>
                    <span className="text-foreground font-medium">
                      {event.location}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      Originally: {event.statusDetails.originalLocation}
                    </span>
                  </>
                ) : (
                  event.location
                )}
              </div>
            </div>

            {/* Availability, capacity, and starting price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground gap-3">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-accent" />
                  {(event.totalSlots || event.capacity || 0) - (event.bookedSlots || 0)} spots available
                </span>
                <span className="text-xs text-muted-foreground">
                  Capacity: {event.totalSlots || event.capacity || 0}
                </span>
              </div>
              {getStartingPrice() !== undefined && (
                <div className="text-sm font-semibold">
                  From {getCurrencySymbol(event.currency || 'USD')}{getStartingPrice()}
                </div>
              )}
            </div>

            {/* Event Status Information */}
            {event.status && event.status !== 'active' && event.statusDetails && (
              <div className="p-2 rounded-md bg-muted/50 border border-muted-foreground/20">
                <div className="flex items-start space-x-2">
                  <div className="text-xs">
                    {event.status === 'postponed' && '⏰'}
                    {event.status === 'cancelled' && '❌'}
                    {event.status === 'updated' && '📝'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground capitalize">
                      {event.status} Event
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.statusDetails?.message || 'Event is active and ready for bookings'}
                    </p>
                    {event.status === 'postponed' && (
                      <div className="mt-2 space-y-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            📅 New Date: {formatDate(event.date)}
                          </Badge>
                          {event.statusDetails?.newTime && event.statusDetails.newTime !== event.statusDetails?.originalTime && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              🕒 New Time: {event.statusDetails.newTime}
                            </Badge>
                          )}
                          {event.statusDetails?.newLocation && event.statusDetails.newLocation !== event.statusDetails?.originalLocation && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              📍 New Location: {event.statusDetails.newLocation}
                            </Badge>
                          )}
                        </div>
                        {event.statusDetails?.updatedAt && (
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(event.statusDetails.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    {event.status === 'updated' && event.statusDetails?.newLocation && (
                      <p className="text-xs text-accent mt-1">
                        New location: {event.statusDetails.newLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-accent" />
              {(event.totalSlots || 0) - (event.bookedSlots || 0)} spots available
            </div>
            {/* Ticket Pricing Display */}
            {event.ticketPricing ? (
              <div className="pt-2 border-t border-glass-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tickets:</span>
                  <div className="flex items-center gap-2">
                    {(event.paymentMethod === 'pay-at-event' || event.paymentMethod === 'both') && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Pay at Event
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Multiple types
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {Object.entries(event.ticketPricing)
                    .filter(([_, details]) => details.slots > 0)
                    .slice(0, showAllTickets ? undefined : 2) // Show all or just 2
                    .map(([type, details]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{type.replace(/([A-Z])/g, ' $1').replace(/For/g, 'for')}:</span>
                        <span className="font-semibold text-primary">{getCurrencySymbol(event.currency)}{details.price}</span>
                      </div>
                    ))}
                  {Object.entries(event.ticketPricing).filter(([_, details]) => details.slots > 0).length > 2 && (
                    <button
                      className="text-xs text-muted-foreground text-center hover:text-primary transition-colors cursor-pointer w-full py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllTickets(!showAllTickets);
                      }}
                    >
                      {showAllTickets 
                        ? 'Show Less' 
                        : `+${Object.entries(event.ticketPricing).filter(([_, details]) => details.slots > 0).length - 2} more types`
                      }
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="pt-3 flex gap-2 flex-wrap">
            {isCreator ? (
              <EventManagementActions event={event} onEdit={onEdit} />
            ) : currentUser ? (
              isBooked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnbook}
                  className="flex-1 bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBook}
                  disabled={!canBook}
                  className="flex-1 bg-gradient-accent border-0 shadow-accent-glow/50 disabled:opacity-50 disabled:shadow-none"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isCancelled ? 'Event Cancelled' :
                   isPastEvent ? 'Event Ended' :
                   isFull ? 'Fully Booked' : 'Book Now'}
                </Button>
              )
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 bg-glass-light/10 border-glass-border/30"
              >
                <Bell className="h-4 w-4 mr-2" />
                Login to Book
              </Button>
        )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  </>);
};

export default EventCard;