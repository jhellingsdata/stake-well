import { PoolUserBalance } from '@/components/PoolUserBalance';
import RaffleDetails from '@/components/RaffleDetails';
import { PoolTransaction } from '@/components/RaffleTransaction';

export default function Page() {
    return (
        <>
            <RaffleDetails />
            <PoolUserBalance />
            {/* <PoolTransaction /> */}
        </>
    );
}
