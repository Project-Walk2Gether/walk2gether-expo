import React from 'react';
import { FormInput } from '@/components/FormInput';

interface Props {
  notes: string;
  setNotes: (text: string) => void;
  onFocus: () => void;
}

const LocationNotes: React.FC<Props> = ({
  notes,
  setNotes,
  onFocus,
}) => {
  return (
    <FormInput
      label="Meetup location (optional)"
      placeholder="Add details about where to meet"
      value={notes}
      onChangeText={setNotes}
      multiline
      numberOfLines={3}
      onFocus={onFocus}
    />
  );
};

export default LocationNotes;
