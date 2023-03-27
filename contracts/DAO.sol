//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";


contract DAO {
	address owner;
	Token public token;
	uint256 public quorum;

	struct Proposal{
		uint256 id;
		string name;
		uint256 amount;
		address payable recipient;
		uint256 votes;
		bool finalized;
	}
	
	uint256 public proposalCount;
	mapping(uint256 => Proposal) public proposals;
	
	event Propose(
		uint id,
		uint256 amount,
		address recipient,
		address creator
	);
	event Vote(
		uint256  id,
		address investor
	);
	event Finalize(
		uint256  id
	);

	constructor(Token _token, uint256 _quorum) {
		owner = msg.sender;
		token = _token;
		quorum = _quorum;
	}



	receive() external payable{}
		// Allow contract to recieve ether

	modifier onlyInvestor(){
		require(
			token.balanceOf(msg.sender) >0, 
			"must be token holder"
			);
		_;	
	}

	function createProposal (
		string memory _name, 
		uint256 _amount, 
		address payable _recipient
	) external onlyInvestor {
		require(address(this).balance >= _amount);
		
		proposalCount ++;

		proposals[proposalCount]= Proposal(
			proposalCount, 
			_name, 
			_amount, 
			_recipient, 
			0, 
			false
		);

		emit Propose(
			proposalCount, 
			_amount, 
			_recipient, 
			msg.sender);
	}

	mapping(address => mapping(uint256 => bool)) votes;

	//Vote on proposal
	function vote(uint256 _id) external onlyInvestor {
		//Fetch Proposal from mapping by id
		Proposal storage proposal = proposals[_id];

		//reject double voting
		require(!votes[msg.sender][_id] ,"already voted");

		//update votes
		proposal.votes += token.balanceOf(msg.sender);

		//Track that user has voted
		votes[msg.sender][_id] = true;

		//Emit an event
		emit Vote(_id, msg.sender);
	}

	//Finalize Proposal
	function finalizeProposal(uint256 _id) external onlyInvestor {

		//Fetch the proposal
		Proposal storage proposal = proposals[_id];
		
		//Ensure proposal is not already finalized
		require(!proposal.finalized, "proposal already finalized");
		
		//Mark as Finalized
		proposal.finalized = true;

		//check votes 50% up
		require(
			proposal.votes >= quorum, "must reach 50% i.e, quorum"
			);

		//check contract has enough ETH
		require(
			address(this).balance >= proposal.amount
			);


		//Transfer funds to recepient
		// proposal.recipient.transfer(proposal.amount);

		(bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
		require(sent);

		//Emit
		emit Finalize(_id);
	}
}
//











