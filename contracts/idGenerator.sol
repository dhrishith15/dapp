// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract idGenerator {
    uint public id;
    address public owner;
    uint public totalTickets;

    struct Ticket {
        uint ticketId;
        address buyer;
        uint timestamp;
        bool isValid;
    }

    mapping(uint => Ticket) public tickets;
    mapping(address => uint[]) public myTickets;

    event TicketIssued(
        uint indexed ticketId,
        address indexed buyer,
        uint timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function setId(uint x) public {
        id = x * 1000 * 231 + 129;
        totalTickets++;
        tickets[id] = Ticket(id, msg.sender, block.timestamp, true);
        myTickets[msg.sender].push(id);
        emit TicketIssued(id, msg.sender, block.timestamp);
    }

    function getMyTickets() public view returns (uint[] memory) {
        return myTickets[msg.sender];
    }

    function validateTicket(uint _ticketId) public view returns (bool) {
        return tickets[_ticketId].isValid;
    }
}