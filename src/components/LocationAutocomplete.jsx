import React, { useState, useEffect } from 'react';
import { Autocomplete } from '@mantine/core';
import axios from 'axios';

export const LocationAutocomplete = ({
    value,
    onChange,
    label = "Adresse du chantier",
    placeholder = "Entrez l'adresse du chantier"
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [inputValue, setInputValue] = useState(value || '');

    // Add this useEffect to set the initial value when the component mounts or value changes
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch location suggestions
    const fetchSuggestions = async (query) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: query,
                    format: 'json',
                    limit: 5
                }
            });

            // Create unique suggestions by using a combination of display_name and osm_id
            const suggestionData = response.data.map(location => ({
                value: `${location.osm_id}-${location.display_name}`, // Ensure uniqueness
                label: location.display_name,
                originalValue: location.display_name,
                lat: location.lat,
                lon: location.lon
            }));

            // Remove duplicates based on original display_name
            const uniqueSuggestions = Array.from(
                new Map(suggestionData.map(item => [item.originalValue, item]))
                    .values()
            );

            setSuggestions(uniqueSuggestions);
        } catch (error) {
            console.error('Error fetching location suggestions', error);
            setSuggestions([]);
        }
    };

    // Debounced suggestion fetching
    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

    // Handle input change
    const handleInputChange = (value) => {
        setInputValue(value);
        debouncedFetchSuggestions(value);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (selectedValue) => {
        const selectedSuggestion = suggestions.find(s => s.value === selectedValue);

        if (selectedSuggestion) {
            setInputValue(selectedSuggestion.originalValue);
            onChange({
                adresse_chantier: selectedSuggestion.originalValue,
                latitude: parseFloat(selectedSuggestion.lat),
                longitude: parseFloat(selectedSuggestion.lon)
            });
        }
    };

    return (
        <Autocomplete
            label={label}
            placeholder={placeholder}
            value={inputValue}
            data={suggestions}
            onChange={handleInputChange}
            onOptionSubmit={handleSuggestionSelect}
            withAsterisk
        />
    );
};

export default LocationAutocomplete;