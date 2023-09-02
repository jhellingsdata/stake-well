import { Account } from '@/components/Account'
import { Balance } from '@/components/Balance'
import { Connect } from '@/components/Connect'
import { Connected } from '@/components/Connected'
import CreateCampaign from '@/components/CreateCampaign'

export function Page() {
    return (
        <>
            <div className="mx-auto pt-10">
                <CreateCampaign />
            </div>
            <div className="hero">
                <div className="flex-1 pt-36 padding-x">
                    <h1 className="hero__title">
                        A no-loss protocol to expand the use of Ethereum staking rewards.
                    </h1>

                    <p className="hero__subtitle">
                        Support your favourite projects or win pooled rewards without risking your funds.
                    </p>

                </div>
            </div>
        </>
    )
}

export default Page