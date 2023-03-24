import { NSFull } from "../NetscriptFunctions";

/** The API does not include enums, args, or pid. */
export type RamCostTree<API> = {
    [key in keyof API]: API[key] extends () => unknown
        ? number | (() => number)
        : RamCostTree<API[key]>;
};

/** Constants for assigning costs to ns functions */
export const RamCostConstants = {
    Base: 1.6,
    Dom: 25,
    Corporation: 1024,
    Max: 1024,
    Hack: 0.1,
    HackAnalyze: 1,
    Grow: 0.15,
    GrowthAnalyze: 1,
    Weaken: 0.15,
    WeakenAnalyze: 1,
    Scan: 0.2,
    RecentScripts: 0.2,
    PortProgram: 0.05,
    Run: 1.0,
    Exec: 1.3,
    Spawn: 2.0,
    Scp: 0.6,
    Kill: 0.5,
    HasRootAccess: 0.05,
    GetHostname: 0.05,
    GetHackingLevel: 0.05,
    GetServer: 0.1,
    GetServerMaxRam: 0.05,
    GetServerUsedRam: 0.05,
    FileExists: 0.1,
    IsRunning: 0.1,
    HacknetNodes: 4.0,
    HNUpgLevel: 0.4,
    HNUpgRam: 0.6,
    HNUpgCore: 0.8,
    GetStock: 2.0,
    BuySellStock: 2.5,
    GetPurchaseServer: 0.25,
    PurchaseServer: 2.25,
    GetPurchasedServerLimit: 0.05,
    GetPurchasedServerMaxRam: 0.05,
    Round: 0.05,
    ReadWrite: 1.0,
    ArbScript: 1.0,
    GetScript: 0.1,
    GetRunningScript: 0.3,
    GetHackTime: 0.05,
    GetFavorToDonate: 0.1,
    CodingContractBase: 10,
    SleeveBase: 4,
    ClearTerminalCost: 0.2,
    GetMoneySourcesCost: 1.0,

    SingularityFn1: 2,
    SingularityFn2: 3,
    SingularityFn3: 5,

    GangApiBase: 4,

    BladeburnerApiBase: 4,

    StanekWidth: 0.4,
    StanekHeight: 0.4,
    StanekCharge: 0.4,
    StanekFragmentDefinitions: 0,
    StanekPlacedFragments: 5,
    StanekClear: 0,
    StanekCanPlace: 0.5,
    StanekPlace: 5,
    StanekFragmentAt: 2,
    StanekDeleteAt: 0.15,
    InfiltrationCalculateDifficulty: 2.5,
    InfiltrationCalculateRewards: 2.5,
    InfiltrationGetLocations: 5,
    InfiltrationGetInfiltrations: 15,
    StanekAcceptGift: 2,
};

//TODO: Figure out what to do with the player object

class Player {
    static bitNodeN: number;
    static sourceFileLvl: (num: number) => number;
}

function SF4Cost(cost: number): () => number {
    return () => {
        if (Player.bitNodeN === 4) {
            return cost;
        }
        const sf4 = Player.sourceFileLvl(4);
        if (sf4 <= 1) {
            return cost * 16;
        }
        if (sf4 === 2) {
            return cost * 4;
        }
        return cost;
    };
}

// Hacknet API
const hacknet = {
    numNodes: 0,
    purchaseNode: 0,
    getPurchaseNodeCost: 0,
    getNodeStats: 0,
    upgradeLevel: 0,
    upgradeRam: 0,
    upgradeCore: 0,
    upgradeCache: 0,
    getLevelUpgradeCost: 0,
    getRamUpgradeCost: 0,
    getCoreUpgradeCost: 0,
    getCacheUpgradeCost: 0,
    numHashes: 0,
    hashCost: 0,
    spendHashes: 0,
    maxNumNodes: 0,
    hashCapacity: 0,
    getHashUpgrades: 0,
    getHashUpgradeLevel: 0,
    getStudyMult: 0,
    getTrainingMult: 0,
} as const;

