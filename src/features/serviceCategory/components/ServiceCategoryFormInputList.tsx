import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import TableComponent from '../../../components/atoms/Table';
import type { TableColumn, TableAction } from '../../../types/table';
import { ConfirmModal } from '../../../components/molecules/ConfirmModal';
import { useToast } from '../../../components/atoms/Toast';
import { useServiceCategory } from '../hooks/useServiceCategory';
import { useServiceCategoryActions } from '../hooks/useServiceCategoryActions';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';


const ServiceCategoryFormInputList: React.FC = () => {
  const { formInputs = [], formInputsPagination, formInputsLoading } = useServiceCategory();
  const { id } = useParams();
  const { getServiceCategoryFormInputs, removeServiceCategoryFormInput, updateServiceCategoryFormInput } = useServiceCategoryActions();

  const [pathAddInput] = useState('/service-category/form-inputs/add/' + id);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const toast = useToast();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInput, setSelectedInput] = useState<FormInputRow | null>(null);

  // Fetch form inputs for the selected category when page or search changes
  useEffect(() => {
    if (!id) return;
    const delayDebounce = setTimeout(() => {
      getServiceCategoryFormInputs(id as string, currentPage, rowsPerPage, searchQuery);
    }, 300); // debounce API call by 300ms

    return () => clearTimeout(delayDebounce);
  }, [id, getServiceCategoryFormInputs, currentPage, searchQuery, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAction = (action: TableAction, row: any) => {
    if (action === 'edit') {
      navigate(`/service-category/form-inputs/edit/${row.id}`);
    } else if (action === 'delete') {
      setSelectedInput(row as any);
      setShowDeleteModal(true);
    }
    else if (action === 'reset-password') {
      // Reset password functionality
    }
    else if (action === 'view') {
      // View form input
    } else if (action === 'add form inputs') {
      navigate(`/service-category/form-inputs/add/${row.id}`);
    }
  };

  const confirmDelete = async () => {
    if (!selectedInput) return;
    try {
      await removeServiceCategoryFormInput(selectedInput.id);
      setShowDeleteModal(false);
      setSelectedInput(null);
      toast.success('Form input deleted successfully');
      if (id) {
        getServiceCategoryFormInputs(id as string, currentPage, rowsPerPage, searchQuery);
      }
    } catch (error) {
      // Error is already handled by Redux actions and displayed in UI
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedInput(null);
  };



  const columns: TableColumn<FormInputRow>[] = [
    { key: 'label', label: 'Label', width: 250, sortable: true, searchable: true },
    { key: 'type', label: 'Type', width: 150 },
    { key: 'required', label: 'Required', width: 100, render: (value) => (value === true ? 'Yes' : value === false ? 'No' : '') },
    { key: 'minrange', label: 'Min', width: 100 },
    { key: 'maxrange', label: 'Max', width: 100 },
  ];

  // Map form inputs to rows for the table
  type FormInputRow = { id: string; label: string; type: string; required?: boolean; minrange?: number; maxrange?: number; isActive?: boolean };
  const sanitizedInputs: FormInputRow[] = (formInputs as any[])?.filter(Boolean).map((f: any) => ({
    id: (f.id ?? f.key ?? `${f.label || 'input'}-${Math.random().toString(36).slice(2,8)}`) as string,
    label: (f.label ?? '') as string,
    type: (f.type ?? '') as string,
    required: f.required as boolean | undefined,
    minrange: f.minrange as number | undefined,
    maxrange: f.maxrange as number | undefined,
    isActive: f.isActive as boolean | undefined,
  })) ?? [];

  return (
    <Layout>
      <>
      <div className='max-w-3xl'>
        <TableComponent<FormInputRow>
          columns={columns}
          data={sanitizedInputs as any[]}
          onRowAction={handleAction}
          total={formInputsPagination?.total ?? sanitizedInputs.length}
          currentPage={currentPage}
          featureName="Service category dynamic form"
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          heading="Service category dynamic form"
          searchBar
          searchQuery={searchQuery}
          showResetPasswordOption={false}
          onSearchChange={(q) => {
            setCurrentPage(1);
            setSearchQuery(q);
          }}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
            if (id) getServiceCategoryFormInputs(id as string, 1, size, searchQuery);
          }}
          loading={formInputsLoading}
          showAddButton 
          addButtonRoute={pathAddInput}
          addButtonText='Add Form Input'
        />
          {showDeleteModal && selectedInput && (
         <ConfirmModal
            isOpen={showDeleteModal}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete the form input: ${selectedInput.label}?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />
          )}
        </div>
      </>
    </Layout>
  );
};

export default ServiceCategoryFormInputList;
