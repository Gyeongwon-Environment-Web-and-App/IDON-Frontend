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
  currentStatus: '처리중' | '완료' | null,
  onUpdate: (id: string, updates: Partial<Complaint>) => void,
  onClose: () => void
): StatusChangeHandler => {
  const handleConfirm = () => {
    if (complaintId && currentStatus) {
      const newStatus = currentStatus === '처리중' ? '완료' : '처리중';
      onUpdate(complaintId, { status: newStatus === '완료' });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getMessage = () => {
    if (currentStatus === '처리중') {
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
    } else if (currentStatus === '완료') {
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
