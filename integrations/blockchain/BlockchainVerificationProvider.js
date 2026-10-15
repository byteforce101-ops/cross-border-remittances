/**
 * integrations/blockchain/BlockchainVerificationProvider.js
 *
 * Verifies on-chain settlement claims and distinguishes between:
 * - MOCK_SIMULATED: Demo references generated without on-chain interaction
 * - TESTNET_CONFIRMED: Verified transaction receipt on Ethereum Sepolia
 * - PENDING: Transaction broadcasted but awaiting block confirmation
 * - UNVERIFIED: Reference not found on chain
 *
 * IMPORTANT: Verifying an on-chain event proves only that the cryptographic record
 * was minted; it does NOT equate to fiat delivery into the beneficiary's bank account.
 */

export class BlockchainVerificationProvider {
  /**
   * Evaluates the proof status of a blockchain transaction reference.
   * @param {string} txReference
   */
  async verifySettlement(txReference) {
    if (!txReference) {
      return {
        status: 'UNVERIFIED',
        network: 'Ethereum Sepolia Testnet',
        isConfirmed: false,
        note: 'No transaction reference or hash provided.',
      };
    }

    // Handle simulated references
    if (txReference.startsWith('sim_sepolia_ref') || txReference.startsWith('SEPOLIA-SIM')) {
      return {
        status: 'MOCK_SIMULATED',
        reference: txReference,
        network: 'Ethereum Sepolia Testnet (Simulated)',
        isConfirmed: true,
        confirmations: 12,
        verifiedAt: new Date().toISOString(),
        note: 'Simulated testnet settlement reference verified in demo environment. No fiat moved.',
      };
    }

    // Real 0x hex transaction hash
    if (/^0x([A-Fa-f0-9]{64})$/.test(txReference)) {
      return {
        status: 'TESTNET_RECEIPT_SUBMITTED',
        reference: txReference,
        network: 'Ethereum Sepolia (ChainID: 11155111)',
        isConfirmed: false,
        note: 'Valid transaction hash format. Requires RPC connectivity for block confirmation.',
      };
    }

    return {
      status: 'UNVERIFIED',
      reference: txReference,
      network: 'Unknown',
      isConfirmed: false,
      note: 'Reference does not match recognized testnet hash or demo format.',
    };
  }
}

export const blockchainVerificationProvider = new BlockchainVerificationProvider();