// Stock API
const stock = {
    hasWSEAccount: 0.05,
    hasTIXAPIAccess: 0.05,
    has4SData: 0.05,
    has4SDataTIXAPI: 0.05,
    getSymbols: RamCostConstants.GetStock,
    getPrice: RamCostConstants.GetStock,
    getOrganization: RamCostConstants.GetStock,
    getAskPrice: RamCostConstants.GetStock,
    getBidPrice: RamCostConstants.GetStock,
    getPosition: RamCostConstants.GetStock,
    getMaxShares: RamCostConstants.GetStock,
    getPurchaseCost: RamCostConstants.GetStock,
    getSaleGain: RamCostConstants.GetStock,
    buyStock: RamCostConstants.BuySellStock,
    sellStock: RamCostConstants.BuySellStock,
    buyShort: RamCostConstants.BuySellStock,
    sellShort: RamCostConstants.BuySellStock,
    placeOrder: RamCostConstants.BuySellStock,
    cancelOrder: RamCostConstants.BuySellStock,
    getOrders: RamCostConstants.BuySellStock,
    getVolatility: RamCostConstants.BuySellStock,
    getForecast: RamCostConstants.BuySellStock,
    purchase4SMarketData: RamCostConstants.BuySellStock,
    purchase4SMarketDataTixApi: RamCostConstants.BuySellStock,
    purchaseWseAccount: RamCostConstants.BuySellStock,
    purchaseTixApi: RamCostConstants.BuySellStock,
} as const;

// Singularity API
const singularity = {
    universityCourse: SF4Cost(RamCostConstants.SingularityFn1),
    gymWorkout: SF4Cost(RamCostConstants.SingularityFn1),
    travelToCity: SF4Cost(RamCostConstants.SingularityFn1),
    goToLocation: SF4Cost(RamCostConstants.SingularityFn3),
    purchaseTor: SF4Cost(RamCostConstants.SingularityFn1),
    purchaseProgram: SF4Cost(RamCostConstants.SingularityFn1),
    getCurrentServer: SF4Cost(RamCostConstants.SingularityFn1),
    connect: SF4Cost(RamCostConstants.SingularityFn1),
    manualHack: SF4Cost(RamCostConstants.SingularityFn1),
    installBackdoor: SF4Cost(RamCostConstants.SingularityFn1),
    getDarkwebProgramCost: SF4Cost(RamCostConstants.SingularityFn1 / 4),
    getDarkwebPrograms: SF4Cost(RamCostConstants.SingularityFn1 / 4),
    hospitalize: SF4Cost(RamCostConstants.SingularityFn1 / 4),
    isBusy: SF4Cost(RamCostConstants.SingularityFn1 / 4),
    stopAction: SF4Cost(RamCostConstants.SingularityFn1 / 2),
    upgradeHomeRam: SF4Cost(RamCostConstants.SingularityFn2),
    upgradeHomeCores: SF4Cost(RamCostConstants.SingularityFn2),
    getUpgradeHomeRamCost: SF4Cost(RamCostConstants.SingularityFn2 / 2),
    getUpgradeHomeCoresCost: SF4Cost(RamCostConstants.SingularityFn2 / 2),
    workForCompany: SF4Cost(RamCostConstants.SingularityFn2),
    applyToCompany: SF4Cost(RamCostConstants.SingularityFn2),
    quitJob: SF4Cost(RamCostConstants.SingularityFn2),
    getCompanyRep: SF4Cost(RamCostConstants.SingularityFn2 / 3),
    getCompanyFavor: SF4Cost(RamCostConstants.SingularityFn2 / 3),
    getCompanyFavorGain: SF4Cost(RamCostConstants.SingularityFn2 / 4),
    checkFactionInvitations: SF4Cost(RamCostConstants.SingularityFn2),
    joinFaction: SF4Cost(RamCostConstants.SingularityFn2),
    workForFaction: SF4Cost(RamCostConstants.SingularityFn2),
    getFactionRep: SF4Cost(RamCostConstants.SingularityFn2 / 3),
    getFactionFavor: SF4Cost(RamCostConstants.SingularityFn2 / 3),
    getFactionFavorGain: SF4Cost(RamCostConstants.SingularityFn2 / 4),
    donateToFaction: SF4Cost(RamCostConstants.SingularityFn3),
    createProgram: SF4Cost(RamCostConstants.SingularityFn3),
    commitCrime: SF4Cost(RamCostConstants.SingularityFn3),
    getCrimeChance: SF4Cost(RamCostConstants.SingularityFn3),
    getCrimeStats: SF4Cost(RamCostConstants.SingularityFn3),
    getOwnedAugmentations: SF4Cost(RamCostConstants.SingularityFn3),
    getOwnedSourceFiles: SF4Cost(RamCostConstants.SingularityFn3),
    getAugmentationsFromFaction: SF4Cost(RamCostConstants.SingularityFn3),
    getAugmentationPrereq: SF4Cost(RamCostConstants.SingularityFn3),
    getAugmentationPrice: SF4Cost(RamCostConstants.SingularityFn3 / 2),
    getAugmentationBasePrice: SF4Cost(RamCostConstants.SingularityFn3 / 2),
    getAugmentationRepReq: SF4Cost(RamCostConstants.SingularityFn3 / 2),
    getAugmentationStats: SF4Cost(RamCostConstants.SingularityFn3),
    purchaseAugmentation: SF4Cost(RamCostConstants.SingularityFn3),
    softReset: SF4Cost(RamCostConstants.SingularityFn3),
    installAugmentations: SF4Cost(RamCostConstants.SingularityFn3),
    isFocused: SF4Cost(0.1),
    setFocus: SF4Cost(0.1),
    exportGame: SF4Cost(RamCostConstants.SingularityFn1 / 2),
    exportGameBonus: SF4Cost(RamCostConstants.SingularityFn1 / 4),
    b1tflum3: SF4Cost(16),
    destroyW0r1dD43m0n: SF4Cost(32),
    getCurrentWork: SF4Cost(0.5),
} as const;

