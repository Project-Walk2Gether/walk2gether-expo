import React from 'react';
import { FormInput } from '@/components/FormInput';

interface Props {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  touched?: boolean;
}

const LocationNotesField: React.FC<Props> = ({
  value,
  onChange,
  error,
  touched,
}) => {
  return (
    <FormInput
      label="Meetup location (optional)"
      placeholder="Add details about where to meet"
      value={value}
      onChangeText={onChange}
      multiline
      numberOfLines={3}
      error={error}
      touched={touched}
    />
  );
};

export default LocationNotesField;
