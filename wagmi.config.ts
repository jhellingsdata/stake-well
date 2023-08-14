import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import * as chains from 'wagmi/chains'

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      forge: {
        // `wagmi generate` was failing at `forge build` step by trying to specify --root in build command. 
        // So compiler failed in trying to find IERC20.sol file
        // `forge build` on its own works fine, so we can run that first and then run `npm run wagmi` to auto-generate React hooks
        build: false,
      },
      deployments: {
        StakePool: {
          [chains.goerli.id]: '0x69E9b9c9756e79bdc6064D3349DC06a9AF95287A',
        },
      },
      project: './contracts',
    }),
    react(),
  ],
})
