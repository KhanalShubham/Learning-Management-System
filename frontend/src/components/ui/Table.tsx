import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export type TableProps = React.HTMLAttributes<HTMLTableElement>;
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-lg border border-border/60 bg-card">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b border-border/80 bg-secondary/30', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border/40 transition-colors hover:bg-secondary/40 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle font-bold text-muted-foreground [&:has([role=checkbox])]:pr-0 text-xs uppercase tracking-wider',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0 text-foreground/80 font-medium text-xs', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
