import { Account } from '@/components/Account'
import { Balance } from '@/components/Balance'
import { Connect } from '@/components/Connect'
import { Connected } from '@/components/Connected'
import { Deposit } from '@/components/Deposit'
import { NetworkSwitcher } from '@/components/NetworkSwitcher'
import { PoolUserBalance } from '@/components/PoolUserBalance'
import { PoolTotalBalance } from '@/components/PoolTotalBalance'
import { PoolRewardsBalance } from '@/components/PoolRewardsBalance'
import { Withdraw } from '@/components/Withdraw'
import { DepositPermit } from '@/components/DepositPermit'
import { DepositApprove } from '@/components/DepositApprove'

export function Page() {
    return (
        <>
            <h1>A no-loss protocol to expand the use of Ethereum staking rewards.</h1>

            <Connect />

            <Connected>
                <hr />
                <h2>Network</h2>
                <NetworkSwitcher />
                <br />
                <hr />
                <h2>Account</h2>
                <Account />
                <br />
                <hr />
                <h2>Balance</h2>
                <Balance />
                <br />
                <hr />
                <h2>Deposit ETH</h2>
                <Deposit />
                <br />
                <h3>Deposit stETH using approve</h3>
                <DepositApprove />
                <h3>Deposit stETH using permit</h3>
                <DepositPermit permitDeadline={Math.floor(Date.now() / 1000) + 3600} />
                <br />
                <hr />
                <h2>View Stake Balance</h2>
                <PoolUserBalance decimals={18} />
                <br />
                <hr />
                <h2>View Pool Balance</h2>
                <PoolTotalBalance />
                <br />
                <hr />
                <h2>View Rewards Balance</h2>
                <PoolRewardsBalance />
                <br />
                <hr />
                <h2>Withdraw stETH</h2>
                <Withdraw />
                <br />
                <hr />
                <h2>View Time-weighted Average Balance</h2>
                {/* <PoolUserTwab decimals={18} /> */}
                <br />
                <hr />
            </Connected>
        </>
    )
}

export default Page