export const getTimeGapLabel = (prevTime, currentTime) => {
    if (!currentTime) return null;

    const curr = new Date(currentTime);
    if (isNaN(curr)) return null;

    if (!prevTime) {
        return formatFullDate(curr);
    }

    const now = new Date();
    const prev = new Date(prevTime);
    if (isNaN(prev)) return null;

    const diffMs = curr - prev;
    const diffNow = now - curr;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffHoursNow = diffNow / (1000 * 60 * 60);
if (diffHoursNow >= 24){
    if (diffHours >= 24) {
        return formatFullDate(curr);
    }
}else{
    if (diffHours >= 1) {
        return formatHour(curr);
    }
}




    return null;
};

const formatFullDate = (date) =>
    date.toLocaleString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const formatHour = (date) =>
    date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