// Gang API
const gang = {
    createGang: RamCostConstants.GangApiBase / 4,
    inGang: RamCostConstants.GangApiBase / 4,
    getMemberNames: RamCostConstants.GangApiBase / 4,
    getGangInformation: RamCostConstants.GangApiBase / 2,
    getOtherGangInformation: RamCostConstants.GangApiBase / 2,
    getMemberInformation: RamCostConstants.GangApiBase / 2,
    canRecruitMember: RamCostConstants.GangApiBase / 4,
    recruitMember: RamCostConstants.GangApiBase / 2,
    getTaskNames: RamCostConstants.GangApiBase / 4,
    getTaskStats: RamCostConstants.GangApiBase / 4,
    setMemberTask: RamCostConstants.GangApiBase / 2,
    getEquipmentNames: RamCostConstants.GangApiBase / 4,
    getEquipmentCost: RamCostConstants.GangApiBase / 2,
    getEquipmentType: RamCostConstants.GangApiBase / 2,
    getEquipmentStats: RamCostConstants.GangApiBase / 2,
    purchaseEquipment: RamCostConstants.GangApiBase,
    ascendMember: RamCostConstants.GangApiBase,
    getAscensionResult: RamCostConstants.GangApiBase / 2,
    setTerritoryWarfare: RamCostConstants.GangApiBase / 2,
    getChanceToWinClash: RamCostConstants.GangApiBase,
    getBonusTime: 0,
} as const;

