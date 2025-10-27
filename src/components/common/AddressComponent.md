# AddressComponent

A comprehensive address input component with location functionality.

## Features

- ✅ **Address Line 1 & 2**: Text inputs for detailed address
- ✅ **Country, State, City**: Dropdown selections with Indian states/cities data
- ✅ **Pincode**: Auto-populated based on selected city
- ✅ **Location Option**: Map-based location selection (placeholder for integration)
- ✅ **Auto-generated Full Address**: Combines all fields into a complete address
- ✅ **Validation Support**: Error handling for each field
- ✅ **Responsive Design**: Works on mobile and desktop

## Usage

### Basic Usage

```tsx
import AddressComponent, { AddressData } from '../common/AddressComponent';

const MyForm = () => {
  const [address, setAddress] = useState<AddressData>({
    address1: '',
    address2: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    latitude: undefined,
    longitude: undefined,
    fullAddress: ''
  });

  return (
    <AddressComponent
      value={address}
      onChange={setAddress}
      required={true}
      showLocationOption={true}
      label="Business Address"
    />
  );
};
```

### With Validation

```tsx
const [errors, setErrors] = useState({});

const validateAddress = () => {
  const newErrors = {};
  
  if (!address.address1.trim()) {
    newErrors.address1 = 'Address line 1 is required';
  }
  if (!address.state.trim()) {
    newErrors.state = 'State is required';
  }
  // ... more validation
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<AddressComponent
  value={address}
  onChange={setAddress}
  errors={errors}
  required={true}
/>
```

### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [address, setAddress] = useState<AddressData>({...});

  const onSubmit = (data) => {
    console.log('Form data:', data);
    console.log('Address data:', address);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddressComponent
        value={address}
        onChange={setAddress}
        required={true}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `AddressData` | `{}` | Current address data |
| `onChange` | `(address: AddressData) => void` | - | Callback when address changes |
| `errors` | `Partial<Record<keyof AddressData, string>>` | `{}` | Validation errors for each field |
| `required` | `boolean` | `false` | Whether fields are required |
| `showLocationOption` | `boolean` | `true` | Show location picker button |
| `className` | `string` | `''` | Additional CSS classes |
| `label` | `string` | `'Address'` | Component label |

## AddressData Interface

```tsx
interface AddressData {
  address1: string;        // Required address line
  address2: string;        // Optional address line
  country: string;         // Country name
  state: string;           // State/Province
  city: string;            // City name
  pincode: string;         // Postal/ZIP code
  latitude?: number;       // GPS latitude (optional)
  longitude?: number;      // GPS longitude (optional)
  fullAddress?: string;    // Auto-generated complete address
}
```

## Features

### 1. Smart State/City/Pincode Selection
- States are loaded from Indian states data
- Cities are filtered based on selected state
- Pincodes are filtered based on selected city
- Auto-resets dependent fields when parent changes

### 2. Location Integration
- Location picker button opens modal
- Placeholder for map integration
- Stores GPS coordinates
- Updates full address with location data

### 3. Auto-generated Full Address
- Combines all address fields
- Updates automatically when any field changes
- Excludes empty fields
- Formatted as comma-separated string

### 4. Validation Support
- Individual field error display
- Required field indicators
- Custom error messages
- Real-time validation feedback

## Integration Notes

### Map Integration
The location picker currently shows a placeholder. To integrate with a map:

1. Replace the placeholder in the location modal
2. Use your preferred map library (Google Maps, Leaflet, etc.)
3. Handle location selection and call `handleLocationSelect(lat, lng, address)`

### Data Source
The component uses `indianStatesAndPincodes` data. To support other countries:

1. Extend the data structure
2. Add country selection logic
3. Update state/city/pincode filtering

### Styling
The component uses Tailwind CSS classes. Customize by:

1. Passing custom `className` prop
2. Modifying the component's internal classes
3. Using CSS-in-JS or styled-components

## Examples

See the demo files:
- `AddressDemo.tsx` - Complete demo with validation
- `AddressUsageExample.tsx` - Integration with forms
