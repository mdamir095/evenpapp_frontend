import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputGroup } from '../../../components/molecules/InputGroup';
import { Button } from '../../../components/atoms/Button';
import { Form } from '../../../components/common/Form';
import { useToast } from '../../../components/atoms/Toast';
import { z } from 'zod';
import { useServiceCategoryActions } from '../hooks/useServiceCategoryActions';
import { SelectGroup } from '../../../components/molecules/SelectGroup';
import Layout from '../../../layouts/Layout';
import Breadcrumbs from '../../../components/common/BreadCrumb';

const formInputSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  type: z.string().min(1, 'Type is required'),
  required: z.enum(["Yes", "No"] as const, { message: "Selection is required" }),
  maxrange: z.string().optional(),
  minrange: z.string().optional(),
});

type FormInputSchemaType = z.infer<typeof formInputSchema>;

const ServiceCategoryFormInputs: React.FC = () => {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const { addServiceCategoryFormInput } = useServiceCategoryActions();

  const methods = useForm<FormInputSchemaType>({
    resolver: zodResolver(formInputSchema),
    mode: 'all',
    defaultValues: {
      label: '',
      type: '',
      required: 'Yes',
      minrange: '',
      maxrange: '',
    },
  });

  const { formState: { errors, isDirty } } = methods;

  const onSubmit = async (data: FormInputSchemaType) => {
    try {
      const payload = {
        categoryId: id as string,
        label: data.label.trim(),
        type: data.type.trim(),
        required: data.required === 'Yes',
        minrange: data.minrange ? Number(data.minrange) : undefined,
        maxrange: data.maxrange ? Number(data.maxrange) : undefined,
      };

      await addServiceCategoryFormInput(payload);
      toast.success('Form input added successfully');
      navigate(`/service-category/form-inputs/${id}`);
    } catch (err) {
      // Error handled by Redux; optionally show toast
    }
  };

  const labelValue = methods.watch('label');
  const typeValue = methods.watch('type');
  const requiredValue = methods.watch('required');
  const canSubmit = useMemo(
    () => isDirty && !!labelValue?.trim() && !!typeValue?.trim() && !!requiredValue,
    [isDirty, labelValue, typeValue, requiredValue]
  );

  return (
    <>
      <Layout>
        <h2 className="text-xl font-semibold mb-2">Add Form Input</h2>
        <Breadcrumbs />
        <div className="text-gray-800 shadow-sm mt-5 max-w-3xl border border-neutral-100 bg-white rounded-xl p-6">
          <div className="grid grid-cols-1">
            <FormProvider {...methods}>
              <Form<FormInputSchemaType>
                mode="all"
                schema={formInputSchema}
                onSubmit={onSubmit}
                className='bg-white text-gray-800'
              >
                <div className="grid grid-cols-1 md:grid-row-1 gap-4">
                  <InputGroup
                    label="Label"
                    name="label"
                    id="label"
                    placeholder="Enter label"
                    autoComplete="off"
                    error={errors?.label?.message}
                  />
                  <InputGroup
                    label="Type"
                    name="type"
                    id="type"
                    placeholder="Enter type (e.g. string)"
                    autoComplete="off"
                    error={errors?.type?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-row-1 gap-4 mt-2">
                  <Controller
                    name="required"
                    control={methods.control}
                    render={({ field, fieldState }) => (
                      <SelectGroup
                        label="Required"
                        options={[
                          { label: 'Yes', value: 'Yes' },
                          { label: 'No', value: 'No' },
                        ]}
                        value={field.value ? [{ label: field.value, value: field.value }] : []}
                        onChange={(selected) => {
                          const value = Array.isArray(selected) ? selected[0]?.value : '';
                          field.onChange(value || '');
                        }}
                        isMulti={false}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-row-1 gap-4 mt-2">
                  <InputGroup
                    label="MinRange"
                    name="minrange"
                    id="minrange"
                    placeholder="Enter min range (optional)"
                    autoComplete="off"
                    error={errors?.minrange?.message}
                  />
                  <InputGroup
                    label="MaxRange"
                    name="maxrange"
                    id="maxrange"
                    placeholder="Enter max range (optional)"
                    autoComplete="off"
                    error={errors?.maxrange?.message}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" variant="primary" disabled={!canSubmit}>
                    Create Form Input
                  </Button>
                </div>
              </Form>
            </FormProvider>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ServiceCategoryFormInputs;