// Bladeburner API
const bladeburner = {
    inBladeburner: RamCostConstants.BladeburnerApiBase / 4,
    getContractNames: RamCostConstants.BladeburnerApiBase / 10,
    getOperationNames: RamCostConstants.BladeburnerApiBase / 10,
    getBlackOpNames: RamCostConstants.BladeburnerApiBase / 10,
    getBlackOpRank: RamCostConstants.BladeburnerApiBase / 2,
    getGeneralActionNames: RamCostConstants.BladeburnerApiBase / 10,
    getSkillNames: RamCostConstants.BladeburnerApiBase / 10,
    startAction: RamCostConstants.BladeburnerApiBase,
    stopBladeburnerAction: RamCostConstants.BladeburnerApiBase / 2,
    getCurrentAction: RamCostConstants.BladeburnerApiBase / 4,
    getActionTime: RamCostConstants.BladeburnerApiBase,
    getActionCurrentTime: RamCostConstants.BladeburnerApiBase,
    getActionEstimatedSuccessChance: RamCostConstants.BladeburnerApiBase,
    getActionRepGain: RamCostConstants.BladeburnerApiBase,
    getActionCountRemaining: RamCostConstants.BladeburnerApiBase,
    getActionMaxLevel: RamCostConstants.BladeburnerApiBase,
    getActionCurrentLevel: RamCostConstants.BladeburnerApiBase,
    getActionAutolevel: RamCostConstants.BladeburnerApiBase,
    getActionSuccesses: RamCostConstants.BladeburnerApiBase,
    setActionAutolevel: RamCostConstants.BladeburnerApiBase,
    setActionLevel: RamCostConstants.BladeburnerApiBase,
    getRank: RamCostConstants.BladeburnerApiBase,
    getSkillPoints: RamCostConstants.BladeburnerApiBase,
    getSkillLevel: RamCostConstants.BladeburnerApiBase,
    getSkillUpgradeCost: RamCostConstants.BladeburnerApiBase,
    upgradeSkill: RamCostConstants.BladeburnerApiBase,
    getTeamSize: RamCostConstants.BladeburnerApiBase,
    setTeamSize: RamCostConstants.BladeburnerApiBase,
    getCityEstimatedPopulation: RamCostConstants.BladeburnerApiBase,
    getCityCommunities: RamCostConstants.BladeburnerApiBase,
    getCityChaos: RamCostConstants.BladeburnerApiBase,
    getCity: RamCostConstants.BladeburnerApiBase,
    switchCity: RamCostConstants.BladeburnerApiBase,
    getStamina: RamCostConstants.BladeburnerApiBase,
    joinBladeburnerFaction: RamCostConstants.BladeburnerApiBase,
    joinBladeburnerDivision: RamCostConstants.BladeburnerApiBase,
    getBonusTime: 0,
} as const;

const infiltration = {
    getPossibleLocations: RamCostConstants.InfiltrationGetLocations,
    getInfiltration: RamCostConstants.InfiltrationGetInfiltrations,
} as const;

// Coding Contract API
const codingcontract = {
    attempt: RamCostConstants.CodingContractBase,
    getContractType: RamCostConstants.CodingContractBase / 2,
    getData: RamCostConstants.CodingContractBase / 2,
    getDescription: RamCostConstants.CodingContractBase / 2,
    getNumTriesRemaining: RamCostConstants.CodingContractBase / 5,
    createDummyContract: RamCostConstants.CodingContractBase / 5,
    getContractTypes: RamCostConstants.CodingContractBase / 5,
} as const;

// Duplicate Sleeve API
const sleeve = {
    getNumSleeves: RamCostConstants.SleeveBase,
    setToIdle: RamCostConstants.SleeveBase,
    setToShockRecovery: RamCostConstants.SleeveBase,
    setToSynchronize: RamCostConstants.SleeveBase,
    setToCommitCrime: RamCostConstants.SleeveBase,
    setToUniversityCourse: RamCostConstants.SleeveBase,
    travel: RamCostConstants.SleeveBase,
    setToCompanyWork: RamCostConstants.SleeveBase,
    setToFactionWork: RamCostConstants.SleeveBase,
    setToGymWorkout: RamCostConstants.SleeveBase,
    getTask: RamCostConstants.SleeveBase,
    getSleeve: RamCostConstants.SleeveBase,
    getSleeveAugmentations: RamCostConstants.SleeveBase,
    getSleevePurchasableAugs: RamCostConstants.SleeveBase,
    purchaseSleeveAug: RamCostConstants.SleeveBase,
    setToBladeburnerAction: RamCostConstants.SleeveBase,
    getSleeveAugmentationPrice: RamCostConstants.SleeveBase,
    getSleeveAugmentationRepReq: RamCostConstants.SleeveBase,
} as const;

// Stanek API
const stanek = {
    giftWidth: RamCostConstants.StanekWidth,
    giftHeight: RamCostConstants.StanekHeight,
    chargeFragment: RamCostConstants.StanekCharge,
    fragmentDefinitions: RamCostConstants.StanekFragmentDefinitions,
    activeFragments: RamCostConstants.StanekPlacedFragments,
    clearGift: RamCostConstants.StanekClear,
    canPlaceFragment: RamCostConstants.StanekCanPlace,
    placeFragment: RamCostConstants.StanekPlace,
    getFragment: RamCostConstants.StanekFragmentAt,
    removeFragment: RamCostConstants.StanekDeleteAt,
    acceptGift: RamCostConstants.StanekAcceptGift,
} as const;

