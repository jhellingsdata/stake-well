'use client';
import React from 'react';
import { NotificationProps, InfoIconProps } from '../types';
import { BiErrorAlt } from 'react-icons/bi';
import { TiTickOutline } from 'react-icons/ti';
import { VscLoading } from 'react-icons/vsc';

const Notification = ({ title, message, type }: NotificationProps) => {
    return (
        <div className="mx-auto flex max-w-sm items-center space-x-4 rounded-xl bg-white p-6 shadow-md">
            <div className="shrink-0">
                {type === 'error' && <InfoIcon icon={<BiErrorAlt />} />}
                {type === 'success' && <InfoIcon icon={<TiTickOutline />} />}
                {type === 'loading' && <InfoIcon icon={<VscLoading />} />}
            </div>
            <div>
                <div className="text-xl font-medium text-black">{title}</div>
                <p className="text-slate-500">{message}</p>
            </div>
        </div>
    );
};

const InfoIcon: React.FC<InfoIconProps> = ({ icon }) => <div>{icon}</div>;

export default Notification;
