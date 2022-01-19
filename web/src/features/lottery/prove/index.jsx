import { useState } from "react";
import LabelValue from "ui/label-value";

export default function ProveFairness({ random, hash }) {
  const [ethAddress, setEthAddress] = useState("");
  const [hashedProof, setHashedProof] = useState("");
  const [playerProof, setPlayerProof] = useState("");

  //player1.address 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  //rng 604
  //rngHash 0xb5a9ede9a93528be3e12c5665c179c2dc0e2648aa6f1b1650f3715e56dad8bec
  //userHash 0xeccfb675c4e39ea478d46e35913d2d9ee0d5fe050c00e9554f30a193b2b604ae

  async function prove() {
    const hashedNumber = await fetch("/api/hash", {
      method: "POST",
      body: JSON.stringify({ value: random }),
    });
    setHashedProof(`0x${await hashedNumber.text()}`);

    const hashedHashed = await fetch("/api/hash", {
      method: "POST",
      body: JSON.stringify({ value: hash + ethAddress }),
    });
    setPlayerProof(await hashedHashed.text());
  }

  return (
    <div className="border rounded my-2 p-24 bg-white text-purple-900">
      <div className="text-3xl font-bold text-center">
        Provable Fairness Hashing
      </div>

      <div className="border p-8 my-4 w-full">
        <div className="my-4 w-full text-2xl font-bold">
          Data from the contract
        </div>
        <LabelValue label="Hashed proof" value={hash} />
        <LabelValue label="Random number" value={random} />
      </div>

      {hashedProof && playerProof && (
        <div className="border p-8 my-4 w-full">
          <div className="my-4 w-full text-2xl font-bold">Result</div>
          <LabelValue label="Random number hash" value={hashedProof} />
          <LabelValue label="Player proof" value={playerProof} />
        </div>
      )}

      {hashedProof && playerProof && (
        <div className="border p-8 my-4 w-full">
          <div className="my-4">
            <div className="my-4 w-full text-2xl font-bold">What is this?</div>
            <p className="my-4">
              If you take the random number written immutably to the contract
              when the winner is drawn, and you take that number and hash it
              with a sha256 algorithm (prepending it with 0x), you will get the
              the hashed proof.
            </p>
            <p className="my-4">
              If you then take the hashed proof, also written immutably in the
              lottery contract at the time of creation, and then combine that
              with your eth address, and then run it through the sha256 hashing
              algorithm, you will get the Player proof .
            </p>

            <p className="my-4">
              That player proof will match here, proving that the random number
              was generated before the lottery started, and thus, provably fair!
            </p>
          </div>
        </div>
      )}

      {!hashedProof && !playerProof && (
        <div className="border p-8 my-4 w-full">
          <div className="w-full text-xl my-2">Enter your eth address:</div>
          <input
            className="border rounded-sm border-purple-700 w-full p-3"
            type="text"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
          />
          <div className="my-2 w-full">
            {ethAddress.length === 42 && (
              <button
                onClick={prove}
                className="border w-full rounded-sm text-white bg-purple-500 px-10 py-2">
                Prove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
