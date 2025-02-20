export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const getInitials = (name) => {

    if(!name) return "";

    const words = name.split(" ");
    let initials = "";

    for (let i = 0; i < Math.min(words.length,2); i++){
        initials += words[i][0]
    }

    return initials.toUpperCase();
}

export const getEmptyCardMessage = (filterType) => {
    switch (filterType) {
        case 'search':
            return `Oops! No stories found for search query.`
        case 'date':
            return `Oops! No stories found for selected date range.`
        default:
            return `Start creating your first Travel Story! Click the 'Add' button to jot down your thoughts, ideas, and memories, Let's get started!`;
    }
}

export const getEmptyCardImg = (filterType) => {
    switch (filterType) {
        case 'search':
            return '/images/empty-search.png'
        case 'date':
            return '/images/empty-date.png'
        default:
            return '/images/empty.png';
    }
}