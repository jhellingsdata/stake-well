import { time } from "console";

function timeRemaining(startTime: EpochTimeStamp | number, interval: number, format?: boolean): number | string {
    // add interval to startTime to get endTime, then calculate percentage
    const endTime = startTime + interval;
    const now = Date.now() / 1000;
    const timeRemaining = endTime - now;

    if (format) {
        const time = convertSecondsToTime(timeRemaining);
        const displayTime = formatTimeRemaining(time);
        return displayTime;
    }
    return timeRemaining;
}

const convertSecondsToTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= (24 * 60 * 60);

    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= (60 * 60);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    return { days, hours, minutes, seconds };
}

const formatTimeRemaining = (time: { days: any; hours: any; minutes: any; seconds: any; }) => {
    let formatted = '';
    if (time.days > 0) formatted += `${time.days}d `;
    if (time.hours > 0) formatted += `${time.hours}h `;
    if (time.minutes > 0) formatted += `${time.minutes}m `;
    formatted += `${time.seconds}s`;

    return formatted;
}


export { timeRemaining, convertSecondsToTime, formatTimeRemaining }