import React from 'react';

import type { Complaint } from '../types/complaint';

// Status change handler interface
export interface StatusChangeHandler {
  onConfirm: () => void;
  onCancel: () => void;
  getMessage: () => React.JSX.Element;
}

// Create reusable status change handler
export const createStatusChangeHandler = (
  complaintId: string | null,
  currentStatus: boolean | null,
  onUpdate: (id: string, updates: Partial<Complaint>) => void,
  onClose: () => void,
  updateService?: (id: number, status: boolean) => Promise<void>
): StatusChangeHandler => {
  const handleConfirm = async () => {
    if (complaintId && currentStatus !== null) {
      const newStatus = !currentStatus;
      if (updateService) {
        try {
          await updateService(parseInt(complaintId), newStatus);
          onUpdate(complaintId, { status: newStatus });
        } catch (error) {
          console.error('민원 상태 업데이트 실패:', error);
        }
      } else {
        // onUpdate(complaintId, { status: newStatus });
        window.alert('민원 상태 업데이트에 실패했습니다.')
      }
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getMessage = () => {
    if (currentStatus === false) {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'p',
          { className: 'pb-2' },
          '처리결과를 ',
          React.createElement(
            'span',
            { className: 'text-darker-green' },
            '완료'
          ),
          '로'
        ),
        React.createElement('p', null, '수정하시겠습니까?')
      );
    } else if (currentStatus === true) {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'p',
          { className: 'pb-2' },
          '처리결과를 ',
          React.createElement(
            'span',
            { className: 'text-[#8E8E8E]' },
            '처리중'
          ),
          '으로'
        ),
        React.createElement('p', null, '되돌리시겠습니까?')
      );
    }
    return React.createElement('div', null, '');
  };

  return {
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    getMessage,
  };
};

// Generic popup handler factory
export const createPopupHandler = <T>(
  onConfirm: (data: T) => void,
  onCancel: () => void,
  getMessage: (data: T) => React.ReactNode
) => {
  return {
    onConfirm: (data: T) => onConfirm(data),
    onCancel,
    getMessage: (data: T) => getMessage(data),
  };
};
