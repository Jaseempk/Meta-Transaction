//SPDX-License-Identifier:MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RandomToken is ERC20{

    constructor()ERC20("",""){}
    function freeMint(uint256 amount)public{
        _mint(msg.sender,amount);
    }
    
}

contract TokenSender{
    using ECDSA for bytes32;

    //mapping
    mapping(bytes32 => bool) executed;

    function transfer(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract,
        uint256 nonce,
        bytes memory signature
    )public {

        bytes32 messageHash=getHash(sender,amount,recipient,tokenContract,nonce);

        //signing the hash of the message
        bytes32 signedMessageHash=messageHash.toEthSignedMessageHash();
        //can't send the same transaction multiple times
        require(!executed[signedMessageHash],"Can't use a nonce and same hash twice");

        //recovering the signer from the given signature
        address signer=signedMessageHash.recover(signature);
        //checking whether the extracted signer is same as the given address to ensure the integrity of the user 
        require(signer==sender,"Sender approval required");

        executed[signedMessageHash]=true;

        bool sent=ERC20(tokenContract).transferFrom(sender,recipient,amount);
        require(sent,"Token Transfer Failed");
    }


    function getHash(
        address sender,
        uint256 amount,
        address recipient,
        address tokenContract,
        uint256 nonce
    )public pure returns(bytes32){

        return(keccak256(
            abi.encodePacked(sender,amount,recipient,tokenContract,nonce)
        ));
    }
}