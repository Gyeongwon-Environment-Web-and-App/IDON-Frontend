import React, { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import calendar from "../../assets/icons/map/calendar.svg";
import { Calendar } from "@/components/ui/calendar";
import { ko } from "date-fns/locale";
import triangle from "../../assets/icons/complaint_list/triangle.svg";
import filter from "../../assets/icons/complaint_list/filter.svg";
import deleteIcon from "../../assets/icons/complaint_list/delete.svg";
import { complaints as initialComplaints } from "./complaintData";
import type { Complaint } from "./complaintData";
import Popup from "../Popup";

const formatDateToYYMMDD = (dateString: string) => {
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

// 컬럼 정의
const columns: ColumnDef<Complaint>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center items-center pr-4">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="bg-white"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center pr-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "연번",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("number")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "접수 일자",
    cell: ({ row }) => (
      <div className="text-center">
        {formatDateToYYMMDD(row.getValue("date"))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "종류",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "region_nm",
    header: "주소",
    cell: ({ row }) => {
      const address: string = row.original.address;
      const regionNm: string = row.getValue("region_nm");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-pointer">{regionNm}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-md break-words text-base text-black">
                {address}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "content",
    header: "민원 내용",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("content")}</div>
    ),
  },
  {
    accessorKey: "contact",
    header: "연락처",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("contact")}</div>
    ),
  },
  {
    accessorKey: "driver",
    header: "담당 기사",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("driver")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: "구청/대행",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "처리결과",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`text-center cursor-pointer py-1 rounded ${
            status === "완료" ? "text-green-600 font-medium" : "text-gray-500"
          }`}
          onClick={() => {
            // 처리중일 때는 완료로, 완료일 때는 처리중으로 변경
            const onStatusChange = row.original.onStatusChange;
            if (onStatusChange) {
              onStatusChange(row.original.id);
            }
          }}
        >
          {status}
        </div>
      );
    },
  },
];

