require("@nomiclabs/hardhat-waffle");
const hash = require("simple-sha256");

const { ethers, expect, ZERO_ADDRESS } = require("./test-helper.js");

const ticketPrice = 300000000000000;

const INCORRECT_TICKET_PRICE = "INCORRECT_TICKET_PRICE";
const MIN_PLAYERS_NOT_MET = "MIN_PLAYERS_NOT_MET";
const MAX_PLAYERS_EXCEEDED = "MAX_PLAYERS_EXCEEDED";
const NO_WINNER_DRAWN = "NO_WINNER_DRAWN";
const WINNER_AREADY_DRAWN = "WINNER_AREADY_DRAWN";

const platformFeePercent = 1;
const operatorFeePercent = 1;

function calculateFeesAndPrize(num) {
  const balance = ticketPrice * num;
  const platformFee = fee(balance, platformFeePercent);
  const operatorFee = fee(balance - platformFee, operatorFeePercent);
  const balanceAfterFees = balance - platformFee - operatorFee;

  return {
    balance,
    platformFee,
    operatorFee,
    balanceAfterFees,
  };
}

function fee(amount, percent) {
  return amount * (percent / 100);
}

describe("Lottery", function () {
  let Contract,
    contract,
    platform,
    operator,
    player1,
    player2,
    player3,
    rng,
    rngHash;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory("Lottery");
    [platform, operator, player1, player2, player3] = await ethers.getSigners();
    rng = Math.floor(Math.random() * 1000);
    rngHash = `0x${await hash(rng.toString())}`;
    console.log("address", player1.address);
    userHash = `0x${await hash(rngHash + player1.address)}`;

    console.log("rng", rng);
    console.log("rngHash", rngHash);
    console.log("userHash", userHash);
  });

  describe("deployment", function () {
    beforeEach(async () => {
      contract = await Contract.connect(platform).deploy(
        operator.address,
        ticketPrice,
        3,
        100,
        platformFeePercent,
        operatorFeePercent,
        rngHash
      );
    });

    it("sets the owner to the platform", async function () {
      expect(await contract.owner()).to.equal(platform.address);
    });

    it("sets the ticketPrice", async function () {
      expect((await contract.ticketPrice()).toString()).to.be.equal(
        ticketPrice.toString()
      );
    });
  });

  describe("Starting a new Lottery", () => {
    beforeEach(async () => {
      contract = await Contract.connect(platform).deploy(
        operator.address,
        ticketPrice,
        3,
        100,
        platformFeePercent,
        operatorFeePercent,
        rngHash
      );
    });

    describe("buyTicket", () => {
      describe("Guards", async () => {
        it("prevents purchasing a ticket if the lottery is full", async () => {
          contract = await Contract.connect(platform).deploy(
            operator.address,
            ticketPrice,
            1,
            2,
            platformFeePercent,
            operatorFeePercent,
            rngHash
          );

          await contract.connect(player1).buyTicket({ value: ticketPrice });
          await contract.connect(player2).buyTicket({ value: ticketPrice });

          await expect(
            contract.connect(player3).buyTicket({ value: ticketPrice })
          ).to.be.revertedWith(MAX_PLAYERS_EXCEEDED);

          expect(await contract.ticketsSold()).to.equal(2);
        });

        it("prevents purchasing a ticket if the ticketPrice is not sent", async () => {
          await expect(
            contract.connect(player1).buyTicket({ value: 0 })
          ).to.be.revertedWith(INCORRECT_TICKET_PRICE);

          expect(await contract.ticketsSold()).to.equal(0);
        });

        it("allows purchasing a ticket if the ticketPrice is sent", async () => {
          await expect(
            contract.connect(player1).buyTicket({ value: ticketPrice })
          ).not.to.be.revertedWith(INCORRECT_TICKET_PRICE);

          expect(await contract.ticketsSold()).to.equal(1);
        });
      });

      describe("Events", () => {
        it("emits TicketSold event", async () => {
          await expect(
            contract.connect(player1).buyTicket({ value: ticketPrice })
          ).to.emit(contract, "TicketSold");
        });
      });
    });

    describe("drawWinner", () => {
      describe("Guards", async () => {
        context("without tickets sold", async () => {
          beforeEach(async () => {
            contract = await Contract.connect(platform).deploy(
              operator.address,
              ticketPrice,
              1,
              2,
              platformFeePercent,
              operatorFeePercent,
              rngHash
            );
          });

          it("cannot draw unless there are enough players playing", async () => {
            await expect(
              contract.connect(platform).drawWinner(rng)
            ).to.be.revertedWith(MIN_PLAYERS_NOT_MET);
          });
        });

        context("with minimum tickets sold", async () => {
          beforeEach(async () => {
            contract = await Contract.connect(platform).deploy(
              operator.address,
              ticketPrice,
              1,
              2,
              platformFeePercent,
              operatorFeePercent,
              rngHash
            );
            await contract.connect(player1).buyTicket({ value: ticketPrice });
          });

          it("allows draw", async () => {
            await expect(
              contract.connect(platform).drawWinner(rng)
            ).not.to.be.revertedWith(MIN_PLAYERS_NOT_MET);
          });

          context("already drawn", async () => {
            beforeEach(async () => {
              await contract.connect(platform).drawWinner(rng);
            });

            it("cannot draw winner twice", async () => {
              await expect(
                contract.connect(platform).drawWinner(rng)
              ).to.be.revertedWith(WINNER_AREADY_DRAWN);
            });
          });
        });
      });

      describe("Events", () => {
        beforeEach(async () => {
          contract = await Contract.connect(platform).deploy(
            operator.address,
            ticketPrice,
            1,
            2,
            platformFeePercent,
            operatorFeePercent,
            rngHash
          );
          await contract.connect(player1).buyTicket({ value: ticketPrice });
        });

        it("emits WinnerDrawn event", async () => {
          await expect(contract.connect(platform).drawWinner(rng)).to.emit(
            contract,
            "WinnerDrawn"
          );
        });
      });
    });

    describe("release", () => {
      beforeEach(async () => {
        contract = await Contract.connect(platform).deploy(
          operator.address,
          ticketPrice,
          1,
          2,
          platformFeePercent,
          operatorFeePercent,
          rngHash
        );
        await contract.connect(player1).buyTicket({ value: ticketPrice });
      });

      it("cannot release unless drawn", async () => {
        await expect(contract.connect(platform).release()).to.be.revertedWith(
          NO_WINNER_DRAWN
        );
      });

      context("after winner is drawn", () => {
        let platformFee, operatorFee, balanceAfterFees;

        beforeEach("", async () => {
          await contract.connect(platform).drawWinner(1);
          ({ platformFee, operatorFee, balanceAfterFees } =
            calculateFeesAndPrize(1));
        });

        it("emits FeesReleased event for the platform", async () => {
          await expect(contract.connect(platform).release())
            .to.emit(contract, "FeesReleased")
            .withArgs(platform.address, platformFee);
        });

        it("emits FeesReleased event for the operator", async () => {
          await expect(contract.connect(platform).release())
            .to.emit(contract, "FeesReleased")
            .withArgs(operator.address, operatorFee);
        });

        it("emits WinningsReleased event for the winner", async () => {
          await expect(contract.connect(platform).release())
            .to.emit(contract, "WinningsReleased")
            .withArgs(player1.address, balanceAfterFees);
        });

        it("resets the lottery", async () => {
          await contract.connect(platform).release();

          expect(await contract.winner()).to.equal(ZERO_ADDRESS);
          expect(await contract.ticketsSold()).to.equal(0);
        });
      });
    });
  });

  describe("Helper functions", () => {
    let balanceAfterFees;

    beforeEach(async () => {
      ({ balanceAfterFees } = calculateFeesAndPrize(1));

      contract = await Contract.connect(platform).deploy(
        operator.address,
        ticketPrice,
        3,
        100,
        platformFeePercent,
        operatorFeePercent,
        rngHash
      );
      await contract.connect(player1).buyTicket({ value: ticketPrice });
    });

    describe("prizePool", () => {
      it("less the fees", async () => {
        expect(await contract.prizePool()).to.equal(balanceAfterFees);
      });
    });

    describe("ticketsSold", () => {
      it("returns the number of tickets sold", async () => {
        expect(await contract.ticketsSold()).to.equal(1);
      });
    });
  });
});
