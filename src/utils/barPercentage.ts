function barPercentage(startTime: EpochTimeStamp, interval: number): number {
    // add interval to startTime to get endTime, then calculate percentage
    const endTime = startTime + interval;
    const now = Date.now() / 1000;
    const percentage = (now - startTime) / (endTime - startTime) * 100;
    return percentage;
}

export default barPercentage;