import { NonBinaryIcon } from 'lucide-react';
import React from 'react';

interface NoDataProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NoData: React.FC<NoDataProps> = ({
  message = 'No data available.',
  icon ='NonBinaryIcon',
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-8 text-gray-500 min-h-[300px] ${className}`}>
    {/* {icon && <div className="my-4 text-4xl text-sky-800">{<SearchCheck />}</div>} */}
    <h4 className="text-lg text-sky-600 dark:text-sky-950 mb-4"> <NonBinaryIcon className="w-4 h-4" />{message}</h4>
    {/* <Button variant='primary'> Search Again </Button> */}
  </div>
);
