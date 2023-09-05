import { MouseEventHandler } from 'react';

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    disabled?: boolean;
    handleClick?: MouseEventHandler<HTMLButtonElement>;
    handleMouseEnter?: MouseEventHandler<HTMLButtonElement>;
    handleMouseLeave?: MouseEventHandler<HTMLButtonElement>;
}

export interface InfoBoxProps {
    title: string;
    value: string;
    subscript?: string;
    containerStyles?: string;
}

export interface NotificationProps {
    title: string;
    message: string;
    type: 'success' | 'error' | 'loading';
}

export interface NavbarIconProps {
    icon: JSX.Element;
}

export interface InfoIconProps {
    icon: JSX.Element;
}