// UI API
const ui = {
    getTheme: 0,
    setTheme: 0,
    resetTheme: 0,
    getStyles: 0,
    setStyles: 0,
    resetStyles: 0,
    getGameInfo: 0,
    clearTerminal: 0,
    windowSize: 0,
} as const;

// Grafting API
const grafting = {
    getAugmentationGraftPrice: 3.75,
    getAugmentationGraftTime: 3.75,
    getGraftableAugmentations: 5,
    graftAugmentation: 7.5,
} as const;

const corporation = {
    hasCorporation: 0, // This one is free
    getConstants: RamCostConstants.Corporation,
    getIndustryData: RamCostConstants.Corporation,
    getMaterialData: RamCostConstants.Corporation,
    issueNewShares: RamCostConstants.Corporation,
    createCorporation: RamCostConstants.Corporation,
    hasUnlockUpgrade: RamCostConstants.Corporation,
    getUnlockUpgradeCost: RamCostConstants.Corporation,
    getUpgradeLevel: RamCostConstants.Corporation,
    getUpgradeLevelCost: RamCostConstants.Corporation,
    getInvestmentOffer: RamCostConstants.Corporation,
    acceptInvestmentOffer: RamCostConstants.Corporation,
    goPublic: RamCostConstants.Corporation,
    bribe: RamCostConstants.Corporation,
    getCorporation: RamCostConstants.Corporation,
    getDivision: RamCostConstants.Corporation,
    expandIndustry: RamCostConstants.Corporation,
    expandCity: RamCostConstants.Corporation,
    unlockUpgrade: RamCostConstants.Corporation,
    levelUpgrade: RamCostConstants.Corporation,
    issueDividends: RamCostConstants.Corporation,
    buyBackShares: RamCostConstants.Corporation,
    sellShares: RamCostConstants.Corporation,
    getBonusTime: 0,
    sellMaterial: RamCostConstants.Corporation,
    sellProduct: RamCostConstants.Corporation,
    discontinueProduct: RamCostConstants.Corporation,
    setSmartSupply: RamCostConstants.Corporation,
    setSmartSupplyUseLeftovers: RamCostConstants.Corporation,
    buyMaterial: RamCostConstants.Corporation,
    bulkPurchase: RamCostConstants.Corporation,
    getWarehouse: RamCostConstants.Corporation,
    getProduct: RamCostConstants.Corporation,
    getMaterial: RamCostConstants.Corporation,
    setMaterialMarketTA1: RamCostConstants.Corporation,
    setMaterialMarketTA2: RamCostConstants.Corporation,
    setProductMarketTA1: RamCostConstants.Corporation,
    setProductMarketTA2: RamCostConstants.Corporation,
    exportMaterial: RamCostConstants.Corporation,
    cancelExportMaterial: RamCostConstants.Corporation,
    purchaseWarehouse: RamCostConstants.Corporation,
    upgradeWarehouse: RamCostConstants.Corporation,
    makeProduct: RamCostConstants.Corporation,
    limitMaterialProduction: RamCostConstants.Corporation,
    limitProductProduction: RamCostConstants.Corporation,
    getUpgradeWarehouseCost: RamCostConstants.Corporation,
    hasWarehouse: RamCostConstants.Corporation,
    hireEmployee: RamCostConstants.Corporation,
    upgradeOfficeSize: RamCostConstants.Corporation,
    throwParty: RamCostConstants.Corporation,
    buyCoffee: RamCostConstants.Corporation,
    hireAdVert: RamCostConstants.Corporation,
    research: RamCostConstants.Corporation,
    getOffice: RamCostConstants.Corporation,
    getHireAdVertCost: RamCostConstants.Corporation,
    getHireAdVertCount: RamCostConstants.Corporation,
    getResearchCost: RamCostConstants.Corporation,
    hasResearched: RamCostConstants.Corporation,
    setAutoJobAssignment: RamCostConstants.Corporation,
    getOfficeSizeUpgradeCost: RamCostConstants.Corporation,
} as const;

