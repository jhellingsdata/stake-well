import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import * as chains from 'wagmi/chains'

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      deployments: {
        Pool: {
          [chains.mainnet.id]: '0xabc',
          [chains.goerli.id]: '0xdef',
          [chains.foundry.id]: '0xghi',
        },
      },
      project: './contracts',
    }),
    react(),
  ],
})
