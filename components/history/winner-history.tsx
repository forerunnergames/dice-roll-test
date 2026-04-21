// Recent winners table — newspaper archive style.
// Data is fetched on the server (via getWinnerHistory in the parent page)
// and passed in as props. Emails are already masked.
export function WinnerHistory({
  winners,
}: {
  winners: { date: string; amount: number; email: string }[];
}) {
  if (winners.length === 0) {
    return (
      <p className="text-center text-sm text-foreground/40">
        No winners yet.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-center font-serif text-lg text-foreground/70">
        Recent Winners
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-foreground/10 text-foreground/50">
            <th scope="col" className="pb-2 text-left font-normal">Date</th>
            <th scope="col" className="pb-2 text-left font-normal">Winner</th>
            <th scope="col" className="pb-2 text-right font-normal">Pot</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((w) => (
            <tr
              key={w.date}
              className="border-b border-foreground/5 text-foreground/70"
            >
              <td className="py-2">{w.date}</td>
              <td className="py-2">{w.email}</td>
              <td className="py-2 text-right text-gold">
                {w.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
