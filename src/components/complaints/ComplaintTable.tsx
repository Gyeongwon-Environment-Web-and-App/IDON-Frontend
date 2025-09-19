import React, { useEffect, useState } from 'react';

import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useComplaints } from '@/hooks/useComplaints';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
} from '@/lib/icons';
import { createStatusChangeHandler } from '@/lib/popupHandlers';
import { useComplaintTableStore } from '@/stores/complaintTableStore';
import { formatDateToYYMMDD } from '@/utils/formatDate';

import deleteIcon from '../../assets/icons/actions/delete.svg';
import filter from '../../assets/icons/actions/filter.svg';
import triangle from '../../assets/icons/actions/triangle.svg';
import type { Complaint } from '../../types/complaint';
import DateRangePicker from '../common/DateRangePicker';
import Popup from '../forms/Popup';
import ComplaintCard from './ComplaintCard';

// Extended complaint type with callback
interface ComplaintWithCallback extends Complaint {
  onStatusChange?: (id: number) => void;
}

const ComplaintTable: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const {
    dateRange,
    searchTerm,
    sortOrder,
    complaints: storeComplaints,
    filteredComplaints,
    selectedRows,
    selectedComplaintStatus,
    isPopupOpen,
    selectedComplaintId,
    setDateRange,
    setSearchTerm,
    setSortOrder,
    setComplaints,
    setFilteredComplaints,
    setSelectedRows,
    setSelectedComplaintStatus,
    setIsPopupOpen,
    setSelectedComplaintId,
    updateComplaint,
  } = useComplaintTableStore();

  // Use the enhanced useComplaints hook with dateRange
  const {
    complaints: apiComplaints,
    isLoading,
    fetchError,
  } = useComplaints(dateRange);

  // Update store with API data when it changes
  useEffect(() => {
    if (apiComplaints.length > 0) {
      setComplaints(apiComplaints);
      setFilteredComplaints(apiComplaints);
    } else if (apiComplaints.length === 0 && !isLoading) {
      // Show empty state instead of fallback data
      setComplaints([]);
      setFilteredComplaints([]);
    }
  }, [apiComplaints, isLoading, setComplaints, setFilteredComplaints]);

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
  const handleRowSelect = (complaintId: number, isSelected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (isSelected) {
      newSelected.add(complaintId);
    } else {
      newSelected.delete(complaintId);
    }
    setSelectedRows(newSelected);
  };

  // 행 클릭 핸들러 - 지도로 네비게이션
  const handleRowClick = (complaintId: number) => {
    navigate(`/map/overview/complaints/${complaintId}`);
  };

  // 컬럼 정의
  const columns: ColumnDef<ComplaintWithCallback>[] = [
    {
      id: 'select',
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
      accessorKey: 'id',
      header: '연번',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'datetime',
      header: '접수 일자',
      cell: ({ row }) => (
        <div className="text-center">
          {formatDateToYYMMDD(row.getValue('datetime'))}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '종류',
      cell: ({ row }) => (
        <div className="text-center truncate">{row.getValue('type')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: '카테고리',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.teams?.length > 0
            ? row.original.teams.map((team) => team.category).join(', ')
            : '카테고리 없음'}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: '주소',
      cell: ({ row }) => {
        const address: string = row.original.address;
        const shortAddress = address.split(' ').slice(-2).join(' '); // Get last two parts

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-pointer">{shortAddress}</div>
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
      accessorKey: 'content',
      header: '민원 내용',
      cell: ({ row }) => (
        <div className="text-left truncate">{row.getValue('content')}</div>
      ),
    },
    {
      accessorKey: 'user.phone_no',
      header: '연락처',
      cell: ({ row }) => {
        const phoneNum: string = row.original.source.phone_no;
        const shortPhoneNum: string = `${phoneNum.slice(3)}...`;
        const shouldShowTooltip = phoneNum.length > 6;

        if (shouldShowTooltip) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-pointer">
                    {shortPhoneNum}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-md break-words text-base text-black">
                    {phoneNum}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <div className="text-center">{phoneNum}</div>;
      },
    },
    {
      accessorKey: 'teams',
      header: '담당 기사',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.teams[0]?.drivers[0]?.name || '담당자 없음'}
        </div>
      ),
    },
    {
      accessorKey: 'route',
      header: '접수처',
      cell: ({ row }) => (
        <div className="text-center">{row.original.route}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: '처리결과',
      cell: ({ row }) => {
        return (
          <div
            className={`text-center cursor-pointer py-1 rounded ${
              row.original.status
                ? 'text-green-600 font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => {
              const onStatusChange = row.original.onStatusChange;
              if (onStatusChange) {
                onStatusChange(row.original.id);
              }
            }}
          >
            {row.original.status ? '완료' : '처리중'}
          </div>
        );
      },
    },
  ];

  // 시간 필터링 함수
  const handleSortChange = (order: '최근' | '옛') => {
    setSortOrder(order);

    // ISO 날짜 문자열을 Date 객체로 변환하는 함수 (시간 제외)
    const parseDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    // 정렬된 데이터 생성
    const sorted = [...filteredComplaints].sort((a, b) => {
      const dateA = parseDate(a.datetime);
      const dateB = parseDate(b.datetime);

      // 날짜가 동일한 경우 ID로 정렬
      if (dateA.getTime() === dateB.getTime()) {
        if (order === '최근') {
          return b.id - a.id; // ID가 작은 것이 위로 (1, 2, 3...)
        } else {
          return a.id - b.id; // ID가 큰 것이 위로 (7, 6, 5...)
        }
      }

      // 날짜가 다른 경우 날짜로 정렬
      if (order === '최근') {
        return dateB.getTime() - dateA.getTime(); // 최신순 (최신 날짜가 위로)
      } else {
        return dateA.getTime() - dateB.getTime(); // 오래된순 (오래된 날짜가 위로)
      }
    });

    setFilteredComplaints(sorted);
  };

  // 필터링 함수
  const handleFilterChange = (filterType: string) => {
    if (filterType === '전체 민원') {
      setFilteredComplaints(storeComplaints);
      return;
    }

    const filtered = storeComplaints.filter((complaint) => {
      return complaint.type === filterType;
    });

    setFilteredComplaints(filtered);
  };

  // 검색 기능
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredComplaints(storeComplaints);
      return;
    }

    const filtered = storeComplaints.filter((complaint) => {
      const searchLower = searchValue.toLowerCase();
      
      // Check if search term matches "담당자 없음" for complaints with no drivers
      const hasNoDrivers = complaint.teams.length === 0 || 
        complaint.teams.every(team => team.drivers.length === 0);
      
      return (
        complaint.id.toString().includes(searchLower) ||
        complaint.datetime.toLowerCase().includes(searchLower) ||
        complaint.type.toLowerCase().includes(searchLower) ||
        complaint.content.toLowerCase().includes(searchLower) ||
        complaint.address.toLowerCase().includes(searchLower) ||
        complaint.source.phone_no.toLowerCase().includes(searchLower) ||
        complaint.route.toLowerCase().includes(searchLower) ||
        complaint.teams.some(
          (team) =>
            team.team_nm.toLowerCase().includes(searchLower) ||
            team.drivers.some((driver) =>
              driver.name.toLowerCase().includes(searchLower)
            )
        ) ||
        (hasNoDrivers && '담당자 없음'.toLowerCase().includes(searchLower)) ||
        (complaint.status ? '완료' : '처리중').toLowerCase().includes(searchLower)
      );
    });

    setFilteredComplaints(filtered);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  // 검색어 입력 처리 (실시간 필터링 제거)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 상태 변경 핸들러
  const handleStatusChange = (complaintId: number) => {
    const complaint = filteredComplaints.find((c) => c.id === complaintId);
    if (complaint) {
      setSelectedComplaintId(complaintId.toString());
      setSelectedComplaintStatus(complaint.status);
      setIsPopupOpen(true);
    }
  };

  // 상태 변경 핸들러
  const statusChangeHandler = createStatusChangeHandler(
    selectedComplaintId,
    selectedComplaintStatus,
    (id: string, updates: Partial<Complaint>) => {
      updateComplaint(parseInt(id), updates);
    },
    () => {
      setIsPopupOpen(false);
      setSelectedComplaintId(null);
      setSelectedComplaintStatus(null);
    }
  );

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
          message={statusChangeHandler.getMessage()}
          yesNo={true}
          onFirstClick={statusChangeHandler.onConfirm}
          onSecondClick={statusChangeHandler.onCancel}
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
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                isSearchFocused ? 'text-light-green' : 'text-[#575757]'
              }`}
            />
            <input
              type="text"
              placeholder="검색..."
              className="pl-10 pr-4 py-1 border border-[#575757] rounded-md focus:outline-none focus:ring-1 focus:ring-light-green focus:border-transparent mx-[2px] flex-1 md:flex-auto"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
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
                    onClick={() => handleFilterChange('전체 민원')}
                  >
                    전체 민원
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('음식물')}
                  >
                    음식물
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFilterChange('재활용')}
                  >
                    재활용
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange('생활')}>
                    생활
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange('기타')}>
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
                    title={`현재: ${sortOrder === '최근' ? '최근순' : '오래된순'}`}
                  >
                    <img
                      src={filter}
                      alt="시간순서 필터 버튼"
                      className="object-cover w-5"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSortChange('최근')}>
                    최근 민원 순
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('옛')}>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">민원 데이터를 불러오는 중...</div>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{fetchError}</div>
          </div>
        ) : complaintsWithCallbacks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">민원이 없습니다.</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={complaintsWithCallbacks}
            onRowClick={(complaint) => handleRowClick(complaint.id)}
            clickableColumnIds={[
              'select',
              'id',
              'datetime',
              'type',
              'category',
              'address',
              'content',
              'user.phone_no',
              'teams',
            ]}
          />
        )}
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="md:hidden space-y-4 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">민원 데이터를 불러오는 중...</div>
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{fetchError}</div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">민원이 없습니다.</div>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onStatusChange={handleStatusChange}
              isSelected={selectedRows.has(complaint.id)}
              onSelectChange={handleRowSelect}
              onCardClick={handleRowClick}
            />
          ))
        )}
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
                variant={page === 1 ? 'default' : 'outline'}
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
