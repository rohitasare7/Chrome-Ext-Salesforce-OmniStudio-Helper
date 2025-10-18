// Get SF host domain suffix
export const extractValue = (url) => {
    const prodPattern = /https:\/\/([^.]+)\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const prodMatch = url.match(prodPattern);
    if (prodMatch) {
        return prodMatch[1];
    }

    const sandboxPattern = /https:\/\/([^.]+)\.sandbox\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const sandboxMatch = url.match(sandboxPattern);
    if (sandboxMatch) {
        return sandboxMatch[1];
    }

    const devPattern = /https:\/\/([^.]+)\.develop\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const devMatch = url.match(devPattern);
    if (devMatch) {
        return devMatch[1];
    }

    const trailblazePattern = /https:\/\/([^-]+)-([^.]+)\.trailblaze\.(lightning\.force\.com|my\.salesforce\.com|vf\.force\.com|my\.site\.com)$/;
    const trailblazeMatch = url.match(trailblazePattern);
    if (trailblazeMatch) {
        return trailblazeMatch[2];
    }

    return null;
}
 
const directLinkList = [
    {
        id: 1,
        obj: 'OmniScript',
        omnistudio: `.vf.force.com/lightning/cmp/omnistudio__OmniDesignerAuraWrapper?c__recordId=`,
        vlocity_cmt: `.vf.force.com/lightning/cmp/vlocity_cmt__OmniDesignerAuraWrapper?c__recordId=`,
    },
    {
        id: 2,
        obj: 'IntegrationProcedure',
        omnistudio: `.vf.force.com/apex/omnistudio__integrationproceduredesigner?id=`,
        vlocity_cmt: `.vf.force.com/apex/vlocity_cmt__integrationproceduredesigner?id=`,
    },
    {
        id: 3,
        obj: 'FlexCard',
        omnistudio: `/lightning/r/OmniUiCard/`,
        vlocity_cmt: `/lightning/r/vlocity_cmt__VlocityCard__c/`,
    },
    {
        id: 4,
        obj: 'DataRaptor',
        omnistudio: `.vf.force.com/apex/omnistudio__drmapper?id=`,
        vlocity_cmt: `.vf.force.com/apex/vlocity_cmt__drmapper?id=`,
    }

];

const getRecordLink = (nameSpace, obj) => {
    const item = directLinkList.find(query => query.obj === obj);
    if (item) {
        return item[nameSpace];
    }
    return null;
};

// Get Org Suffix URL with VF Force
export const getOrgSuffixURL = (orgIdentifier, recId, type, sfHostURL, savedNamespace) => {
    let sandboxSuffix = '';
    let orgNS = 'vlocity-cmt'; //domain suffix namespace

    //check if its sandbox
    let isSandbox = localStorage.getItem(sfHostURL + "_" + 'isSandbox') == 'false' ? false : true;
    if (isSandbox) {
        sandboxSuffix = '.sandbox';
    }
    //Setting namespace for omnistudio
    if (savedNamespace && savedNamespace == 'omnistudio') {
        orgNS = 'omnistudio';
    }

    switch (type) {
        case 'OmniScript':
        case 'DataRaptor':
        case 'IntegrationProcedure':
            return `https://${orgIdentifier}--${orgNS}${sandboxSuffix}${getRecordLink(savedNamespace, type)}${recId}`;
        case 'FlexCard':
            return `https://${sfHostURL}${getRecordLink(savedNamespace, type)}${recId}/view`;
        default:
            return null;
    }
};

export const getSalesforceURL = (orgIdentifier, sfHostURL, recId, type) => {
    // console.log('sfHostURL ==> ' + sfHostURL);
    const savedNamespace = localStorage.getItem(sfHostURL + "_" + 'ns');
    return getOrgSuffixURL(orgIdentifier, recId, type, sfHostURL, savedNamespace);
};

// omnistudio = standard , vlocity_cmt = vlocity managed package omnistudio
const omniStudioQueryList = [
    {
        id: 1,
        obj: 'OmniScript',
        omnistudio: `/query/?q=SELECT+Id,Name,IsActive,VersionNumber,Type,SubType,LastModifiedDate,LastModifiedBy.Name+FROM+OmniProcess+WHERE+IsActive=TRUE+AND+OmniProcessType='OmniScript'+ORDER+BY+LastModifiedDate+DESC`,
        vlocity_cmt: `/query/?q=SELECT+Id,Name,vlocity_cmt__Version__c,vlocity_cmt__Type__c,vlocity_cmt__SubType__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__OmniScript__c+WHERE+vlocity_cmt__IsActive__c=TRUE+AND+vlocity_cmt__OmniProcessType__c='OmniScript'+ORDER+BY+LastModifiedDate+DESC`,
    },
    {
        id: 2,
        obj: 'IntegrationProcedure',
        omnistudio: `/query/?q=SELECT+Id,Name,IsActive,VersionNumber,Type,SubType,LastModifiedDate,LastModifiedBy.Name+FROM+OmniProcess+WHERE+IsActive=TRUE+AND+OmniProcessType='Integration Procedure'+ORDER+BY+LastModifiedDate+DESC`,
        vlocity_cmt: `/query/?q=SELECT+Id,Name,vlocity_cmt__Version__c,vlocity_cmt__Type__c,vlocity_cmt__SubType__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__OmniScript__c+WHERE+vlocity_cmt__IsActive__c=TRUE+AND+vlocity_cmt__OmniProcessType__c='Integration Procedure'+ORDER+BY+LastModifiedDate+DESC`,
    },
    {
        id: 3,
        obj: 'FlexCard',
        omnistudio: `/query/?q=SELECT+Id,Name,IsActive,VersionNumber,LastModifiedDate,LastModifiedBy.Name+FROM+OmniUiCard+WHERE+IsActive=TRUE+ORDER+BY+LastModifiedDate+DESC`,
        vlocity_cmt: `/query/?q=SELECT+Id,Name,vlocity_cmt__Version__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__VlocityCard__c+WHERE+vlocity_cmt__Active__c=TRUE+ORDER+BY+LastModifiedDate+DESC`,
    },
    {
        id: 4,
        obj: 'DataRaptor',
        omnistudio: `/query/?q=SELECT+Id,Name,Type,LastModifiedDate,LastModifiedBy.Name+FROM+OmniDataTransform+ORDER+BY+LastModifiedDate`,
        vlocity_cmt: `/query/?q=SELECT+Id,Name,vlocity_cmt__Type__c,LastModifiedBy.Name,LastModifiedDate+FROM+vlocity_cmt__DRBundle__c+ORDER+BY+LastModifiedDate`,
    }

];

export const getComponentQuery = (nameSpace, obj) => {
    const item = omniStudioQueryList.find(query => query.obj === obj);
    if (item) {
        return item[nameSpace];
    }
    return null;
};
