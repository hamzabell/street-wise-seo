'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';
import { locationService, LocationSuggestion } from '@/lib/seo/location-service';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., New York, Los Angeles, or leave empty for general topics",
  disabled = false,
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search function
  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await locationService.getLocationSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (err) {
      console.error('Error searching locations:', err);
      setError('Failed to fetch location suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setError(null);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const formattedValue = locationService.formatSuggestionForDisplay(suggestion);
    onChange(formattedValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle "locate me" button click
  const handleLocateMe = async () => {
    setIsLocating(true);
    setError(null);

    try {
      const location = await locationService.getLocationFromGeolocation();
      onChange(location);
      setShowSuggestions(false);
      setSuggestions([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get your location';
      setError(errorMessage);
      console.error('Error getting geolocation:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Handle clear location
  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const firstSuggestion = suggestionsRef.current?.querySelector('[data-suggestion-index="0"]') as HTMLElement;
        firstSuggestion?.focus();
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.focus();
        break;
    }
  };

  // Handle suggestion keyboard navigation
  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    suggestion: LocationSuggestion
  ) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSuggestionSelect(suggestion);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % suggestions.length;
        const nextSuggestion = suggestionsRef.current?.querySelector(
          `[data-suggestion-index="${nextIndex}"]`
        ) as HTMLElement;
        nextSuggestion?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index === 0 ? suggestions.length - 1 : index - 1;
        const prevSuggestion = suggestionsRef.current?.querySelector(
          `[data-suggestion-index="${prevIndex}"]`
        ) as HTMLElement;
        prevSuggestion?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        inputRef.current?.focus();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !suggestionsRef.current?.contains(target) &&
        !inputRef.current?.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled || isLoading || isLocating}
          className={`pr-20 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />

        {/* Loading spinner */}
        {(isLoading || isLocating) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Clear button */}
        {!isLoading && !isLocating && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              data-suggestion-index={index}
              className="w-full text-left px-3 py-3 text-sm hover:bg-muted transition-colors touch-manipulation active:scale-[0.98] border-b border-border last:border-b-0"
              onClick={() => handleSuggestionSelect(suggestion)}
              onKeyDown={(e) => handleSuggestionKeyDown(e, index, suggestion)}
              disabled={disabled}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">
                    {locationService.formatSuggestionForDisplay(suggestion)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Locate me button */}
      <div className="mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLocateMe}
          disabled={disabled || isLocating}
          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
        >
          <MapPin className="h-3 w-3 mr-1" />
          {isLocating ? 'Locating...' : 'Locate Me'}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground mt-1">
        Adding a location helps generate locally-relevant topics
      </p>
    </div>
  );
}