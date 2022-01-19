// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./console.sol";
import "./Ownable.sol";

contract Lottery is Ownable {
    address payable public operator;
    address payable[] public tickets;
    uint256 public ticketPrice;
    uint256 public minPlayers;
    uint256 public maxPlayers;

    address public winner = address(0);

    uint256 public constant MIN_TICKET_PRICE = .0003 ether;
    uint256 public constant MIN_OPERATOR_FEE_PERCENT = 0;
    uint256 public constant MAX_OPERATOR_FEE_PERCENT = 3;

    uint256 public operatorFeePercent;
    uint256 public platformFeePercent;

    bytes32 public rngHash;

    mapping(address => bytes32) public provableHashes;

    event LotteryMinted(
        uint256 _ticketPrice,
        uint256 _minPlayers,
        uint256 _maxPlayers,
        uint256 platformFeePercent,
        uint256 operatorFeePercent
    );
    event TicketSold(address indexed _from, uint256 _value);
    event WinnerDrawn(address _winner);
    event FeesReleased(address indexed _to, uint256 _amount);
    event WinningsReleased(address indexed _to, uint256 _amount);

    constructor(
        address payable _operator,
        uint256 _ticketPrice,
        uint256 _minPlayers,
        uint256 _maxPlayers,
        uint256 _platformFeePercent,
        uint256 _operatorFeePercent,
        bytes32 _rngHash
    ) {
        require(_ticketPrice > 0, "MIN_TICKET_PRICE_NOT_MET");
        require(_minPlayers >= 1, "MIN_PLAYERS_MUST_BE_GREATER_THAN_1");
        require(_maxPlayers <= 100, "MAX_PLAYERS_MUST_BE_LESS_THAN_101");
        require(
            _operatorFeePercent >= MIN_OPERATOR_FEE_PERCENT,
            "MIN_OPERATOR_FEE_PERCENT_MUST_BE_GREATER_THAN_-1"
        );
        require(
            _operatorFeePercent <= MAX_OPERATOR_FEE_PERCENT,
            "MIN_OPERATOR_FEE_PERCENT_MUST_BE_LESS_THAN_4"
        );

        operator = _operator;
        ticketPrice = _ticketPrice;
        minPlayers = _minPlayers;
        maxPlayers = _maxPlayers;
        rngHash = _rngHash;

        platformFeePercent = _platformFeePercent;
        operatorFeePercent = _operatorFeePercent;

        emit LotteryMinted(
            _ticketPrice,
            _minPlayers,
            _maxPlayers,
            _platformFeePercent,
            _operatorFeePercent
        );
    }

    function buyTicket() public payable {
        require(ticketsSold() < maxPlayers, "MAX_PLAYERS_EXCEEDED");
        require(msg.value == ticketPrice, "INCORRECT_TICKET_PRICE");

        tickets.push(payable(msg.sender));
        emit TicketSold(msg.sender, msg.value);
    }

    function drawWinner(uint256 randomNumber) public onlyOwner {
        require(winner == address(0), "WINNER_AREADY_DRAWN");
        require(ticketsSold() >= minPlayers, "MIN_PLAYERS_NOT_MET");

        uint256 index = randomNumber % ticketsSold();
        winner = tickets[index];

        emit WinnerDrawn(winner);
    }

    function release() public onlyOwner {
        require(winner != address(0), "NO_WINNER_DRAWN");

        address platform = owner();
        uint256 balance = address(this).balance;
        uint256 platformFee = fee(balance, platformFeePercent);
        uint256 operatorFee = fee(balance - platformFee, operatorFeePercent);

        payable(platform).transfer(platformFee);
        emit FeesReleased(platform, platformFee);

        payable(operator).transfer(operatorFee);
        emit FeesReleased(operator, operatorFee);

        uint256 balanceAfterFees = address(this).balance;
        payable(winner).transfer(balanceAfterFees);
        emit WinningsReleased(winner, balanceAfterFees);

        resetLottery();
    }

    function prizePool() public view returns (uint256) {
        uint256 balance = address(this).balance;
        uint256 platformFee = fee(balance, platformFeePercent);
        uint256 operatorFee = fee(balance - platformFee, operatorFeePercent);

        return balance - platformFee - operatorFee;
    }

    function ticketsSold() public view returns (uint256) {
        return tickets.length;
    }

    function fee(uint256 amount, uint256 percent)
        internal
        pure
        returns (uint256)
    {
        require(amount > 0, "AMOUNT_CANNOT_BE_ZERO");
        return (amount * percent) / 100;
    }

    function resetLottery() internal {
        tickets = new address payable[](0);
        winner = address(0);
    }
}
