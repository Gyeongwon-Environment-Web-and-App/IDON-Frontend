export const formatDateToYYMMDD = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // YY
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
    const day = date.getDate().toString().padStart(2, '0'); // DD

    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return dateString; // 파싱 실패 시 원본 반환
  }
};

export const formatDateTimeToKorean = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `20${formatDateToYYMMDD(dateString)} ${period} ${displayHours}시 ${minutes}분`;
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return dateString;
  }
}

export function formatDateTime(date: Date) {
  // 연, 월, 일
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 오전/오후, 시, 분
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  const isAM = hour < 12;
  const ampm = isAM ? '오전' : '오후';
  if (!isAM) hour = hour === 12 ? 12 : hour - 12;
  if (hour === 0) hour = 12;

  return {
    date: `${year} . ${month}. ${day}`,
    time: `${ampm} ${hour}:${minute}`,
  };
}
