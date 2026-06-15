export function formatMessageTime(date){
    return new Date(date).toLocaleDateString("en-US",{
        hour:"2-digit",
        minute:"2-digit",
        hour12:false,
    })
}

export function formatLastSeen(date){
    if(!date) return 'Offline';
    const now = new Date();
    const lastSeen = new Date(date);
    const diffMs = now - lastSeen;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if(diffMin < 1) return 'Last seen just now';
    if(diffMin < 60) return `Last seen ${diffMin} min ago`;
    if(diffHrs < 24) return `Last seen ${diffHrs}h ago`;
    if(diffDays === 1) return 'Last seen yesterday';
    return `Last seen ${lastSeen.toLocaleDateString("en-US",{month:'short',day:'numeric'})}`;
}