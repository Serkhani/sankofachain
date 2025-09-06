// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;



// ***********************************************

// ▗▖ ▗▖ ▗▄▖ ▗▖ ▗▖▗▄▄▄▖ ▗▄▄▖▗▄▄▄▖▗▄▖ ▗▖ ▗▖▗▄▄▄▖

// ▐▛▚▖▐▌▐▌ ▐▌▐▛▚▞▜▌▐▌ ▐▌ █ ▐▌ ▐▌▐▛▚▖▐▌▐▌

// ▐▌ ▝▜▌▐▛▀▜▌▐▌ ▐▌▐▛▀▀▘ ▝▀▚▖ █ ▐▌ ▐▌▐▌ ▝▜▌▐▛▀▀▘

// ▐▌ ▐▌▐▌ ▐▌▐▌ ▐▌▐▙▄▄▖▗▄▄▞▘ █ ▝▚▄▞▘▐▌ ▐▌▐▙▄▄▖

// ***********************************************



import {StringUtils} from "@ensdomains/ens-contracts/utils/StringUtils.sol";

import {IL2Registry} from "./interfaces/IL2Registry.sol";



/// @title Sankofa Chain ENS Registrar

/// @notice Handles free, permanent ENS registrations for sankofachain.eth subdomains

/// @dev This registrar allows direct, immediate registration without admin approval

contract SankofaRegistrar {

using StringUtils for string;



/*//////////////////////////////////////////////////////////////

EVENTS

//////////////////////////////////////////////////////////////*/



/// @notice Emitted when a name is registered

event NameRegistered(string indexed label, address indexed owner, bytes32 indexed node);



/*//////////////////////////////////////////////////////////////

STATE VARIABLES

//////////////////////////////////////////////////////////////*/



/// @notice Reference to the L2Registry contract

IL2Registry public immutable registry;



/// @notice The chainId for the current chain (Base)

uint256 public chainId;



/// @notice The coinType for the current chain (ENSIP-11)

uint256 public immutable coinType;



struct TextRecord {

string key;

string value;

}



/*//////////////////////////////////////////////////////////////

ERRORS

//////////////////////////////////////////////////////////////*/



error LabelTaken();

error LabelTooShort();



/*//////////////////////////////////////////////////////////////

CONSTRUCTOR

//////////////////////////////////////////////////////////////*/



constructor(address _registry) {

registry = IL2Registry(_registry);


// Save the chainId in memory (can only access this in assembly)

assembly {

sstore(chainId.slot, chainid())

}



// Calculate the coinType for the current chain according to ENSIP-11

coinType = (0x80000000 | chainId) >> 0;

}



/*//////////////////////////////////////////////////////////////

USER FUNCTIONS

//////////////////////////////////////////////////////////////*/



/// @notice Register an ENS subdomain permanently

/// @param label The desired subdomain (e.g., "alice" for alice.sankofachain.eth)

/// @param userDetails Array of text record data to set (optional)

/// @return node The ENS node hash of the registered subdomain

function register(

string calldata label,

TextRecord[] calldata userDetails

) external returns (bytes32) {

// Validate label

if (label.strlen() < 5) revert LabelTooShort();


// Check if label is available

if (!available(label)) revert LabelTaken();



// Prepare resolver data

bytes[] memory resolverData = new bytes[](userDetails.length + 2);


bytes32 subnode = _labelToNode(label);


// Set ETH address (coinType 60)

resolverData[0] = abi.encodeWithSignature(

"setAddr(bytes32,address)",

subnode,

msg.sender

);



// Set Base address (coinType for Base chain)

resolverData[1] = abi.encodeWithSignature(

"setAddr(bytes32,uint256,bytes)",

subnode,

coinType, // Base coinType according to ENSIP-11

abi.encodePacked(msg.sender)

);



// Set text records

for (uint i = 0; i < userDetails.length; i++) {

resolverData[i + 2] = abi.encodeWithSignature(

"setText(bytes32,string,string)",

subnode,

userDetails[i].key,

userDetails[i].value

);

}



// Create the subdomain with resolver data

bytes32 node = registry.createSubnode(

registry.baseNode(),

label,

msg.sender,

resolverData

);



emit NameRegistered(label, msg.sender, node);

return node;

}



/// @notice Register an ENS subdomain with basic setup only (addresses only)

/// @param label The desired subdomain (e.g., "alice" for alice.sankofachain.eth)

/// @return node The ENS node hash of the registered subdomain

function registerBasic(string calldata label) external returns (bytes32) {

// Validate label

if (label.strlen() < 3) revert LabelTooShort();


// Check if label is available

if (!available(label)) revert LabelTaken();



bytes32 subnode = _labelToNode(label);


// Prepare basic resolver data (just addresses)

bytes[] memory resolverData = new bytes[](2);


// Set ETH address (coinType 60)

resolverData[0] = abi.encodeWithSignature(

"setAddr(bytes32,address)",

subnode,

msg.sender

);



// Set Base address

resolverData[1] = abi.encodeWithSignature(

"setAddr(bytes32,uint256,bytes)",

subnode,

coinType,

abi.encodePacked(msg.sender)

);



// Create the subdomain with resolver data

bytes32 node = registry.createSubnode(

registry.baseNode(),

label,

msg.sender,

resolverData

);



emit NameRegistered(label, msg.sender, node);

return node;

}



/// @notice Overloaded register function for compatibility with Durin flow

/// @dev This creates an immediate registration with basic setup

/// @param label The label to register (e.g. "alice" for "alice.sankofachain.eth")

/// @param owner The address that will own the name

/// @return node The ENS node hash of the registered subdomain

function register(string calldata label, address owner) external returns (bytes32) {

// Validate label

if (label.strlen() < 3) revert LabelTooShort();


// Check if label is available

if (!available(label)) revert LabelTaken();



bytes32 subnode = _labelToNode(label);


// Prepare basic resolver data (just addresses)

bytes[] memory resolverData = new bytes[](2);


// Set ETH address (coinType 60)

resolverData[0] = abi.encodeWithSignature(

"setAddr(bytes32,address)",

subnode,

owner

);



// Set Base address

resolverData[1] = abi.encodeWithSignature(

"setAddr(bytes32,uint256,bytes)",

subnode,

coinType,

abi.encodePacked(owner)

);



// Create the subdomain with resolver data

bytes32 node = registry.createSubnode(

registry.baseNode(),

label,

owner,

resolverData

);



emit NameRegistered(label, owner, node);

return node;

}



/*//////////////////////////////////////////////////////////////

VIEW FUNCTIONS

//////////////////////////////////////////////////////////////*/



/// @notice Check if a label is available for registration

function available(string calldata label) public view returns (bool) {

bytes32 node = _labelToNode(label);

uint256 tokenId = uint256(node);



try registry.ownerOf(tokenId) {

return false;

} catch {

return label.strlen() >= 3;

}

}



/*//////////////////////////////////////////////////////////////

INTERNAL FUNCTIONS

//////////////////////////////////////////////////////////////*/



function _labelToNode(string memory label) private view returns (bytes32) {

return registry.makeNode(registry.baseNode(), label);

}

}