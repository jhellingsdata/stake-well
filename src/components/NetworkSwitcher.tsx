// 'use client'

// import { BaseError } from 'viem'
// import { useNetwork, useSwitchNetwork } from 'wagmi'
// import CustomButton from './CustomButton';

// export function NetworkSwitcher() {
//   const { chain } = useNetwork()
//   const { chains, error, isLoading, pendingChainId, switchNetwork } =
//     useSwitchNetwork()

//   return (
//     <div>
//       <div>
//         {chain?.name ?? chain?.id}
//         {chain?.unsupported && ' (unsupported)'}
//       </div>

// {switchNetwork && (
//   <div>
//     {chains.map((x) =>
//       x.id === chain?.id ? null : (
//         <button key={x.id} onClick={() => switchNetwork(x.id)}>
//           {x.name}
//           {isLoading && x.id === pendingChainId && ' (switching)'}
//         </button>
//       ),
//     )}
//   </div>
// )}

//       <div>{error && (error as BaseError).shortMessage}</div>
//     </div>
//   )
// }

'use client'

import { BaseError } from 'viem'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import CustomButton from './CustomButton';

export function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

  return (
    <div>
      {switchNetwork && (
        <div>
          {chains.map((x) =>
            x.id === chain?.id ? null : (
              <><CustomButton
                title={isLoading ? 'Check Wallet...' : `Switch to ${x.name}`}
                containerStyles='tracking-wide rounded-3xl px-4 bg-red-500 text-normal mr-4 ml-4'
                handleClick={() => switchNetwork(x.id)} />
              </>
            ),
          )}
        </div>
      )}
    </div>
  );
}

