import { format } from "date-fns";
import Eth from "@/ui/units/eth";

import Sumamry from "./summary";
import Tickets from "./tickets";
import Fees from "./fees";

export default function PlayLottery({
  owner,
  ticketPrice,
  minPlayers,
  maxPlayers,
  serviceFeePercent,
  platformFeePercent,
  tickets,
  startAt,
  endAt,
}) {
  function formatDateTime(t) {
    return format(t, "yyyy/mm/dd h:mmaaa");
  }
  const aggTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket]) {
      acc[ticket] = { ticketCount: 0 };
    }
    acc[ticket].ticketCount = acc[ticket].ticketCount + 1;
    return acc;
  }, {});

  const prize = tickets.reduce((acc, _) => acc + 1, 0) * ticketPrice;
  return (
    <div>
      <Sumamry
        {...{
          "Prize (minus fees)": (
            <Eth
              wei={prize * (serviceFeePercent + platformFeePercent) - prize}
            />
          ),
          "Started at": formatDateTime(startAt),
          "Ends” at": formatDateTime(endAt),
          "Ticket price": <Eth wei={ticketPrice} />,
          Players: `${minPlayers} - ${maxPlayers}`,
          Owner: owner,
        }}
      />

      <Fees
        serviceFeePercent={serviceFeePercent}
        platformFeePercent={platformFeePercent}
      />

      <Tickets tickets={aggTickets} ticketPrice={ticketPrice} />
    </div>
  );
}
