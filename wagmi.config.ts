import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import * as chains from 'wagmi/chains';

export default defineConfig({
    out: 'src/generated.ts',
    plugins: [
        foundry({
            exclude: [
                'DevOpsTools.sol/**',
                'mocks',
                'other',
                'test',
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
            include: [
                'RafflePool.sol/**',
                'DonationPool.sol/**',
                'DonationFactory.sol/**',
                'IERC20Permit.sol/**',
            ],
            forge: {
                // `wagmi generate` was failing at `forge build` step by trying to specify --root in build command.
                // So compiler failed in trying to find IERC20.sol file
                // `forge build` on its own works fine, so we can run that first and then run `npm run wagmi` to auto-generate React hooks
                build: false,
            },
            deployments: {
                RafflePool: {
                    [chains.goerli.id]:
                        '0x82276EA98dF755d4AF1324142A236Fe1732E111d',
                },
                DonationFactory: {
                    [chains.goerli.id]:
                        '0x9eDA587356793083C7b91E622b8e666A654Ca0EE',
                },
            },
            project: './contracts',
        }),
        react(),
    ],
});
