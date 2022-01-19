import Eth from "@/ui/units/eth";

export default function Tickets({ tickets, ticketPrice }) {
  return (
    <div>
      <div className="border rounded my-2 p-4 bg-white text-purple-900">
        <div className="text-lg font-bold">Tickets</div>
        <div>
          {Object.keys(tickets).map((address) => (
            <div className="flex space-x-2">
              <div className="flex-grow">{address}</div>
              <div>
                <Eth wei={tickets[address].ticketCount * ticketPrice} />
              </div>
              <div className="">({tickets[address].ticketCount})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
