# Form Error Handling Guide

This guide explains how to properly handle Zod validation errors in React Hook Form to display them in the UI instead of just showing them in the console.

## Problem
When using Zod with React Hook Form, validation errors like this:
```javascript
ZodError: [
  {
    "origin": "string",
    "code": "too_small", 
    "minimum": 1,
    "inclusive": true,
    "path": ["name"],
    "message": "Name is required"
  }
]
```

Only appear in the console instead of being displayed in the UI.

## Solution

### 1. Extract formState.errors from useForm
```typescript
const methods = useForm<YourSchemaType>({
  resolver: zodResolver(yourSchema),
  defaultValues: {
    name: '',
    // ... other fields
  },
});

// Extract errors from formState
const { formState: { errors } } = methods;
```

### 2. Pass errors to InputGroup components
```typescript
<InputGroup
  label="Name"
  name="name"
  id="name"
  placeholder="Enter name"
  error={errors?.name?.message}  // ✅ Pass the error message
/>
```

### 3. Complete Working Example
```typescript
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Form } from '../../../components/common/Form';

// Define your schema
const mySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
});

type MySchemaType = z.infer<typeof mySchema>;

const MyForm: React.FC = () => {
  const methods = useForm<MySchemaType>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // ✅ Extract errors from formState
  const { formState: { errors } } = methods;

  const onSubmit = async (data: MySchemaType) => {
    try {
      // Handle form submission
      console.log(data);
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form<MySchemaType>
        mode="all"
        schema={mySchema}
        onSubmit={onSubmit}
      >
        {/* ✅ Pass errors to each field */}
        <InputGroup
          label="Name"
          name="name"
          id="name"
          placeholder="Enter name"
          error={errors?.name?.message}
        />
        
        <InputGroup
          label="Email"
          name="email"
          id="email"
          placeholder="Enter email"
          error={errors?.email?.message}
        />

        <button type="submit">Submit</button>
      </Form>
    </FormProvider>
  );
};
```

## How InputGroup Handles Errors

The InputGroup component is already set up to display errors:

```typescript
export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  error,  // ✅ Receives error prop
  ...props
}) => {
  return (
    <div>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        error={error}  // ✅ Passes error to Input component
        {...register(name)}
        {...props}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </div>
  );
};
```

## Key Points

1. **Always extract errors**: Use `const { formState: { errors } } = methods;`
2. **Pass to each field**: Add `error={errors?.fieldName?.message}` to each InputGroup
3. **Optional chaining**: Use `?.` to safely access nested properties
4. **Zod message**: The `.message` property contains the custom error message from your schema

## Forms That Need This Fix

✅ **Fixed**:
- RoleForm.tsx
- FeatureForm.tsx  
- VenueCategoryForm.tsx
- VendorCategoryForm.tsx
- VendorForm.tsx

❌ **May need checking**:
- Any other forms using Zod validation without proper error display

## Testing

To test error display:
1. Submit an empty form
2. Check that validation errors appear below the respective input fields in the UI
3. Verify that console errors are also displayed as user-friendly messages
