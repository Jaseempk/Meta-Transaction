# A hardhat project on Meta-Transaction

This project demonstrates about how Meta-transaction works and how to mitigate Replay attacks on the contracts.

**Meta Transactions:** In a meta transaction, a user (or a relayer on behalf of the user) signs a message indicating the desired transaction details. The relayer then submits the transaction to the blockchain and pays for the gas fees. The smart contract is executed, and the relayer is reimbursed or compensated by the user or the contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test

```
