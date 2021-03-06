# CopyrightLY.io

Decentralized Application (ÐApp) for Copyright Management
(available on Ethereum's testnets *Rinkeby* and *Ropsten* through https://copyrightly.io)

[![Build Status](https://travis-ci.org/rogargon/copyrightly.io.svg?branch=master)](https://travis-ci.org/rogargon/copyrightly.io)


> Note: project originally developed to fulfil the 
[Consensys Academy 2018 Developer Program](https://courses.consensys.net/courses/course-v1:ConsenSysAcademy+2018DP+1/about) online course. 
The focus was on learning and showcasing a wide range of techniques and technologies (*IPFS*, *ENS*, *Oracles*, *Upgradeability*,...) and not
on providing a complete product. The project helped getting the top qualification for that cohort: ``114.8 of 120 points``.

CopyrightLY smart contracts allow content owners to register their works as what is called a 
[Manifestation](https://github.com/rhizomik/copyrightonto/tree/master/ActionsModel#overview), as modelled in the 
[Copyright Ontology](https://github.com/rhizomik/copyrightonto).

**Manifestations** are expressions of authors ideas into pieces of content that can be then used to prove authorship.
This is done through the [Manifestations](contracts/Manifestations.sol) contract, which records
the IPFS hash of the manifestation content, its title (additional metadata is planned) and when it was manifested. 
This information can be later used to prove authorship as the content can be retrieved from IPFS.

However, it is not enough to register a **Manifestation**. **Evidences** should be also provided to support the
authorship claim or the **Manifestation** will expire after one day. Usually done by the author registering the
**Manifestation** but anyone can add an **Evidence** supporting a **Manifestation**

There are **Evidences** based on content uploaded (to IPFS), implemented by the 
[UploadEvidences](contracts/UploadEvidences.sol) contract. The uploaded content can be anything, 
from a screenshot to a scanned contract in PDF format.

There are also **Evidences** based on having previously published the content online, for instance in YouTube.
The [YouTubeEvidences](contracts/YouTubeEvidences.sol) contract allows claiming that a video **Manifestation** 
content is also available on YouTube.

Future work:
 - Register YouTubeEvidences from the user interface.
 - Make it possible to register [Complaints](contracts/Complaints.sol) from the user interface, if someone else has registered content we own. Currently, the
 contract is implemented but its functionality is not available from the Web client.
 - Evidences can be also added to **Complaints**.
 - Implement a **[Token Curated Registry](https://medium.com/@tokencuratedregistry/a-simple-overview-of-token-curated-registries-84e2b7b19a06) (TCR)** 
 of **Evidences** supporting **Manifestations** and **Complaints**. 
 To add evidence, an amount of the **CLY token** has to be **staked**.
 Moreover, anyone (the curators) can also mint some CLY and stake it to support a piece of evidence, with the opportunity of winning additional
 CLY if they support evidence of a winning manifestation or claim... but the risk of losing it otherwise.

## Table of Contents
   
* [Table of Contents](#table-of-contents)
* [Features](#features)
* [Running Locally](#running-locally)
   * [Required Tools](#requirements)
   * [Smart Contracts Deployment](#smart-contracts-deployment)
   * [Launch Web Application](#launch-web-application)
* [Testing](#testing)
   * [Manifestations Contract](#manifestations-contract)
   * [UploadEvidences Contract](#UploadEvidences-contract)
   * [Complaints Contract](#complaints-contract)
   * [ExpirableLib Library](#expirablelib-library)
   * [Evidencable Contract](#evidencable-contract)
* [Design Pattern Requirements](#design-pattern-requirements)
* [Security Tools / Common Attacks](#security-tools--common-attacks)
* [Library / EthPM](#library--ethpm)
* [Additional Requirements](#additional-requirements)
* [Stretch Goals](#stretch-goals)
   * [IPFS](#ipfs)
   * [uPort](#uport)
   * [Ethereum Name Service](#ethereum-name-service)
   * [Oracles](#oracles)
   * [Upgradable Pattern Registry or Delegation](#upgradable-pattern-registry-or-delegation)
   * [LLL / Vyper](#lll--vyper)
   * [Testnet Deployment](#testnet-deployment)

## Features

The functionality provided to the users by the ÐApp through its Web application is:

1. [Minifest Single Authorship](e2e/features/1.manifest-single-authorship.feature)
   * Scenario: Register a piece of content not previously registered
   * Scenario: Register a piece of content previously registered

2. [Search Manifestation](e2e/features/2.search-manifestation.feature)
   * Scenario: Search a piece of content previously registered
   * Scenario: Search a piece of content not registered

3. [List Own Manifestations](e2e/features/3.list-own-manifestations.feature)
   * Scenario: List own manifestations when I have one

4. View Manifestation Details (*pending e2e tests*)
   * Scenario: Detail manifestation without evidence
   * Scenario: Detail manifestation with evidence
  
5. Add Uploadable Evidence to Manifestation (*pending e2e tests*)
   * Scenario: Add unused uploadable evidence
   * Scenario: Add previously used uploadable evidence
  
For each feature, the linked feature file specifies the steps to accomplish each scenario.
The steps are implemented in the [steps](e2e/src/steps) and [pages](e2e/src/pages) folders so 
it is possible to automatically check that the application implements the specified behaviour
using End-to-End (E2E) tests based on [Cucumber](https://cucumber.io) and [Protractor](https://www.protractortest.org). 

A report of the feature tests results is available: 
[protractor-cucumber_report](https://rawgit.com/rogargon/copyrightly.io/master/e2e/protractor-cucumber_report.html)

## Running Locally

### Requirements

Contract deployment and testing is done via [Truffle](https://truffleframework.com) 
and using [Ganache CLI](https://github.com/trufflesuite/ganache-cli). 

Client Web application development is based on [Angular](https://angular.io).

To install the project and all the required tools:

 1-. Clone the project with [Git](https://git-scm.com/downloads) 
 (or [download](https://github.com/rogargon/copyrightly.io/archive/master.zip) and unzip):
 
```
git clone https://github.com/rogargon/copyrightly.io.git
```

 2.- Install the project dependencies and development tools, using the following commands from the "copyrightly.io" folder
 (run ony by one, in the same order and waiting until the previous one ends):

```
cd copyrightly.io

npm install

```

### Smart Contracts Deployment

After npm has installed all dependencies (requires some time), it is time to deploy the ÐApp smart contracts.

First, start a local development network with the command:

```
npm run network
```

This will start **Ganache** in **http://127.0.0.1:8545** together with 10 sample accounts. 
These accounts are fixed using the seed: 

    candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

To be able to deploy the [YouTubeEvidences](contracts/YouTubeEvidences.sol) contract that make use of oracles,
as detailed in [Oracles](#oracles) section, it is also necessary to deploy the Oraclize Ethereum Bridge on the
local network using the following command from a separate terminal:

```
npm run ethereum-bridge
```

Finally, deploy the contracts from another terminal (leaving Ganache and the bridge running on the previous ones):

```
npm run migrate
```

If there are no errors, the contracts will be then deployed to the local development network. 

> In case the contracts have been previously deployed, and we want to force re-deployment, 
use the following command instead:
> 
> ```
> npm run migrate -- --reset
> ```

### Launch Web Application

Finally, to start the [Angular](https://angular.io/) client Web application locally:

```
npm start
```

Once started, it will be available at: http://localhost:4200

The client application provides the features listed in the [Features](#features) section above. 

It can be tested using the accounts provided by Ganache without requiring a Web3 enabled browser, so you
can even test it without the [MetaMask](https://metamask.io) extension or after disabling it. 

If [MetaMask](https://metamask.io) is available, it can be used to configure custom accounts and to sign transactions. 
For testing, you can load the accounts generated by Ganache using the following 
[seed phrase](https://www.chainbits.com/tools-and-platforms/how-to-use-metamask/#Recovering_Your_Vault):

    candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
    
Then, configure the network used by MetaMask to "Localhost 8545" as shown 
[here](https://github.com/MetaMask/faq/blob/master/images/click-the-test-network.png?raw=true).

Support for uPort is pending, but other very convenient Web3 enabled browsers can also be used. 
[Cipher](https://www.cipherbrowser.com) or [Coinbase Wallet](https://www.coinbase.com/mobile) 
are recommended on mobile devices. They provide nice features like transactions signing using 
TouchID/FaceID on iOS or Fingerprint Authentication on Android. 

They can be used to test the version of the application already deployed online at: 
https://copyrightly.io

The application is also available as a Docker container at: https://hub.docker.com/r/rogargon/copyrightly-io/

## Testing

The Solidity smart contracts feature a set of tests that can be launched with the following command:

```
npm run soltest
```

The application contracts, and all those imported by them, are compiled before running the tests. 
Some warnings might appear, but all of them are related to the imported contracts: 
*Proxy* and *AdminUpgradeabilityProxy* from ZeppelinOs.

The following sections describe the tests available for each smart contract, provide links to the 
files implementing then and list their expected outputs.

### Manifestations Contract

Source: [Manifestations.sol](contracts/Manifestations.sol)

This contract is responsible for registering *Manifestations*, the expressions of authors ideas into
pieces of content that can be then used to prove authorship. A manifestation is based on a content hash, 
some metadata (currently just the title) and the address of the account corresponding to its
author (or a list of addresses in the case of joint authorship).

There are 4 Solidity Tests that test the fundamental behaviour of the contract: that the contract
can register single and joint authorship (multiple authors for the same manifestation), that registering 
joint authorship providing just one author is equivalent to stating single authorship, and, finally, 
that the contract fails if and already registered content hash is used.

[TestManifestations.sol](test/TestManifestations.sol)
```
  TestManifestations
    ✓ testSingleAuthorRegistered (127ms)
    ✓ testJointAuthorRegistered (142ms)
    ✓ testSingleAuthorThroughJointAuthorRegistered (79ms)
    ✓ testAlreadyRegistered (56ms)
```

In addition to the previous Solidity tests, there are 14 additional tests of the same contract but from JavaScript.
It is tested again that single and joint authorship work, and that a previously registered manifestation can be later
retrieved.

[manifestations.test.js](test/manifestations.test.js)
```
  Contract: Manifestations - Single Authorship
    ✓ should register a previously unregistered manifestation (57ms)
    ✓ should retrieve a previously registered manifestation
    ✓ shouldn't register a previously registered manifestation

  Contract: Manifestations - Joint Authorship
    ✓ should register joint authorship for unregistered manifestation (55ms)
    ✓ should retrieve a previously registered joint authorship manifestation
    ✓ shouldn't register a previously registered joint authorship manifestation
```

Then, there are tests for the behaviours inherited from the contracts extended by *Manifestations*. 

From OpenZeppelin's *Pausable* and *Ownable*, that the contract can be paused and resumed, but just
by the contract owner.

[manifestations.test.js](test/manifestations_pausable.test.js)
```
  Contract: Manifestations - Pausable
    ✓ shouldn't work when paused by owner (55ms)
    ✓ should work again when unpaused by owner (86ms)
    ✓ shouldn't be paused by a non-owner
```

From ZeppelinOS' *AdminUpgradeabilityProxy*, that *Manifestations* is upgradable and retains state after 
an upgrade by the proxy admin. Then, that the proxy admin cannot use the proxy to call the proxied *Manifestations* 
contract, required for security reasons. Finally, that *Manifestations* cannot be re-initialized 
(it has been already initialized during the initial deployment migration). 
This behaviour is required to make *Manifestations* upgradable and inherited by extending *Initializable*.

[manifestations_upgradeability.test.js](test/manifestations_upgradeability.test.js)
```
  Contract: Manifestations - Upgradeability
    ✓ should keep stored manifestations after upgrade (151ms)
    ✓ shouldn't allow upgrade if called by non-admin (84ms)
    ✓ shouldn't work when called by admin through proxy for security
    ✓ should fail when trying to re-initialize it
```

Finally, the *Manifestations* contract uses the *ExpirableLib* library and extends the *Evidencable* contract, 
both detailed in a specific subsection below. 

*ExpirableLib* makes it possible to overwrite manifestations that have not received any authorship evidence before an 
expiry time. The following tests validate that a manifestation can be re-registered after it has expired, 
but only if it hasn't received any authorship evidence. 

To do so, a new version of the Manifestations contract just for testing is deployed with a "time to expiry" of just 2 seconds. 
The tests check that re-registration is possible just after more than 2 seconds, but just if no evidence has been added.

[manifestations_expirable.test.js](test/manifestations_expirable.test.js)
```
  Contract: Manifestations - Expirable
    ✓ should re-register just when already expired (3266ms)
    ✓ shouldn't expire if manifestation with evidence (3138ms)
```

### UploadEvidences Contract

Source: [UploadEvidences.sol](contracts/UploadEvidences.sol)

This contract implements the registration of evidence-based on uploading content to IPFS. It behaves as an
evidence provider for the contract specified when adding the evidence. However, the contract has to be registered
as an allowed evidence provider, in the case of these tests in the *Manifestations* contract.

Multiple evidence should be accumulated for the same manifestation, but just if they are new ones and if the
manifestation they are evidence for exists. Finally, only the owner of *Manifestations* can register
evidence providers. It is tested that just the owner of *Manifestations* can register a new provider that
then can add evidence as usual.

[uploadevidences.test.js](test/uploadevidences.test.js)
```
  Contract: UploadEvidences - Manifestations accumulate evidence
    ✓ should add evidence if registered evidence provider (220ms)
    ✓ should add multiple evidence for the same manifestation (124ms)
    ✓ shouldn't add the same evidence for the same manifestation (116ms)
    ✓ shouldn't add the same evidence for a different manifestation (142ms)
    ✓ shouldn't add evidence if the manifestation does not exist (522ms)
    ✓ shouldn't add evidence if not a registered evidence provider (556ms)
    ✓ should be enforced that just the owner registers evidence providers (558ms)

```

### Complaints Contract

Source: [Complaints.sol](contracts/Complaints.sol)

This contract was initially implemented using **Vyper** as detailed in the [LLL / Vyper](#lll--vyper) Section. 
Currently, it uses Solidity as the rest of contracts. It is responsible for registering complaints from accounts 
that consider that an existing manifestation is not a proper one, i.e. coming from the right creator. 

The corresponding tests verify that just one complaint about a given manifestation is allowed at the same
time. It is also checked that complaints can be revoked just by the contract owner. 
Finally, just existing and non-revoked complaints can be retrieved.

[complaints.test.js](test/complaints.test.js)
```
  Contract: Complaints - Register complaints
    ✓ should register a new complaint (160ms)
    ✓ shouldn't register a complaint if already one for manifestation
    ✓ shouldn't allow revoking complaint if not contract owner
    ✓ should retrieve an existing complaint
    ✓ should allow revoking complaint if contract owner (46ms)
    ✓ shouldn't allow retrieving a revoked complaint
    ✓ shouldn't allow retrieving an unexisting complaint
```

### ExpirableLib Library

Source: [ExpirableLib.sol](contracts/ExpirableLib.sol)

This library contains the logic for items with a creation and expiry time. With it, 
manifestations (or complaints) can expire after a certain amount of time. It is tested for **Manifestations** in: 
[manifestations_expirable.test.js](test/manifestations_expirable.test.js)

### Evidencable Contract

Source: [Evidencable.sol](contracts/Evidencable.sol)

This is a contract that provides the logic for items that can accumulate evidence. Manifestations (or complaints)
can receive evidence by extending this contract. 

The idea is that evidence is considered by curators to check the appropriateness of manifestations (and complaints).
Moreover, they are counted so manifestations (or complaints) that have accumulated at least one evidence do not expire,
as tested for **Manifestations** in: [manifestations_expirable.test.js](test/manifestations_expirable.test.js)

## Design Pattern Requirements

[Details about design pattern decisions](design_pattern_decisions.md)

## Security Tools / Common Attacks

[Details about avoiding common attacks](avoiding_common_attacks.md)

## Library / EthPM

The project imports the following Libraries and Contracts from the corresponding ZeppelinOs and OpenZeppelin 
NPM packages.

Imported from ZeppelinOS:
 - *AdminUpgradeabilityProxy*: the proxy contract to implement upgradeability.
 - *Initializable*: extended by upgradable contracts so they can be initialized from the corresponding proxy.
 
Imported from OpenZeppelin:
 - *Pausable*: contract to implement the "Circuit Breaker / Emergency Stop" design pattern. 
 It also extends *Ownable* to control that just the owner can stop it.
 - *SafeMath*: library that avoids the integer overflow and underflow issue.

Moreover, the OraclizeAPI package has been imported from the corresponding NPM package, concretely the 
following contract:
 - *usingOraclize*: implements the oracle used by YouTubeEvidences to check that a YouTube video is owned 
 by a particular user and linked to its manifestation.

> NOTE: previous versions of the project imported Oraclize using EthPM as specified in 
[ethpm.json](https://github.com/rogargon/copyrightly.io/blob/ConsensysAcademy2018/ethpm.json). 
However, switched to NPM because more up to date versions are available now using this tool.

## Additional Requirements

The smart contracts code has been commented according to the specs in the documentation
https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments and following the
Ethereum Natural Specification guidelines as documented in 
https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format 

## Stretch Goals

### IPFS

When a user registers a piece of content using a digital file, it is uploaded to IPFS and 
the corresponding IPFS identifier (hash) is used to register the manifestation of the content in Ethereum.
Users are offered the option of keeping content private, so it is not uploaded to IPFS and just the
content hash is generated. It can be later used as a proof of having the digital file so users are
recommended to keep the same exact file they used to generate the hash.

The same is done for evidence based on uploading content to IPFS, that then becomes available for inspection.

In both cases, the user interface provides links to IPFS to retrieve the uploaded content.

### uPort

When a user accesses the application from a browser that does not provide Web3, for instance without the MetaMask plugin or
after deactivating it, copyrightly.io will offer the option to login using uPort. 

As indicated in this case, the uPort mobile application is required to create an identity and the associated Ethereum accounts. 
The mobile application is used to scan the QR codes generated by the application to perform login or transaction signing.

Currently, the application uses uPort through the Rinkeby network. 
Please, make sure that you have or create an account in that network.

### Ethereum Name Service

To integrate ENS the guidelines available at https://medium.com/the-ethereum-name-service/adding-ens-into-your-dapp-72eb6deac26b
have been followed.

The **ethereum-ens** package has been installed and an Angular Service [EnsService](src/app/util/ens.service.ts) that 
implements reverse resolution of addresses to ENS names. This library works on the Main Ethereum Network, Ropsten and
Rinkeby. It has been checked with Ropsten and it works properly, showing the reverse of the currently selected account
in MetaMask instead of the address, if available.

The application has been prepared to also provide ENS when working with a local test network. To do so,
the **@ensdomains/ens** package has been also installed, which provides all ENS contracts to be deployed locally.
This is done with migration [4_deploy_ens.js](migrations/4_deploy_ens.js), which deploys them and also sets ENS names
for addresses 0, 1 and 2, respectively "Alice.eth", "Bob.eth" and "Charlie.eth".

### Oracles

An oracle has been used in the [YouTubeEvidences](contracts/YouTubeEvidences.sol) contract. 
This contract implements an Oracle that checks if a specific YouTube video, identified using its VIDEO_ID, has
in the description of its web page (https://www.youtube.com/watch?v=VIDEO_ID) a link to a specific content hash.

Thus, the Oracle allows a creator to assert that a manifestation is also available on YouTube as a video owned by
the same person, who should have access to edit the description of the video to include the link to the manifestation
using its hash.

The tests for this contract are possible in the Ganache test network using the 
[ethereum-bridge](https://github.com/oraclize/ethereum-bridge) as recommended in the Oraclize documentation. 
The tests are available from [youtubeevidences.test.js](test/youtubeevidences.test.js)

It also possible to test the Oraclize query online at: http://app.oraclize.it/home/test_query

For example: for the query: 

    html(https://www.youtube.com/watch?v=ZwVNLDIJKVA).xpath(count(//div[contains(@id,'description')]//a[contains(@href,'QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8')]))

The result should be **1.0** because there is a link to the proper manifestation in the video description for 
https://www.youtube.com/watch?v=ZwVNLDIJKVA

### Upgradable Pattern Registry or Delegation

To make the *Manifestations* contracts upgradable, the Delegation pattern has been used through a Relay or Proxy. 
Concretely, the *AdminUpgradeabilityProxy* provided by the ZeppelinOS Library, as detailed in 
https://docs.zeppelinos.org/docs/low_level_contract.html

Upgradeability of the *Manifestations* contract is tested in [manifestations_upgradeability.test.js](test/manifestations_upgradeability.test.js)

The file [6_upgrade_manifestations](migrations/6_upgrade_manifestations.js.example) provides an example of how
**Manifestations** can be upgraded adding a new migration step.

NOTE: When testing locally, the second account (accounts[1] with ENS name "Bob.eth") is configured as the proxy administrator. For
security reasons, if the admin account calls *Manifestations* through the proxy, the calls are not forwarded to the proxy. 
Consequently, this account cannot be used to register manifestations. A "revert" error will be generated.

### LLL / Vyper

A version of the *Complaints* contract has been also implemented using Vyper. 
The result is [Complaints.vy](https://github.com/rogargon/copyrightly.io/blob/ConsensysAcademy2018/contracts/Complaints.v.py), 
which was first validated and compiled using the [Vyper Online Compiler](https://vyper.online/)

To integrate Vyper with Truffle, the Vyper compiler must be installed first as detailed 
[here](https://vyper.readthedocs.io/en/latest/installing-vyper.html). Then, the project already installs the tool 
[truper](https://www.npmjs.com/package/truper) as part of its NPM development dependencies) that makes possible to use 
the following command to compile the Vyper contract and generate a Truffle compatible artifact:

NOTE: the last version of the application has ported this contract to Solidity. The Vyper version is available from the
branch corresponding to the [Consensys Academy 2018 submission](https://github.com/rogargon/copyrightly.io/tree/ConsensysAcademy2018/)

```
npm run vyper
```

For the moment, Truper just generates the artifacts in "build/contracts" so it should be moved to "src/assets/contracts".
This is the folder configured in [truffle.js](truffle.js) as the destination for Truffle artifacts so they are deployed with the
Angular frontend. Moreover, it should be renamed "Complaints.json" instead of the original "Complaints.vyper.json", as it seems Truffle
expects it with that name.

### Testnet Deployment

Deployments to both Ropsten and Rinkeby at the addresses detailed in the file: [deployed_addresses.txt](deployed_addresses.txt)

**Ropsten** deployment uses private HDWallet, so the owner and proxy admin accounts are not available. 
Ropsten is the network intended when using the client Web application deployed at: https://copyrightly.io

**Rinkeby** using public HDWallet with mnemonic: 

    candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

Therefore, anyone can test restricted methods like *pause()* or *unpause()* for the contracts' owner ( account[0] ) or 
*upgradeTo()* for the proxy contract admin ( accounts[1] ).
