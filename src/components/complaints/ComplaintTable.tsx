import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DateRange } from "react-day-picker";
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
import { complaints as initialComplaints } from "../../data/complaintData";
import type { Complaint } from "../../types/complaint";
import Popup from "../forms/Popup";
import triangle from "../../assets/icons/actions/triangle.svg";
import filter from "../../assets/icons/actions/filter.svg";
import deleteIcon from "../../assets/icons/actions/delete.svg";
import DateRangePicker from "../common/DateRangePicker";
import ComplaintCard from "./ComplaintCard";
import { formatDateToYYMMDD } from "@/utils/formatDateToYYMMDD";

const ComplaintTable: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    if (selectedRows.size === filteredComplaints.length) {
      // 모든 행이 선택된 경우 선택 해제
      setSelectedRows(new Set());
    } else {
      // 모든 행 선택
      const allIds = new Set(
        filteredComplaints.map((complaint) => complaint.id)
      );
      setSelectedRows(allIds);
    }
  };

  // 개별 행 선택 핸들러
  const handleRowSelect = (complaintId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (isSelected) {
      newSelected.add(complaintId);
    } else {
      newSelected.delete(complaintId);
    }
    setSelectedRows(newSelected);
  };

  // 행 클릭 핸들러 - 지도로 네비게이션
  const handleRowClick = (complaintId: string) => {
    navigate(`/map/overview/${complaintId}`);
  };

  // 컬럼 정의
  const columns: ColumnDef<Complaint>[] = [
    {
      id: "select",
      header: () => (
        <div className="flex justify-center items-center pr-4">
          <Checkbox
            checked={selectedRows.size === filteredComplaints.length}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
            className="bg-white"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center pr-4">
          <Checkbox
            checked={selectedRows.has(row.original.id)}
            onCheckedChange={(value) =>
              handleRowSelect(row.original.id, !!value)
            }
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
    <div className="w-full 2xl:w-[110%] overflow-x-auto">
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
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            containerClassName="border border-[#575757] rounded-3xl px-4 py-0 md:py-1"
          />
        </div>
      </header>

      {/* 검색 및 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] mb-3">
        {/* 검색 영역 */}
        <div className="flex gap-2 items-center justify-start mb-3 md:mb-0">
          <div className="relative flex flex-1 md:flex-auto md:max-w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#575757]" />
            <input
              type="text"
              placeholder="검색..."
              className="pl-10 pr-4 py-1 border border-[#575757] rounded-md focus:outline-none focus:ring-1 focus:ring-light-green focus:border-transparent mx-[2px] flex-1 md:flex-auto"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none bg-[#646464] text-white border-none w-[3rem] outline-none hover:bg-under hover:text-white text-sm flex-shrink-0"
            onClick={() => handleSearch(searchTerm)}
          >
            검색
          </Button>
        </div>

        {/* 버튼들 영역 */}
        <div className="flex gap-2 flex-wrap md:flex-nowrap items-center justify-between md:justify-normal">
          <div
            className="visible md:hidden shadow-none border border-a2a2a2 md:border-[#575757] outline-none text-sm px-2 py-1 cursor-pointer flex items-center gap-2 rounded-md h-8 font-medium"
            onClick={handleSelectAll}
          >
            <Checkbox
              checked={selectedRows.size === filteredComplaints.length}
            />
            전체 선택
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none border border-a2a2a2 md:border-[#575757] outline-none text-sm px-2"
                  >
                    전체 민원
                    <img src={triangle} alt="쓰레기상성 필터 버튼" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("전체 민원")}
                  >
                    전체 민원
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("음식물")}
                  >
                    음식물
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange("재활용")}
                  >
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
                    className="flex items-center w-8 border border-a2a2a2 md:border-[#575757] outline-none text-sm p-0"
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
            <div className="flex flex-wrap md:flex-nowrap gap-2 mr-0">
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
                  <DropdownMenuItem onClick={() => {}}>PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>Excel</DropdownMenuItem>
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
        </div>
      </div>

      {/* 테이블 */}
      <div className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
        <DataTable
          columns={columns}
          data={complaintsWithCallbacks}
          onRowClick={(complaint) => handleRowClick(complaint.id)}
        />
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="md:hidden space-y-4 mt-4">
        {filteredComplaints.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            onStatusChange={handleStatusChange}
            isSelected={selectedRows.has(complaint.id)}
            onSelectChange={handleRowSelect}
            onCardClick={handleRowClick}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="hidden md:flex items-center justify-center mt-8">
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
