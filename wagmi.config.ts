import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import * as chains from 'wagmi/chains'

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      exclude: [
        'DevOpsTools.sol/**',
        'mocks/**',
        'Fork.t.sol/**',
        'VRFCoordinatorV2Mock.sol/**',
        'ERC20.sol/**',
        // the following patterns are excluded by default
        'Common.sol/**',
        'Components.sol/**',
        'Script.sol/**',
        'StdAssertions.sol/**',
        'StdError.sol/**',
        'StdCheats.sol/**',
        'StdMath.sol/**',
        'StdJson.sol/**',
        'StdStorage.sol/**',
        'StdUtils.sol/**',
        'Vm.sol/**',
        'console.sol/**',
        'console2.sol/**',
        'test.sol/**',
        '**.s.sol/*.json',
        '**.t.sol/*.json',
      ],
      forge: {
        // `wagmi generate` was failing at `forge build` step by trying to specify --root in build command. 
        // So compiler failed in trying to find IERC20.sol file
        // `forge build` on its own works fine, so we can run that first and then run `npm run wagmi` to auto-generate React hooks
        build: false,
      },
      deployments: {
        StakePool: {
          [chains.goerli.id]: '0xf53C6016781F3F3ec9E40495CC21Ad0E1608292D',
        },
        RafflePool: {
          [chains.goerli.id]: '0xc797FcFD56152b5cDF16C87284eE3922cdfB1A5A',
        }
      },
      project: './contracts',
    }),
    react(),
  ],
})
