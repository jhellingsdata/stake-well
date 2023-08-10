import { Account } from '../components/Account'
import { Balance } from '../components/Balance'
import { Connect } from '../components/Connect'
import { Connected } from '../components/Connected'
import { Deposit } from '../components/Deposit'
import { NetworkSwitcher } from '../components/NetworkSwitcher'
import { PoolUserBalance } from '../components/PoolUserBalance'

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
        <hr />
        <h2>View Stake Balance</h2>
        <PoolUserBalance />
        <br />
        <hr />
      </Connected>
    </>
  )
}

export default Page