const ComplaintTable: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 5, 1)); // 2025년 6월
  const [open, setOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );
  const [selectedComplaintStatus, setSelectedComplaintStatus] = useState<
    "처리중" | "완료" | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredComplaints, setFilteredComplaints] =
    useState<Complaint[]>(initialComplaints);
  const [sortOrder, setSortOrder] = useState<"최근" | "옛">("최근");

  // 시간 필터링 함수
  const handleSortChange = (order: "최근" | "옛") => {
    setSortOrder(order);

    // ISO 날짜 문자열을 Date 객체로 변환하는 함수 (시간 제외)
    const parseDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    // 정렬된 데이터 생성
    const sorted = [...filteredComplaints].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);

      // 날짜가 동일한 경우 연번으로 정렬
      if (dateA.getTime() === dateB.getTime()) {
        if (order === "최근") {
          return b.number - a.number; // 연번이 작은 것이 위로 (1, 2, 3...)
        } else {
          return a.number - b.number; // 연번이 큰 것이 위로 (7, 6, 5...)
        }
      }

      // 날짜가 다른 경우 날짜로 정렬
      if (order === "최근") {
        return dateB.getTime() - dateA.getTime(); // 최신순 (최신 날짜가 위로)
      } else {
        return dateA.getTime() - dateB.getTime(); // 오래된순 (오래된 날짜가 위로)
      }
    });

    setFilteredComplaints(sorted);
  };

  // 필터링 함수
  const handleFilterChange = (filterType: string) => {
    if (filterType === "전체 민원") {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter((complaint) => {
      return complaint.type === filterType;
    });

    setFilteredComplaints(filtered);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  // 검색 기능
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredComplaints(complaints);
      return;
    }

    const filtered = complaints.filter((complaint) => {
      const searchLower = searchValue.toLowerCase();
      return (
        complaint.number.toString().includes(searchLower) ||
        complaint.date.toLowerCase().includes(searchLower) ||
        complaint.type.toLowerCase().includes(searchLower) ||
        complaint.content.toLowerCase().includes(searchLower) ||
        complaint.department.toLowerCase().includes(searchLower) ||
        complaint.address.toLowerCase().includes(searchLower) ||
        complaint.contact.toLowerCase().includes(searchLower) ||
        complaint.status.toLowerCase().includes(searchLower)
      );
    });

    setFilteredComplaints(filtered);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  // 검색어 입력 처리 (실시간 필터링 제거)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 상태 변경 핸들러
  const handleStatusChange = (complaintId: string) => {
    const complaint = filteredComplaints.find((c) => c.id === complaintId);
    if (complaint) {
      setSelectedComplaintId(complaintId);
      setSelectedComplaintStatus(complaint.status);
      setIsPopupOpen(true);
    }
  };

  // 팝업에서 예를 눌렀을 때
  const handleConfirmStatusChange = () => {
    if (selectedComplaintId && selectedComplaintStatus) {
      const newStatus =
        selectedComplaintStatus === "처리중" ? "완료" : "처리중";

      // 원본 데이터와 필터된 데이터 모두 업데이트
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === selectedComplaintId
            ? { ...complaint, status: newStatus as "처리중" | "완료" }
            : complaint
        )
      );

      setFilteredComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === selectedComplaintId
            ? { ...complaint, status: newStatus as "처리중" | "완료" }
            : complaint
        )
      );
    }
    setIsPopupOpen(false);
    setSelectedComplaintId(null);
    setSelectedComplaintStatus(null);
  };

  // 팝업에서 아니오를 눌렀을 때
  const handleCancelStatusChange = () => {
    setIsPopupOpen(false);
    setSelectedComplaintId(null);
    setSelectedComplaintStatus(null);
  };

  // 팝업 메시지 생성
  const getPopupMessage = () => {
    if (selectedComplaintStatus === "처리중") {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-darker-green">완료</span>로
          </p>
          <p>수정하시겠습니까?</p>
        </>
      );
    } else if (selectedComplaintStatus === "완료") {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-[#8E8E8E]">처리중</span>으로
          </p>
          <p>되돌리시겠습니까?</p>
        </>
      );
    }
    return "";
  };

  // 각 complaint에 상태 변경 콜백 추가
  const complaintsWithCallbacks = filteredComplaints.map((complaint) => ({
    ...complaint,
    onStatusChange: handleStatusChange,
  }));

  return (
    <div className="w-full 2xl:w-[110%] overflow-x-auto ">
      {/* 팝업 */}
      {isPopupOpen && (
        <Popup
          message={getPopupMessage()}
          yesNo={true}
          onFirstClick={handleConfirmStatusChange}
          onSecondClick={handleCancelStatusChange}
          toHome={false}
        />
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-xl font-bold -mr-2">
            {formatDate(selectedDate)}
          </span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button className="cursor-pointer bg-white outline-none shadow-none p-0 ml-4">
                <img src={calendar} alt="캘린더 아이콘" className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setOpen(false);
                  }
                }}
                locale={ko}
                captionLayout="dropdown"
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex items-center justify-between space-x-4 mb-4">
        <div className="flex items-center">
          <div className="relative flex-1 max-w-sm mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#575757]" />
            <input
              type="text"
              placeholder="검색..."
              className="w-full pl-10 pr-4 py-1 border border-[#575757] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2 shadow-none bg-[#646464] text-white border-none w-[3rem] outline-none hover:bg-under hover:text-white text-sm"
            onClick={() => handleSearch(searchTerm)}
          >
            검색
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="mr-2 shadow-none border-[#575757] outline-none text-sm"
              >
                전체 민원
                <img src={triangle} alt="쓰레기상성 필터 버튼" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFilterChange("전체 민원")}>
                전체 민원
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("음식물")}>
                음식물
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("재활용")}>
                재활용
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("생활")}>
                생활
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("기타")}>
                기타
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center w-8 border border-[#575757] outline-none text-sm p-0"
                title={`현재: ${sortOrder === "최근" ? "최근순" : "오래된순"}`}
              >
                <img
                  src={filter}
                  alt="시간순서 필터 버튼"
                  className="object-cover w-5"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSortChange("최근")}>
                최근 민원 순
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("옛")}>
                옛 민원 순
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center shadow-none outline-none border-[#575757]"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">다운로드</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {}}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm"
          >
            <img src={deleteIcon} alt="삭제 아이콘" />
            삭제
          </Button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <DataTable columns={columns} data={complaintsWithCallbacks} />
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-none outline-none shadow-none"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-none outline-none shadow-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
              <Button
                key={page}
                variant={page === 1 ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 border-none outline-none shadow-none text-sm"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-none outline-none shadow-none"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-none outline-none shadow-none"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTable;
