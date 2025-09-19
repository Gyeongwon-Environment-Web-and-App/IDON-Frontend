import React from 'react';

import Header from '../common/Header';
import { useAuthStore } from '@/stores/authStore';

interface ComplaintEditProps {}

const ComplaintEdit: React.FC<ComplaintEditProps> = ({}) => {
  const { logout } = useAuthStore();

  return (
    <div>
      <Header onLogout={logout} />
      <div className="flex md:justify-center md:items-center justify-start items-start pt-2 md:pt-4 pb-[7rem] md:pb-5 w-full">
        
      </div>
    </div>
  );
};

export default ComplaintEdit;
