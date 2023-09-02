import { MouseEventHandler } from "react";

export interface CustomButtonProps {
    title: string;
    containerStyles?: string;
    handleClick?:
    MouseEventHandler<HTMLButtonElement>;
}

export interface InfoBoxProps {
    title: string;
    value: string;
    subscript?: string;
}

export interface NavbarIconProps {
    icon: JSX.Element;
}

export interface InfoIconProps {
    icon: JSX.Element;
}