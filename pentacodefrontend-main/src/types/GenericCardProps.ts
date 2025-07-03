export interface GenericCardProps {
    title: string;
    description?: string;
    imageUrl?: string;
    footerContent?: string;
    to?: string;
    toData?: any;
    children?: React.ReactNode; // Add children property
}