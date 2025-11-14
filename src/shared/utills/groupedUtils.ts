export const groupAndFlattenEvents = (events: any[]) => {
  const grouped = events.reduce((acc, event) => {
    const dateKey = new Date(Number(event.eventDate)).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .flatMap(([date, events]) => [
      {type: 'header', id: `header-${date}`, date},
      ...events.map(e => ({...e, type: 'event'})),
    ]);
};
