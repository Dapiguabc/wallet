import { LamdenBlockexplorer_API } from '../blockExplorer_API.js'
import whitelabel from '../../../whitelabel.json'

let lamdenNetworks = whitelabel.networks

export const networkController = (utils) => {
    let networksStore = {};
    const LamdenNetworkTypes = ['mainnet','testnet', 'devnet']

    chrome.storage.local.get({"networks":{}}, function(getValue) {
        networksStore = getValue.networks;
    })
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'networks') networksStore = changes[key].newValue;
        }
    });

    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason === "install") {
            purgeNetworksStorage()
        }
        if (details.reason === "update"){
            let currVer = chrome.runtime.getManifest().version;
            let prevVer = details.previousVersion
            if (currVer > prevVer){
                purgeNetworksStorage()
            }
        }
    });

    const purgeNetworksStorage = () => {
        networksStore.lamden = lamdenNetworks;
        chrome.storage.local.set({"networks": networksStore});
    }

    const networkKey = (networkObj) => {
        return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
    }

    const addNetworkKey = (networkObj) => {
        networkObj.networkKey = networkKey(networkObj)
        return networkObj
    }

    const addBlockexplorer = (networkObj) => {
        if (networkObj.blockExplorer){
            networkObj.blockExplorer_API = new LamdenBlockexplorer_API(`${networkObj.blockExplorer}/api`)
        }
    }

    const addExtras = (networkObj) => {
        addNetworkKey(networkObj)
        addBlockexplorer(networkObj)
        return networkObj
    }

    const getAll = () => {
        if (!Array.isArray(networksStore.user)) networksStore.user = []
        return [...networksStore.user, ...networksStore.lamden]
    }

    const getCurrent = () => {
        const networks = [...networksStore.lamden, ...networksStore.user]
        const foundNetwork = networks.find(network => networksStore.current === networkKey(network))
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const getNetwork = (networkInfo) => {
        let network = new utils.Lamden.Network(networkInfo)
        return addExtras(network)
    } 

    const getLamdenNetwork = (networkType, networkName="legacy") => {
        const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase() && networkName === network.networkName)
        if (!foundNetwork) return false;
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const isAcceptedNetwork = (networkType) => {
        return LamdenNetworkTypes.includes(networkType)
    }

    const contractExists = (networkType, contractName, networkName = "legacy") => {
        const networkInfo = getLamdenNetwork(networkType, networkName)
        if (!networkInfo) return false;
        const network = new utils.Lamden.Network(networkInfo)
        return network.contractExists(contractName)
    }

    const getLastetBlock = () => {
        return network.getLastetBlock()
    }
    return {
        getAll,
        getCurrent,
        getNetwork,
        getLamdenNetwork,
        isAcceptedNetwork,
        contractExists: (networkType, contractName, version = 1) => contractExists(networkType, contractName, version),
        getLastetBlock,
        LamdenNetworkTypes
    }
}