-include .env

.PHONY: all test deploy

help:
		@echo "Usage:"
		@echo " make deploy [ARGS=...]"

build:; forge build

test:; forge test

ifeq ($(findstring --network goerli,$(ARGS)),--network goerli)
		NETWORK_ARGS := --rpc-url $(RPC_URL) --private-key $(FORGE_PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
endif

deploy:
		forge script contracts/script/DeployRafflePool.s.sol:DeployRafflePool $(NETWORK_ARGS)
