# Lottery Contract

## Asbtract

This contract(s) facilitate the means to host an online (web3) lottery game(s). At the main website, new lotteries can be spun up by the player themselves, known then as Operators, and they can earn between 1-3% of the total bids minus the Platform fees.

The platform also collects a fee (configurable via admin panel), and that fee can be 1-3%. This fee is deducted from the total ticket income before any Operator fees are deducted and before the final payout to the winner is calculated.

Games can have configurable run times, between 1 and 30 days currently. This min and max should also allow configuration via the admin panel.

Once a contract is deployed (the lottery has started), none of these values can be changed, either in the contract or by proxy.

When the lottery has completed, the platform will verify the result and release the funds to the winner, and the fees to the operator and the platform. This happens within 24 hours of the final result.

## Terms

### Platform

The platform is a proxy for the person who deployed the web3 app. Their crypto address (right now eth) will be used for payouts of all platform fees. This will be used for resources, marketing and further development of the platform.

### Operator

The person who creates a lottery to play. All operator fees go to them at the end of the drawing and releasing process.

### Player

Any person who pays into a lottery.

## Rules

1. Players can buy any number of tickets for the set ticket price. Since entering a lottery of 10 players 9 times would effectively guarantee that player as a winner, but adding in the fees, and the winning ticket price of the final player, there isn't really a great financial reason to do this; the winnings are simply too small for the amount of eth the majority player would have to put up.

2. Players can only buy tickets while the lottery is in play. Once closed for audit, there can be no more tickets bought.

## Provable Fairness

1. When a lottery is created, we create a random number
2. When the drawWinner method runs, we pass in the random number to the function
3. That random number has is then hashed against the players address
4. The hash is displayed to the player along with a formula to recreate the hash to verify it is the original hashed random number

## Challenges

1. Provalable random number needed to verify the lottery is far
2.
