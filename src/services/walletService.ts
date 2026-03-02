import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

export async function connectWallet(): Promise<string[]> {
    try {
        const accounts = await peraWallet.connect();
        if (accounts.length > 0) {
            localStorage.setItem('walletAddress', accounts[0]);
        }
        peraWallet.connector?.on('disconnect', disconnectWallet);
        return accounts;
    } catch (error) {
        console.error('Wallet connection failed:', error);
        throw error;
    }
}

export async function disconnectWallet(): Promise<void> {
    peraWallet.disconnect();
    localStorage.removeItem('walletAddress');
}

export function getConnectedAddress(): string | null {
    return localStorage.getItem('walletAddress');
}

export async function reconnectSession(): Promise<string[]> {
    try {
        const accounts = await peraWallet.reconnectSession();
        if (accounts.length > 0) {
            localStorage.setItem('walletAddress', accounts[0]);
        }
        return accounts;
    } catch {
        return [];
    }
}

export { peraWallet };
