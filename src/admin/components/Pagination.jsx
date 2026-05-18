// components/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, siblingCount = 1 }) => {
    const generatePageNumbers = () => {
        const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 1;

        if (!showLeftDots && showRightDots) {
            const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
            return [...leftRange, '...', totalPages];
        }

        if (showLeftDots && !showRightDots) {
            const rightRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPages - i).reverse();
            return [1, '...', ...rightRange];
        }

        if (showLeftDots && showRightDots) {
            const middleRange = Array.from(
                { length: rightSiblingIndex - leftSiblingIndex + 1 },
                (_, i) => leftSiblingIndex + i
            );
            return [1, '...', ...middleRange, '...', totalPages];
        }
    };

    const pages = generatePageNumbers();

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft size={18} />
            </button>

            {pages.map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                            ? 'bg-primary text-white'
                            : page === '...'
                            ? 'text-text-muted cursor-default hover:bg-transparent'
                            : 'text-text-secondary hover:bg-bg-el'
                    }`}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;