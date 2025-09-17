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