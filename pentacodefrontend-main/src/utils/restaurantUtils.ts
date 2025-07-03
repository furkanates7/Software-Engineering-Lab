import { Restaurant } from '../types/NewRestaurant';

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});

export const isRestaurantOpen = (restaurant: Restaurant): boolean => {
    if (!restaurant.openingHours || !restaurant.closingHours) {
        return false;
    }

    try {
        const currentTime = new Date();
        const currentTimeString = TIME_FORMATTER.format(currentTime);
        
        // Format single-digit hours to two digits
        const formattedOpeningHours = restaurant.openingHours.replace(/^(\d):/, "0$1:");
        const formattedClosingHours = restaurant.closingHours.replace(/^(\d):/, "0$1:");

        // Convert times to minutes since midnight for easier comparison
        const currentMinutes = getMinutesSinceMidnight(currentTimeString);
        const openingMinutes = getMinutesSinceMidnight(formattedOpeningHours);
        const closingMinutes = getMinutesSinceMidnight(formattedClosingHours);

        // Handle case where restaurant is open past midnight
        if (closingMinutes < openingMinutes) {
            return currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
        }

        return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
    } catch (e) {
        console.error('Error checking restaurant open status:', e);
        return false;
    }
};

const getMinutesSinceMidnight = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}; 