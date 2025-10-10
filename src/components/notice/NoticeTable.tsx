import React, { useMemo, useState } from 'react';

import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notices } from '@/data/noticeData';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from '@/lib/icons';
import type { Notice } from '@/types/notice';
import { formatDateToYYMMDD } from '@/utils/formatDate';

import filter from '../../assets/icons/actions/filter.svg';
import { Button } from '../ui/button';

const NoticeTable: React.FC = () => {
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>(notices);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'최근순' | '오래된순'>('최근순');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState(10);

  const resetPagination = () => {
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    if (page < 1 || page > paginationInfo.totalPages) {
      console.warn(
        `Invalid page number: ${page}. Total pages: ${paginationInfo.totalPages}`
      );
      return;
    }
    setCurrentPage(page);
  };
  const handleFirstPage = () => {
    if (paginationInfo.totalPages > 0) {
      setCurrentPage(1);
    }
  };
  const handleLastPage = () => {
    if (paginationInfo.totalPages > 0) {
      setCurrentPage(paginationInfo.totalPages);
    }
  };
  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  const generatePageNumbers = () => {
    const { totalPages, currentPage } = paginationInfo;

    // Handle edge cases
    if (totalPages <= 0) {
      return [];
    }

    if (totalPages === 1) {
      return [1];
    }

    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 시간 필터링 함수
  const handleSortChange = (order: '최근순' | '오래된순') => {
    resetPagination();
    setSortOrder(order);

    // ISO 날짜 문자열을 Date 객체로 변환하는 함수 (시간 제외)
    const parseDate = (dateStr: string) => {
      const date = new Date(dateStr);
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    // 정렬된 데이터 생성
    const sorted = [...filteredNotices].sort((a, b) => {
      const dateA = parseDate(a.datetime);
      const dateB = parseDate(b.datetime);

      // 날짜가 동일한 경우 ID로 정렬
      if (dateA.getTime() === dateB.getTime()) {
        if (order === '최근순') {
          return b.id - a.id; // ID가 작은 것이 위로 (1, 2, 3...)
        } else {
          return a.id - b.id; // ID가 큰 것이 위로 (7, 6, 5...)
        }
      }

      // 날짜가 다른 경우 날짜로 정렬
      if (order === '최근순') {
        return dateB.getTime() - dateA.getTime(); // 최신순 (최신 날짜가 위로)
      } else {
        return dateA.getTime() - dateB.getTime(); // 오래된순 (오래된 날짜가 위로)
      }
    });

    setFilteredNotices(sorted);
  };

  const handleSearch = (searchValue: string) => {
    resetPagination();
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredNotices(notices);
      return;
    }

    const filtered = notices.filter((notice) => {
      const searchLower = searchValue.toLowerCase();

      return (
        notice.id.toString().includes(searchLower) ||
        notice.type.toLowerCase().includes(searchLower) ||
        notice.title.toLowerCase().includes(searchLower) ||
        notice.writer.toLowerCase().includes(searchLower) ||
        notice.content.toLowerCase().includes(searchLower) ||
        notice.datetime.toLowerCase().includes(searchLower)
      );
    });
    setFilteredNotices(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const paginationInfo = useMemo(() => {
    const totalItems = filteredNotices.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    return {
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      hasPrevPage,
      hasNextPage,
    };
  }, [currentPage, pageSize, filteredNotices]);

  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredNotices.slice(startIndex, endIndex);
  }, [currentPage, pageSize, filteredNotices]);

  const columns: ColumnDef<Notice>[] = [
    {
      accessorKey: 'id',
      header: '글 번호',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: '공지 구분',
      cell: ({ row }) => (
        <div className="text-center truncate">{row.getValue('type')}</div>
      ),
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <div className="text-left truncate">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'writer',
      header: '작성자',
      cell: ({ row }) => (
        <div className="text-center truncate">
          {row.getValue('writer') || '담당자 없음'}
        </div>
      ),
    },
    {
      accessorKey: 'datetime',
      header: '작성 일자',
      cell: ({ row }) => (
        <div className="text-center">
          {formatDateToYYMMDD(row.getValue('datetime'))}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* 검색 및 필터 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] mb-3">
        {/* 검색 영역 */}
        <div className="flex gap-2 items-center justify-start mb-3 lg:mb-0">
          <div className="relative flex flex-1 lg:flex-auto lg:max-w-60">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                isSearchFocused ? 'text-light-green' : 'text-[#575757]'
              }`}
            />
            <input
              type="text"
              placeholder="제목+내용 검색"
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

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center w-24 border border-a2a2a2 md:border-[#575757] outline-none text-sm p-0"
                  title={`현재: ${sortOrder === '최근순' ? '최근순' : '오래된순'}`}
                >
                  <img
                    src={filter}
                    alt="시간순서 필터 버튼"
                    className="object-cover w-5"
                  />
                  {sortOrder}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSortChange('최근순')}>
                  최근 민원 순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('오래된순')}>
                  옛 민원 순
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <DataTable columns={columns} data={paginatedNotices} />
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 0 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handleFirstPage}
              disabled={!paginationInfo.hasPrevPage}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handlePrevPage}
              disabled={!paginationInfo.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
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
              onClick={handleNextPage}
              disabled={!paginationInfo.hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handleLastPage}
              disabled={!paginationInfo.hasNextPage}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeTable;
