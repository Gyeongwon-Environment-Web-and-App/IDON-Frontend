export const formatDateToYYMMDD = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // YY
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // MM
    const day = date.getDate().toString().padStart(2, "0"); // DD

    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error("날짜 파싱 오류:", error);
    return dateString; // 파싱 실패 시 원본 반환
  }
};
