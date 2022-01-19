import { useRouter } from "next/router";
import ProveFairness from "@/features/lottery/prove";

export default function Homepage() {
  const router = useRouter();
  return (
    <div className="mt-16 container mx-auto">
      <ProveFairness hash={router.query.hash} random={router.query.random} />
    </div>
  );
}
