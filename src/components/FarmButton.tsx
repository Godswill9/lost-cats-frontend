import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const FarmButton = () => {
    const { updateCtsBalance, userName } = useUser();
    const [isFarming, setIsFarming] = useState(false);
    const [canClaim, setCanClaim] = useState(false);
    const [timer, setTimer] = useState<number | null>(null); // Timer in milliseconds

    useEffect(() => {
        // Log the API URL for debugging
        console.log('API URL:', import.meta.env.VITE_API_URL);

        // If there's a timer set, start a countdown
        if (timer !== null && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => (prev !== null && prev > 0 ? prev - 1000 : 0));
            }, 1000);
            return () => clearInterval(interval); // Clean up on component unmount
        }
    }, [timer]);

    const handleFarmClick = async () => {
        if (isFarming || canClaim) return; // Prevent multiple clicks

        setIsFarming(true);
        console.log(`Starting farming for user: ${userName}`);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/farm/farm`, { userName });
            setTimer(9 * 60 * 60 * 1000); // 9 hours in milliseconds
            
            setTimeout(() => {
                setCanClaim(true);
                setIsFarming(false);
                console.log(`Farming completed for user: ${userName}`);
            }, 9 * 60 * 60 * 1000); // Wait for 9 hours before enabling claim
        } catch (error: any) {
            console.error("Error starting farming:", error);
            alert(error.response?.data?.message || 'Error starting farming');
            setIsFarming(false);
        }
    };

    const handleClaim = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/farm/farm/claim`, { userName });
            updateCtsBalance(1000); // Add 1000 CTS to user's balance
            alert(response.data.message);
            setCanClaim(false);
            setTimer(null); // Reset timer after claiming
            console.log(`Claimed 1000 CTS for user: ${userName}`);
        } catch (error: any) {
            console.error("Error claiming CTS:", error);
            alert(error.response?.data?.message || 'Error claiming CTS');
        }
    };

    // Convert milliseconds to hours, minutes, and seconds
    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
                onClick={handleFarmClick}
                style={{
                    padding: '15px 30px',
                    borderRadius: '5px',
                    backgroundColor: '#00BFFF',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                }}
                disabled={isFarming || canClaim} // Disable button while farming or if reward can be claimed
            >
                {isFarming ? 'Farming...' : canClaim ? 'Claim your 1000 CTS!' : 'Farm for 1000 CTS'}
            </button>

            {/* Show loading animation and timer if farming is in progress */}
            {isFarming && timer !== null && (
                <div style={{ marginTop: '20px', fontSize: '18px', color: '#fff' }}>
                    <span>🌱 Farming in progress... Time left: {formatTime(timer)}</span>
                </div>
            )}

            {/* Show claim button if the user can claim the reward */}
            {canClaim && (
                <button
                    onClick={handleClaim}
                    style={{
                        padding: '15px 30px',
                        borderRadius: '5px',
                        backgroundColor: '#32CD32',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginTop: '10px',
                    }}
                >
                    Claim 1000 CTS
                </button>
            )}
        </div>
    );
};

export default FarmButton;
