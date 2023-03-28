import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
	const voteHandler = async(id) => {
		try{
			const signer = await provider.getSigner()
			const trasaction = await dao.connect(signer).vote(id)
			await trasaction.wait()
		} catch {
			window.alert('User rejected look for error')
		}


		setIsLoading(true)
	}

	const finalizeHandler = async(id) => {
		try{
			const signer = await provider.getSigner()
			const trasaction = await dao.connect(signer).finalizeProposal(id)
			await trasaction.wait()
		} catch {
			window.alert('User rejected look for error')
		}


		setIsLoading(true)
	}
	

	return (
		<Table striped bordered hover responsive>
			<thead>
				<tr>
					<th>#</th>
					<th>Proposal Name</th>
					<th>Recipient Address</th>
					<th>Amount</th>
					<th>Status</th>
					<th>Total Votes</th>
					<th>Cast Vote</th>
					<th>Finalize</th>
				</tr>
			</thead>
			<tbody>
			{proposals.map((proposal, index) => (
				<tr key={index}>
					<td>{proposal.id.toString()}</td>
					<td>{proposal.name}</td>
					<td>{proposal.recipient}</td>
					<td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
					<td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
					<td>{proposal.votes.toString()}</td>
					<td>
						{!proposal.finalized && (
							<Button 
							variant="primary" 
							onClick={() => voteHandler(proposal.id)}
							style={{width:'100%'}}>
							Vote</Button>
						)}
					</td><td>
						{!proposal.finalized && proposal.votes > quorum &&(
							<Button 
								variant="primary" 
								style={{width:'100%'}}
								onClick={() => finalizeHandler(proposal.id)}
							>
								Finalize
							</Button>
						)}
					</td>
				</tr>
				))}
			</tbody>
		</Table>
	);
}

export default Proposals;