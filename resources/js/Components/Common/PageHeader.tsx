import React from 'react';

interface PageHeaderProps {
    children: React.ReactNode;
}

const PageHeader = ({ children }: PageHeaderProps) => {
    return (
        <div className="sticky top-16 z-20 bg-surface -mx-8 lg:-mx-10 px-8 lg:px-10 pt-8 pb-2 mb-8">
            {children}
        </div>
    );
};

export default PageHeader;
