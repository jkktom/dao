const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Token', () => {
  let token, dao
  let deployer,
      funder,
      investor1,
      investor2,
      investor3,
      investor4,
      investor5,
      recipient,
      user

  beforeEach(async () => {
    //Set up accounts
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]
    investor1 = accounts[2]
    investor2 = accounts[3]
    investor3 = accounts[4]
    investor4 = accounts[5]
    investor5 = accounts[6]
    recipient = accounts[7]
    user = accounts[8]

    //Deploy Tokens
    token = await 
      (await ethers.getContractFactory('Token'))
      .deploy('Dapp University', 'DAPP', '1000000')

    //Deploy the DAO
    dao = await 
      (await ethers.getContractFactory('DAO'))
      .deploy(token.address, '500000000000000000000001')

    //Deploy tokens to the investors
    await (
      await token.connect(deployer).transfer(investor1.address, tokens(200000))
      ).wait()
    await (
      await token.connect(deployer).transfer(investor2.address, tokens(200000))
      ).wait()
    await (
      await token.connect(deployer).transfer(investor3.address, tokens(200000))
      ).wait()
    await (
      await token.connect(deployer).transfer(investor4.address, tokens(200000))
      ).wait()
    await (
      await token.connect(deployer).transfer(investor5.address, tokens(200000))
      ).wait()

    //Funder sends 100 ETH to the DAO
    await funder.sendTransaction({to: dao.address, value: ether(100)})
  })

  describe('Deployment', () => {
    it('sends ether to the DAO treasyry', async()=> {
      expect(await ethers.provider.getBalance(dao.address)).to.eq(ether(100))
    })
    
    
    it('returns token address', async () => {
      expect(await dao.token()).to.equal(token.address)
    })
    it('returns quorum', async () => {
      expect(await dao.quorum()).to.equal('500000000000000000000001')
    })

  })

  describe('Proposal Creation', () => {

    describe('Success', () => {

      beforeEach(async() => {
        //Send 100 ETH to the proposal #1

        transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
        result = await transaction.wait()
      })
        
      it('udpates proposal count', async()=> {
        expect(await dao.proposalCount()).to.eq(1)
      })

      it('updates proposal mapping', async() => {
        const proposal = await dao.proposals(1)
        expect(proposal.id).to.eq(1)
        expect(proposal.amount).to.eq(ether(100))
        expect(proposal.recipient).to.eq(recipient.address)
      })

      it('emits a propose event', async()=> {
        await expect(transaction).to.emit(dao, 'Propose')
          .withArgs(1, ether(100), recipient.address, investor1.address)
      })

    })

    describe('Failure', ()=> {
      it('rejects invalid amount', async() => {
        await expect(dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address))
        .to.be.reverted
      })
      it('rejects non-investor', async() => {
        await expect
        (dao.connect(user).createProposal('Proposal 1', ether(1000), recipient.address))
        .to.be.reverted
      })
      
    })

    
    

  })


  describe('Voting ', () => {
    let transaction, result

    beforeEach(async() => {
      //Send 100 ETH to the proposal #1
      transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
      result = await transaction.wait()
    })

    describe('Success', () => {

      beforeEach(async() => {
        //Send 100 ETH to the proposal #1
        transaction = await dao.connect(investor1).vote(1)
        result = await transaction.wait()
      })
        
      it('udpates vote count', async()=> {
        const proposal = await dao.proposals(1)
        expect(proposal.votes).to.eq(tokens(200000))
      })

      it('emits vote event', async() => {
        await expect(transaction).to.emit(dao, "Vote")
          .withArgs(1, investor1.address)
      })


    })

    describe('Failure', ()=> {
      // it('rejects invalid amount', async() => {
      //   await expect(
      //     dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address))
      //   .to.be.reverted
      // })
      it('rejects non-investor', async() => {
        await expect(
          dao.connect(user).vote(1))
        .to.be.reverted
      })
      it('rejects Double Voting', async() => {
        await (
          await dao.connect(investor1).vote(1)
          ).wait()

        await expect(
          dao.connect(investor1).vote(1))
        .to.be.reverted
      })
      
    })

    
    

  })

})
