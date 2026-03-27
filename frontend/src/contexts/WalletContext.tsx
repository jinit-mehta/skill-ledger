import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { connectWallet } from "@/lib/wallet";
import { siweLogin } from "@/lib/siwe";
import { getToken, clearToken } from "@/lib/auth";

interface WalletContextType {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
    isLoading: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isConnected = Boolean(address);

    // Check if already connected on mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            // Try to reconnect
            checkConnection();
        }
    }, []);

    async function checkConnection() {
        try {
            const eth = (window as any).ethereum;
            if (!eth) return;

            const accounts = await eth.request({ method: "eth_accounts" });
            if (accounts && accounts[0]) {
                const network = await eth.request({ method: "eth_chainId" });
                setAddress(accounts[0]);
                setChainId(parseInt(network, 16));
            }
        } catch (error) {
            console.error("Failed to check connection:", error);
        }
    }

    async function connect() {
        try {
            setIsLoading(true);

            // 1. Connect wallet
            const { address: walletAddress, chainId: walletChainId } = await connectWallet();

            // 2. Perform SIWE login
            await siweLogin(walletAddress, walletChainId);

            // 3. Update state
            setAddress(walletAddress);
            setChainId(walletChainId);

            // 4. Listen for account/network changes
            const eth = (window as any).ethereum;
            if (eth) {
                eth.on("accountsChanged", handleAccountsChanged);
                eth.on("chainChanged", handleChainChanged);
            }
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    function disconnect() {
        setAddress(null);
        setChainId(null);
        clearToken();

        const eth = (window as any).ethereum;
        if (eth) {
            eth.removeListener("accountsChanged", handleAccountsChanged);
            eth.removeListener("chainChanged", handleChainChanged);
        }
    }

    function handleAccountsChanged(accounts: string[]) {
        if (accounts.length === 0) {
            disconnect();
        } else {
            setAddress(accounts[0]);
            // Re-do SIWE login with new account
            if (chainId) {
                siweLogin(accounts[0], chainId).catch(console.error);
            }
        }
    }

    function handleChainChanged(chainIdHex: string) {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        // Reload page on chain change to reset state
        window.location.reload();
    }

    return (
        <WalletContext.Provider
            value={{
                address,
                chainId,
                isConnected,
                isLoading,
                connect,
                disconnect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
