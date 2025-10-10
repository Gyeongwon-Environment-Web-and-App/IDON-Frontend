import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

interface NoticeFormProps {}

const NoticeForm: React.FC<NoticeFormProps> = ({}) => {
  const { noticeId } = useParams();
  const isEditMode = Boolean(noticeId);
  return <div></div>;
};

export default NoticeForm;
