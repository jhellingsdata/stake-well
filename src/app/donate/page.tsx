import { Account } from '@/components/Account';
import { Balance } from '@/components/Balance';
import { Connect } from '@/components/Connect';
import { Connected } from '@/components/Connected';
import CreateCampaign from '@/components/CreateCampaign';

export default function Page() {
    return (
        <>
            <div className="mx-auto pt-10">
                <CreateCampaign />
            </div>
        </>
    );
}
