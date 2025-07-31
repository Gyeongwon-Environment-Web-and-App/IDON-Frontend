import { useState, useEffect } from "react";

export const useResponsiveScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 화면 비율에 따라 스케일 계산
      const aspectRatio = width / height;

      if (aspectRatio < 1.2) {
        setScale(1.3); // 세로 화면일 때 확대
      } else if (aspectRatio < 1.5) {
        setScale(1.2); // 중간 비율
      } else {
        setScale(1.1); // 가로 화면일 때 약간 확대
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scale;
};
