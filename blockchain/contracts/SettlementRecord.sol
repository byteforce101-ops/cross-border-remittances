// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SettlementRecord
 * @notice Immutable, privacy-preserving on-chain settlement ledger.
 *
 * Designed for cross-border institutional compliance and audit verification.
 * Only cryptographic hashes and non-PII financial metadata are stored on-chain.
 * No personal names, bank accounts, or sensitive identity records are ever committed.
 */
contract SettlementRecord {
    struct Record {
        bytes32 transactionHash;     // keccak256 hash of off-chain transaction ID
        string paymentRail;          // Identifier of rail (e.g. "blockchain_partner", "swift", "upi")
        uint256 amountINRMinor;      // Amount in minor currency units (paise)
        uint256 timestamp;           // Block timestamp of settlement proof
        bool isSettled;              // Settlement finality indicator
        bytes32 participantHash;     // Salted hash of (sender + recipient) - zero PII
    }

    address public owner;
    mapping(bytes32 => Record) private records;
    bytes32[] private recordHashes;

    event SettlementRecorded(
        bytes32 indexed transactionHash,
        string paymentRail,
        uint256 amountINRMinor,
        uint256 timestamp,
        bytes32 participantHash
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "SettlementRecord: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Records an immutable settlement event.
     * @param transactionHash Hash of the external transaction identifier
     * @param paymentRail Name of the payment rail used
     * @param amountINRMinor Net amount delivered in paise (1 INR = 100 paise)
     * @param participantHash Salted hash representing parties involved
     */
    function recordSettlement(
        bytes32 transactionHash,
        string calldata paymentRail,
        uint256 amountINRMinor,
        bytes32 participantHash
    ) external onlyOwner {
        require(transactionHash != bytes32(0), "Invalid transaction hash");
        require(!records[transactionHash].isSettled, "Settlement already recorded");

        Record memory newRecord = Record({
            transactionHash: transactionHash,
            paymentRail: paymentRail,
            amountINRMinor: amountINRMinor,
            timestamp: block.timestamp,
            isSettled: true,
            participantHash: participantHash
        });

        records[transactionHash] = newRecord;
        recordHashes.push(transactionHash);

        emit SettlementRecorded(
            transactionHash,
            paymentRail,
            amountINRMinor,
            block.timestamp,
            participantHash
        );
    }

    /**
     * @notice Verifies whether a given transaction hash has been settled on-chain.
     */
    function getSettlement(bytes32 transactionHash)
        external
        view
        returns (
            bool isSettled,
            string memory paymentRail,
            uint256 amountINRMinor,
            uint256 timestamp
        )
    {
        Record memory r = records[transactionHash];
        return (r.isSettled, r.paymentRail, r.amountINRMinor, r.timestamp);
    }

    /**
     * @notice Total number of settlements recorded.
     */
    function totalSettlements() external view returns (uint256) {
        return recordHashes.length;
    }
}
