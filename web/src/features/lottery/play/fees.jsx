import LabelValue from "ui/label-value";
import Percent from "@/ui/units/percent";

export default function Fees({ serviceFeePercent, platformFeePercent }) {
  return (
    <div className="border rounded my-2 p-4 bg-white text-purple-900">
      <div className="text-lg font-bold">Fees</div>
      <div>
        <LabelValue
          label={"Platform fee"}
          value={<Percent>{platformFeePercent}</Percent>}
        />
        <LabelValue
          label={"Owner fee"}
          value={<Percent>{serviceFeePercent}</Percent>}
        />
      </div>
    </div>
  );
}
