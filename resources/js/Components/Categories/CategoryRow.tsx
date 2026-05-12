import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react';
import { ChevronRight, Edit2, MoreVertical, Trash2, PlusCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LucideIcon from '@/Components/Common/LucideIcon';
import { useTranslation } from '@/Hooks/useTranslation';
import DropdownSelector from '@/Components/Common/DropdownSelector';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Category {
    id: number;
    name: string;
    type: string;
    parent_id: number | null;
    is_system?: boolean;
    ui_metadata?: {
        icon?: string;
        color?: string;
    };
    children?: Category[];
}

interface CategoryRowProps {
    category: Category;
    isChild?: boolean;
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onAddSub?: (category: Category) => void;
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'revenue': return 'TrendingUp';
        case 'expense': return 'TrendingDown';
        default: return 'Tag';
    }
};

export default function CategoryRow({ 
    category, 
    isChild = false,
    onEdit,
    onDelete,
    onAddSub
}: CategoryRowProps) {
    const { t } = useTranslation();
    const hasChildren = category.children && category.children.length > 0;
    
    const customColor = category.ui_metadata?.color;
    const typeColorClass = category.type === 'revenue' 
        ? "bg-emerald-50 text-emerald-600" 
        : "bg-rose-50 text-rose-600";

    const initials = category.name.substring(0, 3).toUpperCase();
    const isRoot = !category.parent_id;

    const renderContent = (open?: boolean) => (
        <div className={cn(
            "flex items-center justify-between p-4 transition-all duration-200 group/row",
            isRoot 
                ? "bg-white hover:bg-slate-50 border-b border-slate-100" 
                : "bg-slate-50 border-l-2 border-b border-slate-100"
        )}>
            <div className={cn("flex items-center gap-4", !isRoot && "ml-4")}>
                <div 
                    className={cn("w-9 h-9 min-w-[36px] rounded-xl flex items-center justify-center transition-colors overflow-hidden", typeColorClass)}
                    style={customColor ? { 
                        backgroundColor: `${customColor}15`, 
                        color: customColor 
                    } : undefined}
                >
                    {category.ui_metadata?.icon ? (
                        <LucideIcon 
                            name={category.ui_metadata.icon} 
                            className="w-4 h-4" 
                        />
                    ) : (
                        isRoot ? (
                            <LucideIcon 
                                name={getTypeIcon(category.type)} 
                                className="w-4 h-4" 
                            />
                        ) : (
                            <span className="text-[10px] font-black tracking-tight leading-none pointer-events-none">
                                {initials}
                            </span>
                        )
                    )}
                </div>
                
                <div className="flex flex-col">
                    <h5 className={cn("font-bold text-slate-900", isRoot ? "text-sm" : "text-xs")}>
                        {category.name}
                    </h5>
                    {hasChildren && (
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                            {`${category.children?.length ?? 0} ${category.children?.length === 1 ? t('categories.page.children_count_singular') : t('categories.page.children_count')}`}
                        </span> 
                    )}
                </div>

            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center justify-end gap-2"> 
                    
                    <div className="opacity-0 group-hover/row:opacity-100 transition-all">
                        <DropdownSelector>
                            <DropdownSelector.Trigger 
                                showChevron={false}
                                className="p-1.5 h-8 w-8 min-w-[32px] rounded-lg border-transparent shadow-none! cursor-pointer focus:ring-0 focus:outline-none"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            </DropdownSelector.Trigger>
                            <DropdownSelector.Panel align="right" placement='top' className="w-56 p-1">
                                {!isChild && (
                                    <DropdownSelector.Item 
                                        onClick={(e: any) => {
                                            e.stopPropagation();
                                            onAddSub?.(category);
                                        }}
                                        className="flex items-center gap-2 p-2 text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer transition-colors"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        {t('categories.actions.add_subcategory')}
                                    </DropdownSelector.Item>
                                )}

                                <DropdownSelector.Item 
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                        onEdit?.(category);
                                    }}
                                    className="flex items-center gap-2 p-2 text-xs font-bold text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    {t('categories.actions.edit')}
                                </DropdownSelector.Item>
                                
                                <DropdownSelector.Item 
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                        onDelete?.(category);
                                    }}
                                    className="flex items-center gap-2 p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {t('categories.actions.delete')}
                                </DropdownSelector.Item>
                            </DropdownSelector.Panel>
                        </DropdownSelector>
                    </div>

                    {hasChildren && (
                        <ChevronRight className={cn(
                            "w-5 h-5 text-slate-400 transition-transform duration-200",
                            open && "rotate-90"
                        )} />
                    )}
                </div>
            </div>
        </div>
    );

    if (!hasChildren) {
        return <div className="border-b border-slate-100 last:border-0">{renderContent()}</div>;
    }

    return (
        <Disclosure as="div" className="border-b border-slate-100 last:border-0">
            {({ open }) => (
                <>
                    <DisclosureButton as="div" className="w-full text-left focus:outline-none cursor-pointer">
                        {renderContent(open)}
                    </DisclosureButton>
                    
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <DisclosurePanel className="pb-0">
                            {category.children?.map(child => (
                                <CategoryRow 
                                    key={child.id} 
                                    category={child} 
                                    isChild 
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onAddSub={onAddSub}
                                />
                            ))}
                        </DisclosurePanel>
                    </Transition>
                </>
            )}
        </Disclosure>
    );
}
