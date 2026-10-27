import React from 'react';

interface PageHeaderProps {
    children: React.ReactNode;
}

const PageHeader = ({ children }: PageHeaderProps) => {
    return (
        <div className="relative lg:sticky lg:top-16 z-30 bg-surface -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-8 pb-2 mb-4 sm:mb-8">
            {children}
        </div>
    );
};

export default PageHeader;
