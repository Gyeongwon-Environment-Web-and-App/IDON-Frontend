import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, ChevronLeft, Download } from '@/lib/icons';

import deleteIcon from '../../assets/icons/actions/delete.svg';
import fix from '../../assets/icons/common/pen.svg';
import { Button } from '../ui/button';

// import { useNavigate } from 'react-router-dom';

const NoticeDetail: React.FC = () => {
  // const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button className="flex items-center gap-2 text-xl font-semibold p-0">
          <ChevronLeft className="w-6 h-6" />
          목록
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex md:px-3 px-2 items-center shadow-none outline-none border border-a2a2a2 md:border-[#575757] focus:border-[#575757] focus:outline-none"
          >
            <img src={fix} alt="수정 아이콘" className="w-5 h-5" />
            <span className="hidden md:block text-sm">수정</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex md:px-3 px-2 items-center shadow-none outline-none border border-a2a2a2 md:border-[#575757] focus:border-[#575757] focus:outline-none"
              >
                <Download className="w-4 h-4 md:text-black text-[#575757]" />
                <span className="hidden md:block text-sm">다운로드</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.alert('개발 중입니다!')}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.alert('개발 중입니다!')}>
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="flex px-2 md:px-4 items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm"
          >
            <img src={deleteIcon} alt="삭제 아이콘" />
            <span className="hidden md:block text-sm">삭제</span>
          </Button>
        </div>
      </div>
      <div className="rounded border border-a5a5a5">
        <div className="flex justify-between px-5 py-3 border-b border-a5a5a5">
          <div className="flex items-center font-semibold text-lg">
            <div className="rounded bg-a5a5a5 px-2 py-1 text-white font-semibold mr-2 text-base">
              안내사항
            </div>
            위 내용은 공지사항 예시입니다.
          </div>
          <div className="flex items-center text-base gap-2">
            <p className="font-semibold">000(작성자)</p>
            <p className="font-light">25-10-10</p>
          </div>
        </div>
        <div className="p-8 text-lg h-[30rem]">
          <span className="block pb-8 font-semibold">음식물 팀에게 전달</span>
          설날 연휴로 인해 2월 9일(일)부터 12일(수)까지 쓰레기 수거가
          중단됩니다. 연휴 전 미리 수거해 주시기 바랍니다.
        </div>
      </div>
      <div className="mt-6 border border-a5a5a5 rounded grid grid-cols-[auto_1fr] grid-rows-[1fr_1fr]">
        <button className="col-start-2 row-start-1 flex items-center gap-2 border-b border-a5a5a5">
          <div className="flex items-center h-full border-r border-a5a5a5 gap-2 pr-2">
            <div className="text-base text-gray-500">이전글</div>
            <ChevronDownIcon className="w-5 h-5 -rotate-180" />
          </div>
          <p className="font-medium col-span-1">시스템 점검 안내</p>
        </button>
        <button className="col-start-2 row-start-2 flex items-center transition-colors gap-2">
          <div className="flex items-center h-full border-r border-a5a5a5 gap-2 pr-2">
            <div className="text-base text-gray-500">다음글</div>
            <ChevronDownIcon className="w-5 h-5" />
          </div>
          <p className="font-medium">재활용 분리배출 가이드 업데이트</p>
        </button>
      </div>
    </div>
  );
};

export default NoticeDetail;
