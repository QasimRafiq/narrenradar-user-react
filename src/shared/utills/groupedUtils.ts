// Format date as dd.MM.yyyy (matching Android SimpleDateFormat)
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const groupAndFlattenEvents = (events: any[]) => {
  const grouped = events.reduce((acc, event) => {
    // Use formatted date as key (dd.MM.yyyy format matching Android)
    const eventTimestamp = Number(event.eventDate);
    const dateKey = formatDate(eventTimestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped)
    .sort((a, b) => {
      // Sort by timestamp (ascending) - matching Android sortedBy { it.eventDate }
      const timestampA = Number(a[1]?.[0]?.eventDate || 0);
      const timestampB = Number(b[1]?.[0]?.eventDate || 0);
      return timestampA - timestampB;
    })
    .flatMap(([date, events]) => {
      // Sort events alphabetically by name within each date group
      const sortedEvents = events.sort((a: any, b: any) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      return [
        {type: 'header', id: `header-${date}`, date},
        ...sortedEvents.map(e => ({...e, type: 'event'})),
      ];
    });
};
