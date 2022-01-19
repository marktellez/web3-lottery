import LabelValue from "ui/label-value";

export default function Summary(props) {
  return (
    <div className="border rounded my-2 p-4 bg-white text-purple-900">
      <div className="text-lg font-bold">Summary</div>
      <div>
        {Object.entries(props).map(([key, value]) => (
          <LabelValue label={key} value={value} />
        ))}
      </div>
    </div>
  );
}