/** RamCosts guaranteed to match ns structure 1:1 (aside from args and enums).
 *  An error will be generated if there are missing OR additional ram costs defined.
 *  To avoid errors, define every function in NetscriptDefinition.d.ts and NetscriptFunctions,
 *  and have a ram cost associated here. */
export const RamCosts: RamCostTree<NSFull> = {
    corporation,
    hacknet,
    stock,
    singularity,
    gang,
    bladeburner,
    infiltration,
    codingcontract,
    sleeve,
    stanek,
    ui,
    grafting,

    sprintf: 0,
    vsprintf: 0,
    scan: RamCostConstants.Scan,
    hack: RamCostConstants.Hack,
    hackAnalyzeThreads: RamCostConstants.HackAnalyze,
    hackAnalyze: RamCostConstants.HackAnalyze,
    hackAnalyzeSecurity: RamCostConstants.HackAnalyze,
    hackAnalyzeChance: RamCostConstants.HackAnalyze,
    sleep: 0,
    asleep: 0,
    share: 2.4,
    getSharePower: 0.2,
    grow: RamCostConstants.Grow,
    growthAnalyze: RamCostConstants.GrowthAnalyze,
    growthAnalyzeSecurity: RamCostConstants.GrowthAnalyze,
    weaken: RamCostConstants.Weaken,
    weakenAnalyze: RamCostConstants.WeakenAnalyze,
    print: 0,
    printf: 0,
    tprint: 0,
    tprintf: 0,
    clearLog: 0,
    disableLog: 0,
    enableLog: 0,
    isLogEnabled: 0,
    getScriptLogs: 0,
    hasTorRouter: 0.05,
    nuke: RamCostConstants.PortProgram,
    brutessh: RamCostConstants.PortProgram,
    ftpcrack: RamCostConstants.PortProgram,
    relaysmtp: RamCostConstants.PortProgram,
    httpworm: RamCostConstants.PortProgram,
    sqlinject: RamCostConstants.PortProgram,
    run: RamCostConstants.Run,
    exec: RamCostConstants.Exec,
    spawn: RamCostConstants.Spawn,
    kill: RamCostConstants.Kill,
    killall: RamCostConstants.Kill,
    exit: 0,
    atExit: 0,
    scp: RamCostConstants.Scp,
    ls: RamCostConstants.Scan,
    ps: RamCostConstants.Scan,
    getRecentScripts: RamCostConstants.RecentScripts,
    hasRootAccess: RamCostConstants.HasRootAccess,
    getHostname: RamCostConstants.GetHostname,
    getHackingLevel: RamCostConstants.GetHackingLevel,
    getHackingMultipliers: 0.25,
    getHacknetMultipliers: 0.25,
    getBitNodeMultipliers: 4,
    getServer: 2,
    getServerMoneyAvailable: RamCostConstants.GetServer,
    getServerSecurityLevel: RamCostConstants.GetServer,
    getServerBaseSecurityLevel: RamCostConstants.GetServer,
    getServerMinSecurityLevel: RamCostConstants.GetServer,
    getServerRequiredHackingLevel: RamCostConstants.GetServer,
    getServerMaxMoney: RamCostConstants.GetServer,
    getServerGrowth: RamCostConstants.GetServer,
    getServerNumPortsRequired: RamCostConstants.GetServer,
    getServerMaxRam: RamCostConstants.GetServerMaxRam,
    getServerUsedRam: RamCostConstants.GetServerUsedRam,
    serverExists: RamCostConstants.GetServer,
    fileExists: RamCostConstants.FileExists,
    isRunning: RamCostConstants.IsRunning,
    getPurchasedServerLimit: RamCostConstants.GetPurchasedServerLimit,
    getPurchasedServerMaxRam: RamCostConstants.GetPurchasedServerMaxRam,
    getPurchasedServerCost: RamCostConstants.GetPurchaseServer,
    getPurchasedServerUpgradeCost: 0.1,
    upgradePurchasedServer: 0.25,
    renamePurchasedServer: 2,
    purchaseServer: RamCostConstants.PurchaseServer,
    deleteServer: RamCostConstants.PurchaseServer,
    getPurchasedServers: RamCostConstants.PurchaseServer,
    write: 0,
    tryWritePort: 0,
    read: 0,
    peek: 0,
    clear: 0,
    writePort: 0,
    readPort: 0,
    getPortHandle: 0,
    rm: RamCostConstants.ReadWrite,
    scriptRunning: RamCostConstants.ArbScript,
    scriptKill: RamCostConstants.ArbScript,
    getScriptName: 0,
    getScriptRam: RamCostConstants.GetScript,
    getHackTime: RamCostConstants.GetHackTime,
    getGrowTime: RamCostConstants.GetHackTime,
    getWeakenTime: RamCostConstants.GetHackTime,
    getTotalScriptIncome: RamCostConstants.GetScript,
    getScriptIncome: RamCostConstants.GetScript,
    getTotalScriptExpGain: RamCostConstants.GetScript,
    getScriptExpGain: RamCostConstants.GetScript,
    getRunningScript: RamCostConstants.GetRunningScript,
    formatNumber: 0,
    formatRam: 0,
    formatPercent: 0,
    nFormat: 0,
    tFormat: 0,
    getTimeSinceLastAug: RamCostConstants.GetHackTime,
    prompt: 0,
    wget: 0,
    getFavorToDonate: RamCostConstants.GetFavorToDonate,
    getPlayer: RamCostConstants.SingularityFn1 / 4,
    getMoneySources: RamCostConstants.GetMoneySourcesCost,
    mv: 0,
    tail: 0,
    toast: 0,
    moveTail: 0,
    resizeTail: 0,
    closeTail: 0,
    clearPort: 0,
    openDevMenu: 0,
    alert: 0,
    flags: 0,
    exploit: 0,
    bypass: 0,
    alterReality: 0,
    rainbow: 0,
    heart: { break: 0 },
    iKnowWhatImDoing: 0,
    //printRaw: 0,

    formulas: {
        mockServer: 0,
        mockPlayer: 0,
        mockPerson: 0,
        reputation: {
            calculateFavorToRep: 0,
            calculateRepToFavor: 0,
            repFromDonation: 0,
        },
        skills: {
            calculateSkill: 0,
            calculateExp: 0,
        },
        hacking: {
            hackChance: 0,
            hackExp: 0,
            hackPercent: 0,
            growPercent: 0,
            growThreads: 0,
            hackTime: 0,
            growTime: 0,
            weakenTime: 0,
        },
        hacknetNodes: {
            moneyGainRate: 0,
            levelUpgradeCost: 0,
            ramUpgradeCost: 0,
            coreUpgradeCost: 0,
            hacknetNodeCost: 0,
            constants: 0,
        },
        hacknetServers: {
            hashGainRate: 0,
            levelUpgradeCost: 0,
            ramUpgradeCost: 0,
            coreUpgradeCost: 0,
            cacheUpgradeCost: 0,
            hashUpgradeCost: 0,
            hacknetServerCost: 0,
            constants: 0,
        },
        gang: {
            wantedPenalty: 0,
            respectGain: 0,
            wantedLevelGain: 0,
            moneyGain: 0,
            ascensionPointsGain: 0,
            ascensionMultiplier: 0,
        },
        work: {
            crimeSuccessChance: 0,
            crimeGains: 0,
            gymGains: 0,
            universityGains: 0,
            factionGains: 0,
            companyGains: 0,
        },
    },
} as const;

export function getRamCost(...args: string[]): number {
    if (args.length === 0) {
        console.warn(`No arguments passed to getRamCost()`);
        return 0;
    }

    let curr = RamCosts[args[0] as keyof typeof RamCosts];
    for (let i = 1; i < args.length; ++i) {
        if (curr == null) {
            console.warn(`Invalid function passed to getRamCost: ${args}`);
            return 0;
        }

        const currType = typeof curr;
        if (currType === "function" || currType === "number") {
            break;
        }

        curr = curr[args[i] as keyof typeof curr];
    }

    if (typeof curr === "number") {
        return curr;
    }

    if (typeof curr === "function") {
        return curr();
    }

    console.warn(`Unexpected type (${curr}) for value [${args}]`);
    return 0;
}